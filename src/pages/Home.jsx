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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles size={32} className="text-yellow-400" />
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
              Review Form Morviss
            </h1>
            <Sparkles size={32} className="text-yellow-400" />
          </div>
          <p className="text-xl md:text-2xl text-purple-200 mb-8">
            Discover Amazing Anime Reviews & Insights
          </p>
          <div className="flex items-center justify-center space-x-2 text-purple-300">
            <TrendingUp size={20} />
            <span>Personal reviews from a true anime enthusiast</span>
          </div>
        </div>
      </div>

      {/* Popular Anime Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
          <TrendingUp className="mr-3 text-purple-600" size={32} />
          Popular Anime This Season
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularAnime.map((anime) => (
            <div key={anime.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {anime.coverImage?.medium && (
                <img
                  src={anime.coverImage.medium}
                  alt={anime.title.english || anime.title.romaji}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                  {anime.title.english || anime.title.romaji}
                </h3>
                <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded">
                    ★ {anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Latest Reviews
        </h2>
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.slice(0, 6).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No reviews yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              About Review Form Morviss
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg">
              Welcome to my personal anime review website! Here I share my thoughts and insights 
              on the anime I've watched. Each review comes from my personal experience and 
              perspective. Feel free to browse through my reviews and leave comments if you're 
              logged in with your Google account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
