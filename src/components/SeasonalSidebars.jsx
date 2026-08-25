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
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-48 lg:w-64 z-40">
        <div 
          className="relative h-full bg-cover bg-center"
          style={{ backgroundImage: "url('/Desain tanpa judul (5).png')" }}
        >
          {/* Inner shadow for separation effect */}
          <div className="absolute inset-0 shadow-[inset_-12px_0_48px_rgba(0,0,0,0.9)] dark:shadow-[inset_-12px_0_48px_rgba(0,0,0,0.95)] pointer-events-none"></div>
          {/* TV Static Canvas */}
          <canvas
            ref={canvasRefLeft}
            width={256}
            height={window.innerHeight}
            className="absolute inset-0 w-full h-full opacity-20"
          />
          
          {/* Floating Anime Cards - Vertical Stack */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 py-8 overflow-y-auto">
            {displayBanners.slice(0, cardsPerSide).map((banner, index) => (
              <div
                key={index}
                className="relative w-40 h-56 rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300 animate-grow-shrink overflow-hidden"
                style={{
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
                {/* TV Static Overlay on Card */}
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-50 mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                      animation: 'staticNoise 0.2s infinite'
                    }}
                  />
                </div>
                {/* Scanline effect */}
                <div className="absolute inset-0 rounded-lg pointer-events-none" style={{
                  background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                  backgroundSize: '100% 2px, 3px 100%'
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Desktop Only */}
      <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-48 lg:w-64 z-40">
        <div 
          className="relative h-full bg-cover bg-center"
          style={{ backgroundImage: "url('/Desain tanpa judul (5).png')" }}
        >
          {/* Inner shadow for separation effect */}
          <div className="absolute inset-0 shadow-[inset_12px_0_48px_rgba(0,0,0,0.9)] dark:shadow-[inset_12px_0_48px_rgba(0,0,0,0.95)] pointer-events-none"></div>
          {/* TV Static Canvas */}
          <canvas
            ref={canvasRefRight}
            width={256}
            height={window.innerHeight}
            className="absolute inset-0 w-full h-full opacity-20"
          />
          
          {/* Floating Anime Cards - Vertical Stack (Reversed) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 py-8 overflow-y-auto">
            {displayBanners.slice(cardsPerSide, cardsPerSide * 2).reverse().map((banner, index) => (
              <div
                key={index}
                className="relative w-40 h-56 rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300 animate-grow-shrink overflow-hidden"
                style={{
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
                {/* TV Static Overlay on Card */}
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-50 mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                      animation: 'staticNoise 0.2s infinite'
                    }}
                  />
                </div>
                {/* Scanline effect */}
                <div className="absolute inset-0 rounded-lg pointer-events-none" style={{
                  background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                  backgroundSize: '100% 2px, 3px 100%'
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Content Indicator Line - Desktop Only */}
      <div className="hidden lg:block fixed left-48 lg:left-64 right-48 lg:right-64 top-0 bottom-0 z-30 pointer-events-none">
        <div className="h-full border-l border-r border-purple-500/30 dark:border-pink-500/30 opacity-40"></div>
      </div>
    </>
  );
};

export default SeasonalSidebars;
