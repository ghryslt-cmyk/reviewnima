import { useState, useEffect, useRef } from 'react';
import { getSeasonalBanners } from '../lib/animeNews';

const SeasonalSidebars = () => {
  const [seasonalBanners, setSeasonalBanners] = useState([]);
  const [currentSeason, setCurrentSeason] = useState('');
  const canvasRefLeft = useRef(null);
  const canvasRefRight = useRef(null);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const banners = await getSeasonalBanners();
        setSeasonalBanners(banners);
        
        // Determine current season
        const month = new Date().getMonth();
        let season = '';
        if (month >= 2 && month <= 4) season = 'Spring';
        else if (month >= 5 && month <= 7) season = 'Summer';
        else if (month >= 8 && month <= 10) season = 'Fall';
        else season = 'Winter';
        
        setCurrentSeason(season);
      } catch (error) {
        console.error('Error loading seasonal banners:', error);
      }
    };
    loadBanners();
  }, []);

  // TV Static Effect
  useEffect(() => {
    const createStatic = (canvas) => {
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
        requestAnimationFrame(drawStatic);
      };

      drawStatic();
    };

    createStatic(canvasRefLeft.current);
    createStatic(canvasRefRight.current);
  }, []);

  if (seasonalBanners.length === 0) {
    return null;
  }

  const displayBanners = seasonalBanners.length > 0 ? seasonalBanners : [];
  const cardsPerSide = Math.min(Math.ceil(displayBanners.length / 2), 8);

  return (
    <>
      {/* Left Sidebar - Desktop Only */}
      <div className="hidden xl:block fixed left-0 top-0 bottom-0 w-64 z-40">
        <div className="relative h-full bg-gray-400 dark:bg-gray-700">
          {/* TV Static Canvas */}
          <canvas
            ref={canvasRefLeft}
            width={256}
            height={window.innerHeight}
            className="absolute inset-0 w-full h-full opacity-20"
          />
          
          {/* Floating Anime Cards - Vertical Stack */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 py-8 overflow-y-auto">
            {displayBanners.slice(0, cardsPerSide).map((banner, index) => {
              // Varying sizes: top to bottom (small to large)
              const sizeMultiplier = 0.7 + (index / cardsPerSide) * 0.6; // 0.7 to 1.3
              const cardWidth = 160 * sizeMultiplier;
              const cardHeight = 224 * sizeMultiplier;
              
              return (
                <div
                  key={index}
                  className="relative rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300 animate-grow-shrink"
                  style={{
                    width: `${cardWidth}px`,
                    height: `${cardHeight}px`,
                    animationDelay: `${index * 0.3}s`
                  }}
                >
                  <img
                    src={banner}
                    alt={`Seasonal Anime ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Desktop Only */}
      <div className="hidden xl:block fixed right-0 top-0 bottom-0 w-64 z-40">
        <div className="relative h-full bg-gray-400 dark:bg-gray-700">
          {/* TV Static Canvas */}
          <canvas
            ref={canvasRefRight}
            width={256}
            height={window.innerHeight}
            className="absolute inset-0 w-full h-full opacity-20"
          />
          
          {/* Floating Anime Cards - Vertical Stack (Reversed) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 py-8 overflow-y-auto">
            {displayBanners.slice(cardsPerSide, cardsPerSide * 2).reverse().map((banner, index) => {
              // Varying sizes: bottom to top (small to large)
              const sizeMultiplier = 0.7 + (index / cardsPerSide) * 0.6; // 0.7 to 1.3
              const cardWidth = 160 * sizeMultiplier;
              const cardHeight = 224 * sizeMultiplier;
              
              return (
                <div
                  key={index}
                  className="relative rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300 animate-grow-shrink"
                  style={{
                    width: `${cardWidth}px`,
                    height: `${cardHeight}px`,
                    animationDelay: `${index * 0.3}s`
                  }}
                >
                  <img
                    src={banner}
                    alt={`Seasonal Anime ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Center Content Indicator Line - Desktop Only */}
      <div className="hidden xl:block fixed left-64 right-64 top-0 bottom-0 z-30 pointer-events-none">
        <div className="h-full border-l border-r border-purple-500/30 dark:border-pink-500/30 opacity-40"></div>
      </div>
    </>
  );
};

export default SeasonalSidebars;
