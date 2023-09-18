import { NextResponse } from 'next/server'
import Cors from 'cors'
import fs from 'fs'
import {resolve} from 'path'
import axios from 'axios'

const cors = Cors({
    methods: ['POST', 'GET']
})

const url : string = "https://sdk.photoroom.com/v1/segment"

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
/* function runMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    fn: Function
  ) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result)
            }

            return resolve(result)
        })
    })
} */

async function processImage(absfilepath: string){
    const formData = new FormData();
    formData.append('image_file', absfilepath);
    formData.append('format', 'png');

    var object: any = {};
    formData.forEach((value, key) => object[key] = value);
    var json = JSON.stringify(object);
    const body = JSON.stringify(formData)
    console.log(json)
    
    
    if(process.env.API_KEY){
        const options: RequestInit = {
            method: 'POST',
            headers: {
                "Accept": "image/png, image/jpg, image/jpeg, application/json",
                "Content-Type": "multipart/form-data",
                "x-api-key": process.env.API_KEY
            },
            body: json

        }
        
        const res = await fetch(url, options);
        return res.json()
    }else{

    }
    
}

export async function POST(req: Request) {
    // Run the middleware
    
    const formData = await req.formData()
    const entries = Array.from(formData.values())
    const apiRsults = []
    //console.log(formData)
    //console.log(entries)

    for (const entry of entries) {
        if (entry && typeof entry === "object" && "arrayBuffer" in entry) {
            const file = entry as unknown as Blob;
            const buffer = Buffer.from(await file.arrayBuffer());

            const photoroomForm = new FormData()
            photoroomForm.append("format", "png");
            photoroomForm.append("image_file", file, "raw");

            const phRes = await axios({
                method: "post",
                url: url,
                data: photoroomForm,
                responseType: "arraybuffer",
                headers: {
                    "Accept": `${file.type}, application/json`,
                    "Content-Type": "multipart/form-data",
                    "x-api-key": process.env.API_KEY
                }
            });

            if (phRes.status !== 200) {
                //return console.error("Error:", phRes.status, phRes.statusText);
                apiRsults.push({file: file.name, errorStatus: phRes.status, errorMessage: phRes.statusText})
            }

            fs.writeFileSync(`public/processed/${file.name}`, phRes.data);

            //fs.writeFileSync(`public/images/${file.name}`, buffer);
            //const filepath = resolve(`public/images/${file.name}`)
            //console.log('filepath: ', filepath)
            //const photoRes = await processImage('@' + filepath)
            
        }
    }

    return NextResponse.json({ success: true, entries: entries, apiResults: apiRsults, cwd: process.cwd() });
}
