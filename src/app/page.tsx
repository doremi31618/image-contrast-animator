"use client";

import { useState, useRef, useEffect } from "react";
import SettingsPanel from "../components/SettingsPanel";
import ImagePreview from "../components/ImagePreview";
import ExpandedView from "../components/ExpandedView";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [exposure, setExposure] = useState(0);
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
    setExposure(0);
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
          <SettingsPanel
            images={images}
            currentImageIndex={currentImageIndex}
            contrast={contrast}
            exposure={exposure}
            speed={speed}
            isAnimating={isAnimating}
            isPaused={isPaused}
            handleImageUpload={handleImageUpload}
            clearImages={clearImages}
            previousImage={previousImage}
            nextImage={nextImage}
            selectImage={selectImage}
            setContrast={setContrast}
            setExposure={setExposure}
            setSpeed={setSpeed}
            toggleAnimation={toggleAnimation}
            togglePause={togglePause}
            fileInputRef={fileInputRef}
          />
          <ImagePreview
            selectedImage={selectedImage}
            images={images}
            currentImageIndex={currentImageIndex}
            imageRef={imageRef}
            contrast={contrast}
            exposure={exposure}
            selectImage={selectImage}
            onExpand={toggleExpanded}
          />
        </div>
      </div>
      <ExpandedView
        selectedImage={selectedImage}
        images={images}
        currentImageIndex={currentImageIndex}
        imageRef={imageRef}
        magnifierRef={magnifierRef}
        contrast={contrast}
        exposure={exposure}
        isExpanded={isExpanded}
        isToolbarVisible={isToolbarVisible}
        isMagnifierActive={isMagnifierActive}
        magnifierPosition={magnifierPosition}
        handleMouseMove={handleMouseMove}
        setMagnifierPosition={setMagnifierPosition}
        toggleMagnifier={toggleMagnifier}
        toggleExpanded={toggleExpanded}
        toggleToolbar={toggleToolbar}
        speed={speed}
        setSpeed={setSpeed}
        setContrast={setContrast}
        setExposure={setExposure}
        isAnimating={isAnimating}
        isPaused={isPaused}
        toggleAnimation={toggleAnimation}
        togglePause={togglePause}
        previousImage={previousImage}
        nextImage={nextImage}
      />
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
