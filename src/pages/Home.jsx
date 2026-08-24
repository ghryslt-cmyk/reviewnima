import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getReviews } from '../lib/firebase';
import ReviewCard from '../components/ReviewCard';
import { fetchAnimeNews } from '../lib/animeNews';
import { TrendingUp, Sparkles, Star, Newspaper } from 'lucide-react';

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [topRatedReviews, setTopRatedReviews] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reviewsData = await getReviews();
        setReviews(reviewsData);
        
        // Sort reviews by rating (highest first) and get top 6
        const sortedByRating = [...reviewsData].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setTopRatedReviews(sortedByRating.slice(0, 6));

        // Fetch news
        const newsData = await fetchAnimeNews();
        setNews(newsData.slice(0, 8)); // Get latest 8 news items
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-gray-700 dark:border-gray-300"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      {/* Hero Section */}
      <div className="relative min-h-[300px] xs:min-h-[350px] sm:min-h-[400px] md:min-h-[450px] flex items-start justify-center pt-12 xs:pt-16 sm:pt-20 md:pt-24 overflow-hidden xl:mx-64">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/cake-by-the-ocean-amv-mix-anime-mix-1080-ytshorts.savetube.me.mp4" type="video/mp4" />
          </video>
          {/* Blur Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 xs:space-x-3 sm:space-x-3 mb-3 xs:mb-4">
            <Sparkles size={20} xs:size={24} sm:size={32} className="text-white animate-spin-slow" />
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white animate-fade-in drop-shadow-lg">
              ReviewNima
            </h1>
            <Sparkles size={20} xs:size={24} sm:size={32} className="text-white animate-spin-slow" />
          </div>
          <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-200 mb-4 xs:mb-6 sm:mb-8 font-light drop-shadow-md">
            Discover Amazing Anime Reviews & Insights
          </p>
          <div className="flex items-center justify-center space-x-2 text-gray-300">
            <TrendingUp size={14} xs:size={16} sm:size={20} />
            <span className="text-xs xs:text-sm sm:text-base font-medium">Personal reviews from a true anime enthusiast</span>
          </div>
        </div>

        {/* News Carousel - Moving Right to Left */}
        {news.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent border-t border-white/20">
            <div className="py-4 overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap">
                {[...news, ...news].map((item, index) => (
                  <Link
                    key={`${item.id}-${index}`}
                    to={`/news/${item.id}`}
                    className="flex items-center space-x-3 mx-4 group flex-shrink-0 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl p-2 transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40"
                  >
                    <div className="relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 flex-shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gray-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="max-w-xs xs:max-w-sm sm:max-w-md">
                      <p className="text-white text-xs xs:text-sm sm:text-base font-semibold line-clamp-1 group-hover:text-gray-300 transition-colors drop-shadow-sm">
                        {item.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-gray-300 text-xs line-clamp-1">
                          {item.sourceIcon} {item.source}
                        </span>
                        <span className="text-gray-400 text-xs font-medium">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* News Carousel - Mobile Fallback (hidden on desktop) */}
      {news.length > 0 && (
        <div className="xl:hidden relative bg-black/80 border-t border-white/20">
          <div className="py-4 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...news, ...news].map((item, index) => (
                <Link
                  key={`${item.id}-${index}`}
                  to={`/news/${item.id}`}
                  className="flex items-center space-x-3 mx-4 group flex-shrink-0 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl p-2 transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40"
                >
                  <div className="relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 flex-shrink-0">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gray-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="max-w-xs xs:max-w-sm sm:max-w-md">
                    <p className="text-white text-xs xs:text-sm sm:text-base font-semibold line-clamp-1 group-hover:text-gray-300 transition-colors drop-shadow-sm">
                      {item.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-gray-300 text-xs line-clamp-1">
                        {item.sourceIcon} {item.source}
                      </span>
                      <span className="text-gray-400 text-xs font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Rated Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8 py-8 xs:py-10 sm:py-12 md:py-20 xl:mx-64">
        <div className="mb-6 xs:mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
            <Star className="mr-2 xs:mr-3 text-yellow-500 fill-yellow-500" size={24} xs:size={28} sm:size={32} md:size={36} />
            Top Rated Reviews
          </h2>
          <div className="h-1 w-16 xs:w-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
        </div>
        {topRatedReviews.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-6 md:gap-8">
            {topRatedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 xs:py-14 sm:py-16 md:py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm xs:text-base sm:text-base md:text-lg">
              No reviews yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* Latest Reviews Section */}
      <div className="bg-gray-100 dark:bg-gray-800 py-8 xs:py-10 sm:py-12 md:py-20 xl:mx-64">
        <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8">
          <div className="mb-6 xs:mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
              <TrendingUp className="mr-2 xs:mr-3 text-blue-500" size={24} xs:size={28} sm:size={32} md:size={36} />
              Latest Reviews
            </h2>
            <div className="h-1 w-16 xs:w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-6 md:gap-8">
              {reviews.slice(0, 6).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 xs:py-14 sm:py-16 md:py-20 bg-white dark:bg-gray-700 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600">
              <p className="text-gray-600 dark:text-gray-400 text-sm xs:text-base sm:text-base md:text-lg">
                No reviews yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white dark:bg-gray-800 py-8 xs:py-10 sm:py-12 md:py-20 border-t border-gray-200 dark:border-gray-700 xl:mx-64">
        <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8">
          <div className="text-center mb-8 xs:mb-10 sm:mb-12">
            <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About ReviewNima
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-sm xs:text-base sm:text-base md:text-lg">
              Welcome to my personal anime review website! Here I share my thoughts and insights 
              on the anime I've watched. Each review comes from my personal experience and 
              perspective. Feel free to browse through my reviews and leave comments if you're 
              logged in with your Google account.
            </p>
          </div>
          
          {/* Split Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xs:gap-8 sm:gap-10 md:gap-12">
            {/* Left Column - Pages */}
            <div className="space-y-4 xs:space-y-6">
              <h3 className="text-lg xs:text-xl sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-3 xs:mb-4">Pages</h3>
              <div className="space-y-2 xs:space-y-3">
                <Link to="/" className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  <div className="p-3 xs:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span className="font-medium text-sm xs:text-base">Home</span>
                    <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mt-1">Main page with top rated and latest reviews</p>
                  </div>
                </Link>
                <Link to="/reviews" className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  <div className="p-3 xs:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span className="font-medium text-sm xs:text-base">Reviews</span>
                    <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mt-1">Browse all anime reviews alphabetically</p>
                  </div>
                </Link>
                <Link to="/top-favorites" className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  <div className="p-3 xs:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span className="font-medium text-sm xs:text-base">Top Favorites</span>
                    <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mt-1">My personal top 10 favorite anime</p>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Right Column - Contact & Policies */}
            <div className="space-y-4 xs:space-y-6">
              <h3 className="text-lg xs:text-xl sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-3 xs:mb-4">Contact & Policies</h3>
              <div className="space-y-2 xs:space-y-3">
                <Link to="/contact" className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  <div className="p-3 xs:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span className="font-medium text-sm xs:text-base">Contact Us</span>
                    <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mt-1">Get in touch with us for any questions</p>
                  </div>
                </Link>
                <Link to="/privacy" className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  <div className="p-3 xs:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span className="font-medium text-sm xs:text-base">Privacy Policy</span>
                    <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mt-1">Learn about how we protect your data</p>
                  </div>
                </Link>
                <Link to="/terms" className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
                  <div className="p-3 xs:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span className="font-medium text-sm xs:text-base">Terms of Service</span>
                    <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mt-1">Read our terms and conditions</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
