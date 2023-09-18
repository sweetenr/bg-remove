"use client"; // Make this component a client component
// components/FileUploadForm.tsx
import React, { FormEvent, useState } from "react";
import styles from './FileUploadForm.module.css'
import CustomFileSelector from "./CustomFileSelector";
import ImagePreview from "./imagePreview";
import axios from "axios";

const FileUploadForm = () => {
    const [images, setImages] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    
    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
        //convert `FileList` to `File[]`
            const _files = Array.from(e.target.files);
            setImages(_files);
        }
    };

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

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.input}>
                <CustomFileSelector
                    accept="image/png, image/jpeg"
                    onChange={handleFileSelected}
                />
                <button type="submit">Upload</button>
            </div>
            <ImagePreview images={images} />
        </form>
    );
};

export default FileUploadForm;
