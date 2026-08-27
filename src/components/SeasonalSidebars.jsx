import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { getRandomAnimeImages } from '../lib/animeNews';

const SeasonalSidebars = () => {
  const [leftBgImage, setLeftBgImage] = useState('');
  const [rightBgImage, setRightBgImage] = useState('');
  const canvasRefLeft = useRef(null);
  const canvasRefRight = useRef(null);
  const animationFrameRefLeft = useRef(null);
  const animationFrameRefRight = useRef(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const images = await getRandomAnimeImages();
        if (images.length >= 2) {
          setLeftBgImage(images[0]);
          setRightBgImage(images[1]);
        }
      } catch (error) {
        console.error('Error loading anime images:', error);
      }
    };
    loadImages();
  }, []);

  // TV Static Effect - Optimized with cleanup
  useEffect(() => {
    const createStatic = (canvas, animationRef) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      const drawStatic = () => {
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const value = Math.random() * 255;
          data[i] = value;     // R
          data[i + 1] = value; // G
          data[i + 2] = value; // B
          data[i + 3] = Math.random() * 50; // Alpha (transparent)
        }
        
        ctx.putImageData(imageData, 0, 0);
        animationRef.current = requestAnimationFrame(drawStatic);
      };

      drawStatic();
    };

    createStatic(canvasRefLeft.current, animationFrameRefLeft);
    createStatic(canvasRefRight.current, animationFrameRefRight);

    return () => {
      if (animationFrameRefLeft.current) {
        cancelAnimationFrame(animationFrameRefLeft.current);
      }
      if (animationFrameRefRight.current) {
        cancelAnimationFrame(animationFrameRefRight.current);
      }
    };
  }, []);

  if (!leftBgImage || !rightBgImage) {
    return null;
  }

  return (
    <>
      {/* Left Sidebar - Desktop Only */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-40 lg:w-48 xl:w-56 z-40">
        <div 
          className="relative h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${leftBgImage}')` }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
          {/* TV Static Canvas */}
          <canvas
            ref={canvasRefLeft}
            width={256}
            height={window.innerHeight}
            className="absolute inset-0 w-full h-full opacity-30"
          />
        </div>
      </div>

      {/* Right Sidebar - Desktop Only */}
      <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-48 lg:w-64 z-40">
        <div 
          className="relative h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${rightBgImage}')` }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
          {/* TV Static Canvas */}
          <canvas
            ref={canvasRefRight}
            width={256}
            height={window.innerHeight}
            className="absolute inset-0 w-full h-full opacity-30"
          />
        </div>
      </div>

      {/* Center Content Indicator Line - Desktop Only */}
      <div className="hidden lg:block fixed left-40 lg:left-48 xl:left-56 right-40 lg:right-48 xl:right-56 top-0 bottom-0 z-30 pointer-events-none">
        <div className="h-full border-l border-r border-purple-500/30 dark:border-pink-500/30 opacity-40"></div>
      </div>
    </>
  );
};

export default SeasonalSidebars;
