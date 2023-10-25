import { NextResponse } from 'next/server'
import {join} from 'path'
import { readdirSync, renameSync, createWriteStream, createReadStream } from 'fs'
import https from 'https'
import * as im from 'imagemagick'

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
            const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(res.headers['content-type']);

            if (!isImage) {
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

export async function POST(req: Request) {
    const apiRsults: any = []
    const entries: any = []

    // This will get us a list of ALL png/jpg files in ALL folders in public/unprocessed
    for (const file of readAllFiles('public/unprocessed')) {
        if(file.includes('.jpeg') || file.includes('.jpg') || file.includes('.png')){
            entries.push(file)
        }
    }

    const newPaths: any = []
    for (const i in entries) {
        const split: string[] = entries[i].split('.')
        const popped = split.pop()
        const newName = split.join('.').concat('_pc.png')
        newPaths.push(newName)
    }

    // process all images

    for (const i in entries) {

        // special considerations for PNG files
        if(entries[i].includes('.png')) {
            im.identify(['-format', '%[opaque]', entries[i]], (err, opaque) => {
                //console.log('png opaque: ', opaque + ' -- ' + entries[i])
                if(opaque === 'False'){
                    renameSync(entries[i], newPaths[i])
                    console.log('renamed: ', newPaths[i])
                }else{
                    removeBackground(entries[i], newPaths[i])
                        .then((res: any) => {
                            // delete old file
                            //unlinkSync(res.oldFilePath)

                            console.log(res.message);
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                }
            })
        }else{
            //console.log('jpeg: ', entries[i])
            removeBackground(entries[i], newPaths[i])
                .then((res: any) => {
                    // delete old file
                    //unlinkSync(res.oldFilePath)

                    console.log(res.message);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }

    return NextResponse.json({ entries: entries, newPaths: newPaths, apiErrors: apiRsults, cwd: process.cwd() });
}
