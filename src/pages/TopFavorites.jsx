import { useState, useEffect } from 'react';
import { getFavoriteReviews } from '../lib/firebase';
import ReviewCard from '../components/ReviewCard';
import Layout from '../components/Layout';
import { Star, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';

const TopFavorites = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const [favoriteReviews, setFavoriteReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const reviews = await getFavoriteReviews();
        setFavoriteReviews(reviews);
      } catch (error) {
        console.error('Error fetching favorite reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-black dark:bg-white text-white dark:text-black py-12 sm:py-20 border-b-4 border-black dark:border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4">
            <Sparkles size={24} sm:size={32} className="text-white dark:text-black animate-spin-slow" />
            <Star size={24} sm:size={32} className="text-white dark:text-black animate-pulse" />
            <Sparkles size={24} sm:size={32} className="text-white dark:text-black animate-spin-slow" />
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white dark:text-black animate-fade-in">
            {t('topFavorites.title')}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 dark:text-gray-700 mt-4 sm:mt-6">
            {t('topFavorites.subtitle')}
          </p>
        </div>
      </div>

      {/* Favorites Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {favoriteReviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {favoriteReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-white dark:bg-black rounded-xl shadow-lg border-2 border-black dark:border-white">
            <Star size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-black dark:text-white text-base sm:text-lg">
              {t('topFavorites.noFavorites')}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TopFavorites;
