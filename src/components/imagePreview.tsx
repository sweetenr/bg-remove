// components/ImagePreview.tsx
import React from "react";
import Image from "next/image";
import styles from "./imagePreview.module.css"

type Props = {
    images: File[];
};

const ImagePreview = ({ images }: Props) => {
    return (
    <div>
        <div className={styles.imagegrid}>
        {images.map((image) => {
            const src = URL.createObjectURL(image);
            return (
            <div className={styles.tile} key={image.name}>
                <Image src={src} alt={image.name} className="object-cover" fill />
            </div>
            );
        })}
        </div>
    </div>
    );
};

export default ImagePreview;
