import { NextResponse } from 'next/server'
import fs from 'fs'

export async function POST(req: Request) {
    const formData = await req.formData()
    const entries = Array.from(formData.values())

    for (const entry of entries) {
        if (entry && typeof entry === "object" && "arrayBuffer" in entry) {
            const file = entry as unknown as Blob;
            console.log(file)
            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(`public/processed/${file.name}`, buffer);
            
        }
    }

    return NextResponse.json({ success: true, entries: entries, form: formData });
}
