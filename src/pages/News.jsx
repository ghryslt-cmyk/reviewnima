import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchAnimeNews, getSeasonalBanners } from '../lib/animeNews';
import { Newspaper, Calendar, ExternalLink, Filter, RefreshCw, TrendingUp, Globe } from 'lucide-react';

const News = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [seasonalBanners, setSeasonalBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [animeByDay, setAnimeByDay] = useState({
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  });
  const [trendingNews, setTrendingNews] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadNews();
  }, []);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (seasonalBanners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % seasonalBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [seasonalBanners]);

  useEffect(() => {
    filterNews();
  }, [news, selectedCategory, selectedSource]);

  // Continuous circular scroll animation
  // Temporarily disabled due to React DOM manipulation conflict
  // useEffect(() => {
  //   const scrollContainer = scrollRef.current;
  //   if (!scrollContainer || animeByDay[currentDay]?.length === 0) return;

  //   let scrollPosition = 0;
  //   const speed = 0.5;
  //   let animationId = null;

  //   const animate = () => {
  //     if (!scrollContainer) return;

  //     scrollPosition -= speed;
      
  //     const firstItem = scrollContainer.children[0];
  //     if (!firstItem) return;
      
  //     const itemWidth = firstItem.offsetWidth + 12;
      
  //     if (Math.abs(scrollPosition) >= itemWidth) {
  //       scrollContainer.appendChild(scrollContainer.children[0]);
  //       scrollPosition += itemWidth;
  //     }
      
  //     scrollContainer.style.transform = `translateX(${scrollPosition}px)`;
  //     animationId = requestAnimationFrame(animate);
  //   };

  //   animationId = requestAnimationFrame(animate);

  //   return () => {
  //     if (animationId !== null) {
  //       cancelAnimationFrame(animationId);
  //     }
  //   };
  // }, [animeByDay, currentDay]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const newsData = await fetchAnimeNews();
      setNews(newsData);

      // Fetch seasonal banners
      const banners = await getSeasonalBanners();
      setSeasonalBanners(banners);

      // Get anime grouped by day from the news data
      const airingAnime = newsData.filter(item => item.category === 'Now Airing');
      
      // Group airing anime by day based on their dayName property (from MAL API)
      const groupedByDay = {
        0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
      };
      
      const dayNameToIndex = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6,
        'Sunday': 0,
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6
      };
      
      airingAnime.forEach(item => {
        const dayName = item.animeData?.dayName;
        if (dayName && dayNameToIndex[dayName] !== undefined) {
          groupedByDay[dayNameToIndex[dayName]].push(item);
        }
      });
      
      setAnimeByDay(groupedByDay);

      // Load trending news from RSS sources
      try {
        const trendingResponse = await fetch('/data/daily/trending_news.json');
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json();
          setTrendingNews(trendingData.news || []);
        }
      } catch (error) {
        console.error('Error loading trending news:', error);
      }
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = [...news];
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (selectedSource !== 'All') {
      filtered = filtered.filter(item => item.source === selectedSource);
    }
    
    setFilteredNews(filtered);
  };

  // Separate news by category
  const airingNews = news.filter(item => item.category === 'Now Airing');
  const trendingAnimeNews = news.filter(item => item.category === 'Trending');

  // Get current day of week
  const currentDay = new Date().getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const categories = ['All', ...new Set(news.map(item => item.category))];
  const sources = ['All', ...new Set(news.map(item => item.source))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-gray-700 dark:border-gray-300"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      {/* Header with Banner Background */}
      <div className="relative bg-gray-900 dark:bg-white py-12 xs:py-16 sm:py-20 overflow-hidden">
        {/* Seasonal Banner Background */}
        {seasonalBanners.length > 0 && (
          <div className="absolute inset-0 z-0">
            <img
              src={seasonalBanners[currentBannerIndex]}
              alt="Seasonal Anime Banner"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-gray-900/60 dark:from-white/95 dark:via-white/80 dark:to-white/60"></div>
          </div>
        )}
        
        {/* Header Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Newspaper className="text-white dark:text-gray-900" size={32} xs:size={36} sm:size={40} />
                <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold text-white dark:text-gray-900">
                  Anime News
                </h1>
              </div>
              <p className="text-white/90 dark:text-gray-700 text-base xs:text-lg sm:text-xl">
                Latest anime news and updates
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-white/20 dark:bg-gray-900/20 hover:bg-white/30 dark:hover:bg-gray-900/30 rounded-full transition-all duration-300 backdrop-blur-sm"
            >
              <RefreshCw 
                className={`text-white dark:text-gray-900 ${refreshing ? 'animate-spin' : ''}`} 
                size={24} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Airing Schedule - Horizontal Scroll Below Banner */}
      <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8 py-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Calendar className="mr-2 text-gray-600 dark:text-gray-400" size={20} />
              Now Airing - {dayNames[currentDay]}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {animeByDay[currentDay]?.length || 0} anime
            </span>
          </div>
          
          {/* Horizontal Scroll Container */}
          <div className="relative overflow-hidden">
            {animeByDay[currentDay]?.length > 0 ? (
              <div 
                ref={scrollRef}
                className="flex gap-3 pb-2 will-change-transform"
                style={{ transform: 'translateX(0)' }}
              >
                {animeByDay[currentDay].map((item) => (
                  <Link
                    key={item.id}
                    to={`/news/${item.id}`}
                    className="flex-shrink-0 w-32 sm:w-40 group"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-2">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop';
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                      {item.title.split(' - ')[0]}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No anime airing today
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8 py-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 xs:p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Filter size={16} className="mr-2" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all duration-300"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Filter size={16} className="mr-2" />
                Source
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent transition-all duration-300"
              >
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* News Grid - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xs:gap-6">
          {/* Left Column - Trending on Internet - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="mr-2 text-gray-600 dark:text-gray-400" size={24} />
                Trending on Internet
              </h2>
            </div>
            <div className="space-y-4">
              {trendingNews.length > 0 ? (
                trendingNews.map((item, index) => (
                  <a
                    key={item.guid || index}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-200 dark:border-gray-700 block"
                  >
                    <div className="flex gap-4 p-4">
                      {/* Thumbnail */}
                      {item.thumbnail && (
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Globe className="text-gray-600 dark:text-gray-400" size={16} />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {item.source}
                            </span>
                          </div>
                          {item.pubDate && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(item.pubDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 leading-tight">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {item.description.replace(/<[^>]*>/g, '')}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 min-h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">
                      No trending news available
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                      Check back later for updates
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Trending Anime (Small Cards) - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="mr-2 text-gray-600 dark:text-gray-400" size={20} />
                Trending Anime
              </h2>
            </div>
            <div className="space-y-3">
              {trendingAnimeNews.map((item, index) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex gap-3 p-3">
                    {/* Thumbnail - Small */}
                    <div className="relative w-16 h-20 flex-shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gray-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {/* Rank badge */}
                      <div className="absolute top-1 left-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
