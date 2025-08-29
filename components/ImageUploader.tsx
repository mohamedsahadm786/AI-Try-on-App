import React, { useState } from 'react';
import { PaintBrushIcon } from './icons/PaintBrushIcon';

interface ImageUploaderProps {
  title: string;
  onUploadClick: () => void;
  onClear: () => void;
  onEditRequest: (aspect?: number) => void;
  icon: React.ReactNode;
  currentImage: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onUploadClick, onClear, onEditRequest, icon, currentImage }) => {
  const [isEditBarVisible, setIsEditBarVisible] = useState(false);

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditBarVisible(false);
      onClear();
  }

  const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditBarVisible(prev => !prev);
  }

  const handleCropRequest = (e: React.MouseEvent, aspect?: number) => {
      e.stopPropagation();
      onEditRequest(aspect);
      setIsEditBarVisible(false);
  }

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-semibold text-center mb-4">{title}</h2>
      <div 
        onClick={onUploadClick}
        className="relative aspect-square w-full bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-indigo-500 transition-all duration-300 cursor-pointer group overflow-hidden"
        role="button"
        aria-label={`Upload ${title}`}
      >
        {currentImage ? (
          <>
            <img src={currentImage} alt={title} className="object-contain w-full h-full" />
            
            {/* Overlay for changing image */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white font-semibold">Change Image</p>
            </div>

            {/* Clear Button */}
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors z-20"
              title="Clear image"
              aria-label="Clear image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Edit Button */}
            <button
              onClick={handleEditClick}
              className="absolute top-2 left-2 bg-black/50 text-white rounded-full p-2 hover:bg-indigo-600 transition-colors z-20 flex items-center gap-1.5"
              title="Edit image"
              aria-label="Edit image"
            >
              <PaintBrushIcon className="w-4 h-4" />
            </button>

            {/* Edit Toolbar */}
            {isEditBarVisible && (
                <div 
                    className="absolute top-12 left-2 bg-gray-900/80 backdrop-blur-sm rounded-lg p-1 flex flex-col items-start gap-1 border border-gray-700 z-10 animate-fade-in-fast"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={(e) => handleCropRequest(e, 1)} className="text-left w-full text-sm px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">Crop 1:1</button>
                    <button onClick={(e) => handleCropRequest(e, undefined)} className="text-left w-full text-sm px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">Crop Free</button>
                </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 pointer-events-none">
            <div className="w-16 h-16 mx-auto mb-2 text-gray-400 group-hover:text-indigo-400 transition-colors duration-300">
              {icon}
            </div>
            <p className="font-semibold">Click to upload</p>
            <p className="text-xs">Or take a photo</p>
          </div>
        )}
      </div>
    </div>
  );
};