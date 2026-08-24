import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAnimeNews } from '../lib/animeNews';
import { Newspaper, Calendar, ExternalLink, Filter, RefreshCw, TrendingUp } from 'lucide-react';

const News = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [news, selectedCategory, selectedSource]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const newsData = await fetchAnimeNews();
      setNews(newsData);
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
      {/* Header */}
      <div className="bg-gray-900 dark:bg-white py-12 xs:py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8">
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

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8 py-6">
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

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8 pb-12">
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6">
            {filteredNews.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
              >
                {/* Thumbnail - Instagram style */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop';
                    }}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-bold rounded-full shadow-lg">
                      {item.category}
                    </span>
                  </div>
                  
                  {/* Source badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center shadow-lg">
                      {item.sourceIcon} {item.source}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 xs:p-5">
                  <h3 className="text-sm xs:text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {new Date(item.pubDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-gray-900 dark:text-white font-medium group-hover:translate-x-1 transition-transform duration-300">
                      View
                      <ExternalLink size={12} className="ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 xs:py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <Newspaper size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-base xs:text-lg">
              No news found. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
