import { NextResponse } from 'next/server'
import {join} from 'path'
import { readdirSync, renameSync, createWriteStream, createReadStream, unlinkSync, writeFileSync, cpSync } from 'fs'
import https from 'https'
import * as im from 'imagemagick'

let queue: any[] = []
let success: any[] = []
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

export function convertQueueToPng() {
    if(queue.length){
        const item: string = queue.pop()
        const convertPath = item.includes('jpeg') ? item.replace('jpeg', 'png') : item.replace('jpg', 'png')
        console.log('to -> ', convertPath)

        if(item.includes('jpg') || item.includes('jpeg')){
            im.convert([item, convertPath], (err, stdout) => {
                if(err){
                    throw err
                }

                console.log('stdout: ', stdout)
                unlinkSync(item)
                count++
                progress = (count / total) * 100
                console.log(`${progress.toFixed(2)}% -- ${count}/${total} -- ${queue.length} left`)
                convertQueueToPng()
            })
        }else{
            convertQueueToPng()
        }

    }else{
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
    success = []
    let sucessTotal = 0

    // This will get us a list of ALL png/jpg files in ALL folders in public/unprocessed
    console.log('read jpg files..')
    for (const file of readAllFiles('public/unprocessed')) {
        if(file.includes('.jpeg') || 
            file.includes('.jpg') || 
            file.includes('.JPEG') || 
            file.includes('.JPG')
            ){
            queue.push(file)
            total++
        }
    }

    console.log(`${total} files read`)

    console.log('read jpg files..')
    for (const file of readAllFiles('public/unprocessed')) {
        if(file.includes('.png') || 
            file.includes('.PNG')
            ){
            success.push(file)
            sucessTotal++
        }
    }

    console.log('new path names..')
    for (const i in queue) {
        const split: string[] = queue[i].split('.')
        const popped = split.pop()
        const newName = split.join('.').concat('_pc.png')
        newPaths.push(newName)
    }

    console.log('convert queue to png\'s...')
    convertQueueToPng()
    return NextResponse.json({ queue: queue, newPaths: newPaths });
}
