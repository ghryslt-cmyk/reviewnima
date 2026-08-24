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
      <div className="hidden xl:block fixed left-0 top-0 bottom-0 w-64 z-0">
        <div className="relative h-full bg-gray-400 dark:bg-gray-700">
          {/* TV Static Canvas */}
          <canvas
            ref={canvasRefLeft}
            width={256}
            height={window.innerHeight}
            className="absolute inset-0 w-full h-full opacity-30"
          />
          
          {/* Floating Anime Cards - Vertical Stack */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 py-8 overflow-y-auto">
            {displayBanners.slice(0, cardsPerSide).map((banner, index) => (
              <div
                key={index}
                className="relative w-40 h-56 rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300 animate-float"
                style={{
                  animationDuration: `${2.5 + index * 0.3}s`,
                  animationDelay: `${index * 0.15}s`
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg"></div>
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-white text-xs font-semibold bg-black/60 px-2 py-1 rounded">
                    {currentSeason} {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Desktop Only */}
      <div className="hidden xl:block fixed right-0 top-0 bottom-0 w-64 z-0">
        <div className="relative h-full bg-gray-400 dark:bg-gray-700">
          {/* TV Static Canvas */}
          <canvas
            ref={canvasRefRight}
            width={256}
            height={window.innerHeight}
            className="absolute inset-0 w-full h-full opacity-30"
          />
          
          {/* Floating Anime Cards - Vertical Stack (Reversed) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 py-8 overflow-y-auto">
            {displayBanners.slice(cardsPerSide, cardsPerSide * 2).reverse().map((banner, index) => (
              <div
                key={index}
                className="relative w-40 h-56 rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300 animate-float"
                style={{
                  animationDuration: `${2.5 + index * 0.3}s`,
                  animationDelay: `${index * 0.15}s`
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg"></div>
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-white text-xs font-semibold bg-black/60 px-2 py-1 rounded">
                    {currentSeason} {index + cardsPerSide + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Content Indicator Line - Desktop Only */}
      <div className="hidden xl:block fixed left-64 right-64 top-0 bottom-0 z-0 pointer-events-none">
        <div className="h-full border-l border-r border-gray-500 dark:border-gray-500 opacity-40"></div>
      </div>
    </>
  );
};

export default SeasonalSidebars;
