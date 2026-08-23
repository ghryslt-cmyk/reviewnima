import { useState, useEffect } from 'react';
import { getReviews } from '../lib/firebase';
import ReviewCard from '../components/ReviewCard';
import { TrendingUp, Sparkles, Star } from 'lucide-react';

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [topRatedReviews, setTopRatedReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reviewsData = await getReviews();
        setReviews(reviewsData);
        
        // Sort reviews by rating (highest first) and get top 6
        const sortedByRating = [...reviewsData].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setTopRatedReviews(sortedByRating.slice(0, 6));
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
      <div className="bg-black dark:bg-white text-white dark:text-black py-12 sm:py-20 border-b-4 border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4">
            <Sparkles size={24} sm:size={32} className="text-white dark:text-black animate-spin-slow" />
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white dark:text-black animate-fade-in">
              ReviewNima
            </h1>
            <Sparkles size={24} sm:size={32} className="text-white dark:text-black animate-spin-slow" />
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 dark:text-gray-700 mb-6 sm:mb-8">
            Discover Amazing Anime Reviews & Insights
          </p>
          <div className="flex items-center justify-center space-x-2 text-gray-400 dark:text-gray-600">
            <TrendingUp size={16} sm:size={20} />
            <span className="text-sm sm:text-base">Personal reviews from a true anime enthusiast</span>
          </div>
        </div>
      </div>

      {/* Top Rated Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-6 sm:mb-8 flex items-center">
          <Star className="mr-3 text-black dark:text-white" size={24} sm:size={32} />
          Top Rated Reviews
        </h2>
        {topRatedReviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {topRatedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-white dark:bg-black rounded-xl shadow-lg border-2 border-black dark:border-white">
            <p className="text-black dark:text-white text-base sm:text-lg">
              No reviews yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* Latest Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-6 sm:mb-8">
          Latest Reviews
        </h2>
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {reviews.slice(0, 6).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-white dark:bg-black rounded-xl shadow-lg border-2 border-black dark:border-white">
            <p className="text-black dark:text-white text-base sm:text-lg">
              No reviews yet. Check back soon!
            </p>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="bg-white dark:bg-black py-12 sm:py-16 border-t-2 border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-4">
              About ReviewNima
            </h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-base sm:text-lg">
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
