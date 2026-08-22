import { useState, useEffect } from 'react';
import { getReviews } from '../lib/firebase';
import { getPopularAnime } from '../lib/anilist';
import ReviewCard from '../components/ReviewCard';
import { TrendingUp, Sparkles } from 'lucide-react';

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsData, animeData] = await Promise.all([
          getReviews(),
          getPopularAnime(1, 6)
        ]);
        setReviews(reviewsData);
        setPopularAnime(animeData);
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
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-all duration-300">
      {/* Hero Section */}
      <div className="bg-black dark:bg-white text-white dark:text-black py-12 sm:py-20 border-b border-gray-800 dark:border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4">
            <Sparkles size={24} sm:size={32} className="text-gray-400 dark:text-gray-600 animate-spin-slow" />
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-black dark:to-gray-800 animate-fade-in">
              ReviewNima
            </h1>
            <Sparkles size={24} sm:size={32} className="text-gray-400 dark:text-gray-600 animate-spin-slow" />
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 dark:text-gray-600 mb-6 sm:mb-8">
            Discover Amazing Anime Reviews & Insights
          </p>
          <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-500">
            <TrendingUp size={16} sm:size={20} />
            <span className="text-sm sm:text-base">Personal reviews from a true anime enthusiast</span>
          </div>
        </div>
      </div>

      {/* Popular Anime Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 flex items-center">
          <TrendingUp className="mr-3 text-gray-600 dark:text-gray-400" size={24} sm:size={32} />
          Popular Anime This Season
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {popularAnime.map((anime) => (
            <div key={anime.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-800">
              {anime.coverImage?.medium && (
                <img
                  src={anime.coverImage.medium}
                  alt={anime.title.english || anime.title.romaji}
                  className="w-full h-32 sm:h-40 object-cover"
                />
              )}
              <div className="p-2 sm:p-3">
                <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2">
                  {anime.title.english || anime.title.romaji}
                </h3>
                <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                    ★ {anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
          Latest Reviews
        </h2>
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {reviews.slice(0, 6).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
              No reviews yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-12 sm:py-16 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              About ReviewNima
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-base sm:text-lg">
              ReviewNima adalah website untuk kumpulan review dari konten reviewanime di channel Morviss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
