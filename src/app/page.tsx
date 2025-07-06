"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  const directionRef = useRef<'up' | 'down'>('up');
  const lastUpdateTimeRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const magnifierRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedImage = images.length > 0 ? images[currentImageIndex] : null;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isAnimating && !isPaused) {
      const animate = (timestamp: number) => {
        if (!lastUpdateTimeRef.current) {
          lastUpdateTimeRef.current = timestamp;
        }

        const deltaTime = timestamp - lastUpdateTimeRef.current;
        if (deltaTime >= 16) { // Approximately 60fps
          setContrast((prevContrast) => {
            const step = (speed * deltaTime) / 16; // Normalize to 60fps
            if (directionRef.current === 'up') {
              if (prevContrast >= 100) {
                directionRef.current = 'down';
                return 100;
              }
              return Math.min(100, prevContrast + step);
            } else {
              if (prevContrast <= -100) {
                directionRef.current = 'up';
                return -100;
              }
              return Math.max(-100, prevContrast - step);
            }
          });
          lastUpdateTimeRef.current = timestamp;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, isPaused, speed]);

  // Ensure currentImageIndex is always valid
  useEffect(() => {
    if (images.length === 0) {
      setCurrentImageIndex(0);
    } else if (currentImageIndex >= images.length) {
      setCurrentImageIndex(0);
    }
  }, [images.length, currentImageIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isExpanded || images.length <= 1) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          previousImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextImage();
          break;
        case 'Escape':
          e.preventDefault();
          toggleExpanded();
          break;
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, images.length]);

  if (!isClient) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="max-w-4xl mx-auto flex-grow">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
            Image Contrast Animator
          </h1>
          <div className="text-center text-gray-600 dark:text-gray-400">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        alert('Please select at least one image file.');
        return;
      }

      const readers = imageFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((imageUrls) => {
        setImages(imageUrls);
        setCurrentImageIndex(0);
        // Reset animation when new images are loaded
        setIsAnimating(false);
        setIsPaused(false);
        setContrast(0);
      });
    }
  };

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const previousImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const selectImage = (index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentImageIndex(index);
    }
  };

  const clearImages = () => {
    setImages([]);
    setCurrentImageIndex(0);
    setIsAnimating(false);
    setIsPaused(false);
    setContrast(0);
    setIsMagnifierActive(false);
    setMagnifierPosition({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleToolbar = () => {
    setIsToolbarVisible(!isToolbarVisible);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMagnifierActive || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setMagnifierPosition({ x, y });
    }
  };

  const toggleMagnifier = () => {
    setIsMagnifierActive(!isMagnifierActive);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="max-w-4xl mx-auto flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
          Image Contrast Animator
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Settings Panel */}
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

                      {/* Image Preview */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Preview</h2>
                {selectedImage && (
                  <button
                    onClick={toggleExpanded}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                    title={isExpanded ? "Exit expanded view" : "Enter expanded view"}
                  >
                    {isExpanded ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v4a1 1 0 01-2 0V5a3 3 0 013-3h4a1 1 0 010 2H5zm10 0a1 1 0 100 2h4a1 1 0 011 1v4a1 1 0 102 0V5a3 3 0 00-3-3h-4zM5 14a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1zm10 0a1 1 0 100 2h4a1 1 0 001-1v-4a1 1 0 10-2 0v4a1 1 0 01-1 1h-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )}
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
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && selectedImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9999] flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 bg-black/50">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Upload New Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
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
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-600 dark:text-gray-400">
        <p className="text-sm">
          Made by{" "}
          <a
            href="https://studio-frontend-one.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            EricZhan
          </a>
        </p>
        <p className="text-xs mt-2">
          A software engineer & Interactive Designer from Taiwan
        </p>
      </footer>
    </div>
  );
}
