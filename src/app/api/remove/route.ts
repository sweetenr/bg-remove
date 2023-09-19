import { NextResponse } from 'next/server'
import fs from 'fs'
import axios from 'axios'

/*  */

/**
 * this server-side works nicely, but Socket.io does not work well with next.js, 
 * so moving to do this from client-side, where we can update use about progress
 */

const url : string = "https://sdk.photoroom.com/v1/segment"

export async function POST(req: Request) {
    const formData = await req.formData()
    const entries = Array.from(formData.values())
    const apiRsults = []

    for (const entry of entries) {
        if (entry && typeof entry === "object" && "arrayBuffer" in entry) {
            const file = entry as unknown as Blob;
            //const buffer = Buffer.from(await file.arrayBuffer());

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
            
        }
    }

    return NextResponse.json({ success: true, entries: entries, apiResults: apiRsults, cwd: process.cwd() });
}
