import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { CropIcon } from './icons/CropIcon';

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
    aspect?: number;
}

function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<string> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return Promise.reject(new Error('Failed to get 2D context'));
    }

    ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
    );

    return new Promise((resolve) => {
        resolve(canvas.toDataURL('image/jpeg', 0.9));
    });
}


export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel, aspect }) => {
    const [crop, setCrop] = useState<Crop>();
    const imgRef = useRef<HTMLImageElement>(null);

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const newCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                aspect || width / height,
                width,
                height
            ),
            width,
            height
        );
        setCrop(newCrop);
    };

    const handleCrop = async () => {
        if (imgRef.current && crop?.width && crop?.height) {
            try {
                const croppedImage = await getCroppedImg(imgRef.current, crop);
                onCropComplete(croppedImage);
            } catch (e) {
                console.error("Cropping failed: ", e);
            }
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="max-h-[60vh] overflow-auto mb-4 bg-gray-900 rounded-lg">
                 <ReactCrop
                    crop={crop}
                    onChange={c => setCrop(c)}
                    aspect={aspect}
                    minWidth={100}
                    minHeight={100}
                >
                    <img ref={imgRef} src={imageSrc} onLoad={onImageLoad} alt="Crop preview" style={{maxHeight: '60vh'}}/>
                </ReactCrop>
            </div>
           
            <div className="flex gap-4 w-full">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleCrop}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <CropIcon className="w-5 h-5"/>
                    Crop Image
                </button>
            </div>
        </div>
    );
};