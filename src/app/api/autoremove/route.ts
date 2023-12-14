import { NextResponse } from 'next/server'
import {join} from 'path'
import { readdirSync, renameSync, createWriteStream, createReadStream, unlinkSync, writeFileSync } from 'fs'
import https from 'https'
import * as im from 'imagemagick'

let queue: any[] = []
let newPaths: any = []
let apiRsults: any = []
let total: number = 0
let count: number = 0
let progress: number = 0

export function* readAllFiles(dir: string): Generator<string> {
    const files = readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        if (file.isDirectory()) {
            yield* readAllFiles(join(dir, file.name));
        } else {
            yield join(dir, file.name);
        }
    }
}

export function removeBackground(imagePath: string, savePath: string): Promise<{oldFilePath: string, message: string}|unknown> {
    return new Promise((resolve: any, reject) => {
        const boundary = '--------------------------' + Date.now().toString(16);
        
        const postOptions = {
            hostname: 'sdk.photoroom.com',
            path: '/v1/segment',
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'X-API-Key': process.env.API_KEY
            }
        };

        const req = https.request(postOptions, (res: any) => {
            // Check if the response is an image
            const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'].includes(res.headers['content-type']);

            if (!isImage) {
                console.log(res.headers['content-type'])
                let errorData = '';
                res.on('data', (chunk: any) => errorData += chunk);
                res.on('end', () => reject(new Error(`Expected an image response, but received: ${errorData}`)));
                return;
            }

            // Create a write stream to save the image
            const fileStream = createWriteStream(savePath);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                resolve({oldFilePath: imagePath, message: `Image saved to ${savePath}`});
            });

            fileStream.on('error', (error) => {
                reject(new Error(`Failed to save the image: ${error.message}`));
            });
        });

        req.on('error', (error: any) => {
            reject(error);
        });

        // Write form data
        req.write(`--${boundary}\r\n`);
        req.write(`Content-Disposition: form-data; name="image_file"; filename="${imagePath.split('/').pop()}"\r\n`);
        req.write('Content-Type: image/jpg, image/jpeg, image/png\r\n\r\n'); // assuming JPEG, adjust if another format is used

        const uploadStream = createReadStream(imagePath);
        uploadStream.on('end', () => {
            req.write('\r\n');
            req.write(`--${boundary}--\r\n`);
            req.end();
        });
        
        uploadStream.pipe(req, { end: false });
    });
}

export function runQueue() {
    if(queue.length){
        const item: string = queue.pop()
        const newPath: string = newPaths.pop()

        // special considerations for PNG files
        if(item.includes('.png')) {
            im.identify(['-format', '%[opaque]', item], (err, opaque) => {
                console.log('png opaque: ', opaque + ' -- ' + item)
                if(opaque === 'False' || opaque == undefined){
                    renameSync(item, newPath)
                    apiRsults.push('renamed: ', newPath)
                    //console.log('renamed: ', newPath)
                    count++
                    progress = (count / total) * 100
                    console.log(`${progress.toFixed(2)}% -- ${count}/${total} -- ${queue.length} left`)
                    runQueue()

                }else{
                    removeBackground(item, newPath)
                        .then((res: any) => {
                            // delete old file
                            unlinkSync(res.oldFilePath)
                            apiRsults.push({opaquepng: res.message})
                            //console.log(res.message)
                            count++
                            progress = (count / total) * 100
                            console.log(`${progress.toFixed(2)}% -- ${count}/${total} -- ${queue.length} left`)

                            runQueue()
                        })
                        .catch(error => {
                            apiRsults.push({error:error})
                            count++
                            progress = (count / total) * 100
                            console.log(`${progress.toFixed(2)}% -- ${count}/${total} -- ${queue.length} left`)

                            runQueue()
                        });
                }
            })
        }else{
            //console.log('jpeg: ', entries[i])
            removeBackground(item, newPath)
                .then((res: any) => {
                    // delete old file
                    unlinkSync(res.oldFilePath)
                    apiRsults.push(res.message)
                    count++
                    progress = (count / total) * 100
                    console.log(`${progress.toFixed(2)}% -- ${count}/${total} -- ${queue.length} left`)

                    runQueue()
                })
                .catch(error => {
                    apiRsults.push({error:error})
                    count++
                    progress = (count / total) * 100
                    console.log(`${progress.toFixed(2)}% -- ${count}/${total} -- ${queue.length} left`)

                    runQueue()
                });
        }
    }else{
        const d = new Date()
        writeFileSync(`public/processed/${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}${d.getHours()}${d.getMinutes()}${d.getSeconds()}_results.json`, JSON.stringify(apiRsults))
        console.log('COMPLETE')
    }
}

export async function POST(req: Request) {
    //reset arrays
    queue = []
    newPaths = []
    apiRsults = []
    total = 0
    count = 0
    progress = 0

    // This will get us a list of ALL png/jpg files in ALL folders in public/unprocessed
    console.log('read files..')
    for (const file of readAllFiles('public/unprocessed')) {
        if( file.includes('.jpeg') || 
            file.includes('.jpg') || 
            file.includes('.png') ||
            file.includes('.JPEG') || 
            file.includes('.JPG') ||
            file.includes('.PNG')
            ){
            queue.push(file)
            total++
        }
    }

    console.log(`${total} files read`)

    console.log('new path names..')
    for (const i in queue) {
        const split: string[] = queue[i].split('.')
        const popped = split.pop()
        const newName = split.join('.').concat('_pc.png')
        newPaths.push(newName)
    }

    // process all images
    console.log('run queue..')
    runQueue()

    return NextResponse.json({ queue: queue, newPaths: newPaths });
}
