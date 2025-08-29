import React, { useState } from 'react';
import { Spinner } from './Spinner';
import { SparklesIcon } from './icons/SparklesIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import { ResetIcon } from './icons/ResetIcon';

interface ResultViewerProps {
    loading: boolean;
    error: string | null;
    resultImage: string | null;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ loading, error, resultImage }) => {
    const [zoom, setZoom] = useState(1);

    const handleDownload = () => {
        if (!resultImage) return;
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = 'virtual-try-on-result.jpeg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full relative">
            <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 overflow-hidden">
                {loading && <Spinner />}
                {error && !loading && (
                    <div className="text-center text-red-400 p-4">
                        <p className="font-semibold">An Error Occurred</p>
                        <p>{error}</p>
                    </div>
                )}
                {!loading && !error && resultImage && (
                    <img 
                        src={resultImage} 
                        alt="Generated try-on result" 
                        className="object-contain w-full h-full transition-transform duration-300"
                        style={{ transform: `scale(${zoom})`}}
                    />
                )}
                {!loading && !error && !resultImage && (
                    <div className="text-center text-gray-500 p-4">
                        <SparklesIcon className="w-16 h-16 mx-auto mb-4 opacity-20"/>
                        <h3 className="font-semibold text-lg">Your Result Will Appear Here</h3>
                        <p className="text-sm">Upload both images and click the button to start.</p>
                    </div>
                )}
            </div>

            {resultImage && !loading && !error && (
                <div className="absolute bottom-3 left-3 right-3 flex justify-center items-center gap-2">
                    <div className="bg-gray-900/70 backdrop-blur-sm rounded-full p-1 flex items-center gap-1 border border-gray-700">
                         <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} title="Zoom Out" className="p-2 rounded-full hover:bg-white/20 transition-colors">
                            <ZoomOutIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => setZoom(1)} title="Reset Zoom" className="p-2 rounded-full hover:bg-white/20 transition-colors">
                            <ResetIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} title="Zoom In" className="p-2 rounded-full hover:bg-white/20 transition-colors">
                            <ZoomInIcon className="w-5 h-5" />
                        </button>
                        <div className="w-px h-5 bg-gray-600 mx-1"></div>
                        <button onClick={handleDownload} title="Download Image" className="p-2 rounded-full hover:bg-white/20 transition-colors">
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
