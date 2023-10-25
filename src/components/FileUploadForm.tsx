"use client";
import React, { FormEvent, useState, useEffect } from "react";
import styles from './FileUploadForm.module.css'
import CustomFileSelector from "./CustomFileSelector";
import ImagePreview from "./imagePreview";
import axios from "axios";

const FileUploadForm = () => {
    const [images, setImages] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    // State to store the messages
    const [messages, setMessages] = useState('');
    const [progress, setProgress] = useState(0);
    
    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
        //convert `FileList` to `File[]`
            const _files = Array.from(e.target.files);
            setImages(_files);
        }
    };

    /**
     * This function simply sends the files to /api/remove to process/write 
     * images like the photoroom function below, but b/c next.js 13.4 hates socket.io.. 
     * we can't close out the request (to avoid a timeout) and inform the user about progress via websockets,
     * so I'm moving to a more client-side approach
     * 
     * @param e 
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData: FormData = new FormData();

        images.forEach((image, i) => {
            formData.append(image.name, image)
        })

        setUploading(true)
        const res = await axios.post("/api/remove", formData)
        console.log(res)
        setUploading(false)
    }

    
    const handleAutoRemove =async (e: FormEvent<HTMLAnchorElement>) => {
        e.preventDefault()

        const res = await axios.post('api/autoremove')
        console.log(res)

    }

    /**
     * This function does the following:
     * - loops thru the list of image files from the upload form
     * - - submits the image to the photoroom remove background API
     * - - converts the blob response from the API to a new File
     * - - submits a new multipart form to /api/write to store the new file in /public/processed folder locally
     * 
     * @param e FormEvent<HTMLFormElement>
     */
    const photoroom = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setUploading(true)

        images.forEach(async(image, i) => {
            const formData: FormData = new FormData();
            formData.append("format", "png");
            formData.append("image_file", image);

            const response = await fetch("https://sdk.photoroom.com/v1/segment", {
                method: "POST",
                headers: {
                    "x-api-key": "dfc80fb084b6fcb0da302901b2aaa95363c8290e"
                },
                body: formData
            });

            const writeData: FormData = new FormData();
            const outputBlob: Blob = await response.blob();
            const newFile: File = new File([outputBlob], image.name, {lastModified: Date.now(), type: 'image/png'});

            writeData.append(newFile.name, newFile)
            await axios.post("/api/write", writeData)
        })

        setUploading(false)
    }

    return (
        <div className={styles.parent}>
            <form className={styles.form} onSubmit={photoroom}>
                <div className={styles.input}>
                    <CustomFileSelector
                        accept="image/png, image/jpeg"
                        onChange={handleFileSelected}
                    />
                    <button type="submit">Upload</button>
                </div>
                <ImagePreview images={images} />
            </form>

            <a className={styles.doit} href="#" onClick={handleAutoRemove}>Do it!</a>
        </div>
    );
};

export default FileUploadForm;
