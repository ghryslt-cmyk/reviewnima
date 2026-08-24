import { useState, useEffect } from 'react';
import { getSeasonalBanners } from '../lib/animeNews';

const SeasonalSidebars = ({ disableAnimation = false }) => {
  const [seasonalBanners, setSeasonalBanners] = useState([]);
  const [currentSeason, setCurrentSeason] = useState('');

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

  if (seasonalBanners.length === 0) {
    return null;
  }

  return (
    <>
      {/* Left Sidebar - Desktop Only */}
      <div className="hidden xl:block fixed left-0 top-0 bottom-0 w-64 z-0">
        <div className="relative h-full bg-gray-300 dark:bg-gray-800" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}>
          {/* Floating Anime Cards - Vertical Stack */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 py-12 overflow-hidden">
            {seasonalBanners.slice(0, 5).map((banner, index) => (
              <div
                key={index}
                className={`relative w-48 h-72 rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300 ${!disableAnimation ? 'animate-float' : ''}`}
                style={{
                  animationDuration: !disableAnimation ? `${3 + index * 0.5}s` : undefined,
                  animationDelay: !disableAnimation ? `${index * 0.2}s` : undefined
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
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
        <div className="relative h-full bg-gray-300 dark:bg-gray-800" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}>
          {/* Floating Anime Cards - Vertical Stack (Reversed) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 py-12 overflow-hidden">
            {seasonalBanners.slice(5, 10).reverse().map((banner, index) => (
              <div
                key={index}
                className={`relative w-48 h-72 rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300 ${!disableAnimation ? 'animate-float' : ''}`}
                style={{
                  animationDuration: !disableAnimation ? `${3 + index * 0.5}s` : undefined,
                  animationDelay: !disableAnimation ? `${index * 0.2}s` : undefined
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
                    {currentSeason} {index + 6}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Content Indicator Line - Desktop Only */}
      <div className="hidden xl:block fixed left-64 right-64 top-0 bottom-0 z-0 pointer-events-none">
        <div className="h-full border-l border-r border-gray-400 dark:border-gray-600 opacity-50"></div>
      </div>
    </>
  );
};

export default SeasonalSidebars;
