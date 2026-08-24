import { useState, useEffect } from 'react';
import { getSeasonalBanners } from '../lib/animeNews';

const SeasonalSidebars = () => {
  const [seasonalBanners, setSeasonalBanners] = useState([]);
  const [currentLeftIndex, setCurrentLeftIndex] = useState(0);
  const [currentRightIndex, setCurrentRightIndex] = useState(0);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const banners = await getSeasonalBanners();
        setSeasonalBanners(banners);
      } catch (error) {
        console.error('Error loading seasonal banners:', error);
      }
    };
    loadBanners();
  }, []);

  // Auto-rotate left sidebar every 8 seconds
  useEffect(() => {
    if (seasonalBanners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentLeftIndex((prev) => (prev + 1) % seasonalBanners.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [seasonalBanners]);

  // Auto-rotate right sidebar every 8 seconds (offset from left)
  useEffect(() => {
    if (seasonalBanners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentRightIndex((prev) => (prev + 1) % seasonalBanners.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [seasonalBanners]);

  if (seasonalBanners.length === 0) {
    return null;
  }

  return (
    <>
      {/* Left Sidebar - Desktop Only */}
      <div className="hidden xl:block fixed left-0 top-0 bottom-0 w-64 z-0">
        <div className="relative h-full bg-gray-900 dark:bg-black">
          {seasonalBanners.length > 0 && (
            <>
              <div className="absolute inset-0">
                <img
                  src={seasonalBanners[currentLeftIndex]}
                  alt="Seasonal Anime Left"
                  className="w-full h-full object-cover opacity-40"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/90"></div>
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar - Desktop Only */}
      <div className="hidden xl:block fixed right-0 top-0 bottom-0 w-64 z-0">
        <div className="relative h-full bg-gray-900 dark:bg-black">
          {seasonalBanners.length > 0 && (
            <>
              <div className="absolute inset-0">
                <img
                  src={seasonalBanners[currentRightIndex]}
                  alt="Seasonal Anime Right"
                  className="w-full h-full object-cover opacity-40"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-l from-gray-900/90 via-gray-900/70 to-gray-900/90"></div>
            </>
          )}
        </div>
      </div>

      {/* Center Content Indicator Line - Desktop Only */}
      <div className="hidden xl:block fixed left-64 right-64 top-0 bottom-0 z-0 pointer-events-none">
        <div className="h-full border-l border-r border-gray-300 dark:border-gray-700 opacity-30"></div>
      </div>
    </>
  );
};

export default SeasonalSidebars;
