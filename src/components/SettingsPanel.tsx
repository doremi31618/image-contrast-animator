import React from "react";

interface SettingsPanelProps {
  images: string[];
  currentImageIndex: number;
  contrast: number;
  speed: number;
  isAnimating: boolean;
  isPaused: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearImages: () => void;
  previousImage: () => void;
  nextImage: () => void;
  selectImage: (index: number) => void;
  setContrast: (value: number) => void;
  setSpeed: (value: number) => void;
  toggleAnimation: () => void;
  togglePause: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  images,
  currentImageIndex,
  contrast,
  speed,
  isAnimating,
  isPaused,
  handleImageUpload,
  clearImages,
  previousImage,
  nextImage,
  setContrast,
  setSpeed,
  toggleAnimation,
  togglePause,
  fileInputRef,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Settings</h2>
      {/* Image Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload Images (Multiple)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            dark:file:bg-blue-900 dark:file:text-blue-300"
          multiple
        />
        {images.length > 0 && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {images.length} image{images.length !== 1 ? 's' : ''} loaded
            </span>
            <button
              onClick={clearImages}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
      {/* Image Navigation */}
      {images.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image Navigation
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={previousImage}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              disabled={images.length <= 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="flex-1 text-center text-sm text-gray-600 dark:text-gray-400">
              {currentImageIndex + 1} of {images.length}
            </span>
            <button
              onClick={nextImage}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              disabled={images.length <= 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Contrast Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contrast: {contrast.toFixed(1)}%
        </label>
        <input
          type="range"
          min="-100"
          max="100"
          value={contrast}
          onChange={(e) => setContrast(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>-100%</span>
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
      {/* Speed Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Animation Speed: {speed.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>0.1x</span>
          <span>1x</span>
          <span>5x</span>
        </div>
      </div>
      {/* Animation Controls */}
      <div className="space-y-4">
        <button
          onClick={toggleAnimation}
          className={`w-full py-2 px-4 rounded-lg font-medium ${
            isAnimating
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isAnimating ? 'Stop Animation' : 'Start Animation'}
        </button>
        {isAnimating && (
          <button
            onClick={togglePause}
            className={`w-full py-2 px-4 rounded-lg font-medium ${
              isPaused
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel; 