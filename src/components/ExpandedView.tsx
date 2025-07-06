import React from "react";

interface ExpandedViewProps {
  selectedImage: string | null;
  images: string[];
  currentImageIndex: number;
  imageRef: React.RefObject<HTMLImageElement | null>;
  magnifierRef: React.RefObject<HTMLDivElement | null>;
  contrast: number;
  isExpanded: boolean;
  isToolbarVisible: boolean;
  isMagnifierActive: boolean;
  magnifierPosition: { x: number; y: number };
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  setMagnifierPosition: (pos: { x: number; y: number }) => void;
  toggleMagnifier: () => void;
  toggleExpanded: () => void;
  toggleToolbar: () => void;
  speed: number;
  setSpeed: (value: number) => void;
  setContrast: (value: number) => void;
  isAnimating: boolean;
  isPaused: boolean;
  toggleAnimation: () => void;
  togglePause: () => void;
  previousImage: () => void;
  nextImage: () => void;
}

const ExpandedView: React.FC<ExpandedViewProps> = ({
  selectedImage,
  images,
  currentImageIndex,
  imageRef,
  magnifierRef,
  contrast,
  isExpanded,
  isToolbarVisible,
  isMagnifierActive,
  magnifierPosition,
  handleMouseMove,
  setMagnifierPosition,
  toggleMagnifier,
  toggleExpanded,
  toggleToolbar,
  speed,
  setSpeed,
  setContrast,
  isAnimating,
  isPaused,
  toggleAnimation,
  togglePause,
  previousImage,
  nextImage,
}) => {
  if (!isExpanded || !selectedImage) return null;
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9999] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-white cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Upload New Image</span>
            {/* You can add upload logic here if needed */}
          </label>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMagnifier}
            className={`p-2 text-white hover:bg-white/10 rounded-lg transition-colors ${
              isMagnifierActive ? 'bg-white/20' : ''
            }`}
            title={isMagnifierActive ? "Disable magnifier" : "Enable magnifier"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            onClick={toggleExpanded}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Exit expanded view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {/* Image Container */}
      <div 
        className="flex-grow flex items-center justify-center p-4 relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMagnifierPosition({ x: 0, y: 0 })}
      >
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={previousImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
              title="Previous image (←)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
              title="Next image (→)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        <img
          ref={imageRef}
          src={selectedImage}
          alt="Expanded Preview"
          className="max-w-full max-h-full object-contain"
          style={{ filter: `contrast(${contrast + 100}%)` }}
        />
        {/* Magnifier */}
        {isMagnifierActive && magnifierPosition.x > 0 && magnifierPosition.y > 0 && (
          <div
            ref={magnifierRef}
            className="absolute w-40 h-40 border-2 border-white rounded-full pointer-events-none overflow-hidden shadow-lg"
            style={{
              left: magnifierPosition.x,
              top: magnifierPosition.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 1000
            }}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${selectedImage})`,
                backgroundSize: `${imageRef.current?.width ? imageRef.current.width * 2 : 0}px ${imageRef.current?.height ? imageRef.current.height * 2 : 0}px`,
                backgroundPosition: `-${magnifierPosition.x * 2 - 80}px -${magnifierPosition.y * 2 - 80}px`,
                filter: `contrast(${contrast + 100}%)`
              }}
            />
          </div>
        )}
        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {currentImageIndex + 1} of {images.length}
          </div>
        )}
      </div>
      {/* Toolbar Toggle Button */}
      <button
        onClick={toggleToolbar}
        className="fixed bottom-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-[10000]"
        title={isToolbarVisible ? "Hide toolbar" : "Show toolbar"}
      >
        {isToolbarVisible ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
      </button>
      {/* Bottom Toolbar */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md transition-transform duration-300 ease-in-out ${
          isToolbarVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex flex-col gap-4">
            {/* Animation Controls */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">Speed:</span>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-white w-12">{speed.toFixed(1)}x</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">Contrast:</span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-white w-16">{contrast.toFixed(1)}%</span>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleAnimation}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isAnimating
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isAnimating ? 'Stop' : 'Start'}
              </button>
              {isAnimating && (
                <button
                  onClick={togglePause}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isPaused
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
              )}
              <button
                onClick={toggleExpanded}
                className="px-6 py-2 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandedView; 