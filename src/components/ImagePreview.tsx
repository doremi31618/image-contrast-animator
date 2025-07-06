import React from "react";

interface ImagePreviewProps {
  selectedImage: string | null;
  images: string[];
  currentImageIndex: number;
  imageRef: React.RefObject<HTMLImageElement>;
  contrast: number;
  selectImage: (index: number) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  selectedImage,
  images,
  currentImageIndex,
  imageRef,
  contrast,
  selectImage,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Preview</h2>
      </div>
      <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
        {selectedImage ? (
          <img
            ref={imageRef}
            src={selectedImage}
            alt="Preview"
            className="w-full h-full object-contain"
            style={{ filter: `contrast(${contrast + 100}%)` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
            No image selected
          </div>
        )}
      </div>
      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Gallery</h3>
          <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => selectImage(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex
                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 text-center">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview; 