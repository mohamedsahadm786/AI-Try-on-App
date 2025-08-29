import React, { useState, useCallback, useRef, ChangeEvent } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { virtualTryOn } from './services/geminiService';
import { UserIcon } from './components/icons/UserIcon';
import { OutfitIcon } from './components/icons/OutfitIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { CameraIcon } from './components/icons/CameraIcon';
import { UploadIcon } from './components/icons/UploadIcon';
import { Modal } from './components/Modal';
import { ImageCropper } from './components/ImageCropper';
import { CameraCapture } from './components/CameraCapture';
import { ResultViewer } from './components/ResultViewer';

type UploaderType = 'user' | 'outfit';

const App: React.FC = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [outfitImage, setOutfitImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for modals and image processing flow
  const [activeUploader, setActiveUploader] = useState<UploaderType | null>(null);
  const [imageToProcess, setImageToProcess] = useState<string | null>(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropAspect, setCropAspect] = useState<number | undefined>(undefined);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTryOn = useCallback(async () => {
    if (!userImage || !outfitImage) {
      setError('Please upload both your photo and an outfit photo.');
      return;
    }
    setError(null);
    setLoading(true);
    setResultImage(null);

    try {
      const generatedImage = await virtualTryOn(userImage, outfitImage);
      setResultImage(generatedImage);
    } catch (err) {
      console.error(err);
      setError('Failed to generate the image. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userImage, outfitImage]);
  
  const resetAll = () => {
      setUserImage(null);
      setOutfitImage(null);
      setResultImage(null);
      setError(null);
      setLoading(false);
      setActiveUploader(null);
      setImageToProcess(null);
      setIsSourceModalOpen(false);
      setIsCameraOpen(false);
      setIsCropperOpen(false);
  }

  // --- Image Selection Flow ---

  const handleUploaderClick = (type: UploaderType) => {
    setActiveUploader(type);
    setIsSourceModalOpen(true);
  };

  const handleFileSelectClick = () => {
    setIsSourceModalOpen(false);
    fileInputRef.current?.click();
  };
  
  const handleTakePhotoClick = () => {
    setIsSourceModalOpen(false);
    setIsCameraOpen(true);
  };

  const setImageForActiveUploader = (imageSrc: string) => {
      if (activeUploader === 'user') {
          setUserImage(imageSrc);
      } else if (activeUploader === 'outfit') {
          setOutfitImage(imageSrc);
      }
      setActiveUploader(null);
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
       if (file.size > 40 * 1024 * 1024) { // 40MB limit
          alert("File is too large. Please select an image under 40MB.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageForActiveUploader(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ''; // Reset file input
  };
  
  const handlePhotoTaken = (imageSrc: string) => {
      setImageForActiveUploader(imageSrc);
      setIsCameraOpen(false);
  };

  const handleEditRequest = (uploaderType: UploaderType, aspect?: number) => {
      setActiveUploader(uploaderType);
      setImageToProcess(uploaderType === 'user' ? userImage : outfitImage);
      setCropAspect(aspect);
      setIsCropperOpen(true);
  };

  const handleCropComplete = (croppedImage: string) => {
    if (activeUploader === 'user') {
      setUserImage(croppedImage);
    } else if (activeUploader === 'outfit') {
      setOutfitImage(croppedImage);
    }
    setIsCropperOpen(false);
    setImageToProcess(null);
    setActiveUploader(null);
  };

  const closeModal = () => {
      setIsSourceModalOpen(false);
      setIsCameraOpen(false);
      setIsCropperOpen(false);
      setImageToProcess(null);
      setActiveUploader(null);
  };


  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
              AI Virtual Try-On
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              See yourself in any outfit. Upload your photo, pick a clothing item, and let our AI show you the result.
            </p>
          </header>

          <main>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
                <ImageUploader 
                  title="Your Photo"
                  onUploadClick={() => handleUploaderClick('user')}
                  onClear={() => setUserImage(null)}
                  onEditRequest={(aspect) => handleEditRequest('user', aspect)}
                  icon={<UserIcon />}
                  currentImage={userImage}
                />
                <ImageUploader 
                  title="Outfit Photo"
                  onUploadClick={() => handleUploaderClick('outfit')}
                  onClear={() => setOutfitImage(null)}
                  onEditRequest={(aspect) => handleEditRequest('outfit', aspect)}
                  icon={<OutfitIcon />}
                  currentImage={outfitImage}
                />
              </div>

              <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl p-6 shadow-2xl border border-gray-700">
                <div className="flex flex-col items-center">
                  <button
                      onClick={handleTryOn}
                      disabled={!userImage || !outfitImage || loading}
                      className="flex items-center justify-center gap-3 px-8 py-4 mb-6 w-full max-w-xs font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                    >
                      <SparklesIcon />
                      {loading ? 'Generating...' : 'Virtual Try-On'}
                    </button>

                  <ResultViewer 
                    key={resultImage} // Resets state when image changes
                    loading={loading}
                    error={error}
                    resultImage={resultImage}
                  />

                  { (userImage || outfitImage || resultImage || loading || error) && (
                      <button
                          onClick={resetAll}
                          className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                          Reset All
                      </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* --- Modals --- */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      <Modal isOpen={isSourceModalOpen} onClose={closeModal} title="Choose Image Source">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <button onClick={handleTakePhotoClick} className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg hover:bg-indigo-600 transition-colors">
                  <CameraIcon className="w-12 h-12 mb-2"/>
                  <span className="font-semibold">Take Photo</span>
              </button>
              <button onClick={handleFileSelectClick} className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg hover:bg-indigo-600 transition-colors">
                  <UploadIcon className="w-12 h-12 mb-2"/>
                  <span className="font-semibold">Upload File</span>
              </button>
          </div>
      </Modal>

      <Modal isOpen={isCameraOpen} onClose={closeModal} title="Take a Photo">
        <CameraCapture onCapture={handlePhotoTaken} onClose={closeModal} />
      </Modal>
      
      <Modal isOpen={isCropperOpen} onClose={closeModal} title="Crop Your Image">
        {imageToProcess && (
            <ImageCropper 
                imageSrc={imageToProcess} 
                onCropComplete={handleCropComplete} 
                onCancel={closeModal}
                aspect={cropAspect}
            />
        )}
      </Modal>
    </>
  );
};

export default App;