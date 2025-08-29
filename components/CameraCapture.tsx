import React, { useRef, useEffect, useCallback, useState } from 'react';
import { CameraIcon } from './icons/CameraIcon';

interface CameraCaptureProps {
    onCapture: (imageSrc: string) => void;
    onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    useEffect(() => {
        const startStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'user' },
                    audio: false 
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
                setError("Could not access the camera. Please check permissions and try again.");
            }
        };

        startStream();

        return () => {
            stopStream();
        };
    }, [stopStream]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if(context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                onCapture(dataUrl);
                stopStream();
            }
        }
    };

    if (error) {
        return <div className="text-red-400 p-4 text-center">{error}</div>;
    }

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden mb-4">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-4 w-full">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleCapture}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <CameraIcon className="w-5 h-5"/>
                    Capture
                </button>
            </div>
        </div>
    );
};
