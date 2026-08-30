import { useState, useEffect, useCallback, memo } from 'react';
import { getReviews } from '../lib/firebase';
import ReviewCard from '../components/ReviewCard';
import Layout from '../components/Layout';
import { BookOpen, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';

const Reviews = memo(() => {
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('All');

  const fetchReviews = useCallback(async () => {
    try {
      const reviewsData = await getReviews();
      setReviews(reviewsData);
      setFilteredReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    let filtered = [...reviews];

    // Filter by letter
    if (selectedLetter !== 'All') {
      filtered = filtered.filter(review => {
        const title = review.animeData?.title?.english || review.animeData?.title?.romaji || '';
        return title.toLowerCase().startsWith(selectedLetter.toLowerCase());
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(review => {
        const title = review.animeData?.title?.english || review.animeData?.title?.romaji || '';
        return title.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Sort alphabetically
    filtered.sort((a, b) => {
      const titleA = a.animeData?.title?.english || a.animeData?.title?.romaji || '';
      const titleB = b.animeData?.title?.english || b.animeData?.title?.romaji || '';
      return titleA.localeCompare(titleB);
    });

    setFilteredReviews(filtered);
  }, [reviews, selectedLetter, searchTerm]);

  const handleLetterSelect = useCallback((letter) => {
    setSelectedLetter(letter);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const letters = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-black py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-4 flex items-center justify-center">
              <BookOpen className="mr-3 text-black dark:text-white" size={32} sm:size={40} />
              {t('reviews.title')}
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg">
              {t('reviews.subtitle')}
            </p>
          </div>

        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} sm:size={20} />
            <input
              type="text"
              placeholder={t('reviews.searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
            />
          </div>
        </div>

        {/* Alphabet Filter */}
        <div className="mb-6 sm:mb-8 flex flex-wrap justify-center gap-1 sm:gap-2">
          {letters.map(letter => (
            <button
              key={letter}
              onClick={() => handleLetterSelect(letter)}
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium text-xs sm:text-sm border-2 ${
                selectedLetter === letter
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white hover:scale-105'
                  : 'bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {filteredReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-white dark:bg-black rounded-xl shadow-lg border-2 border-black dark:border-white">
            <BookOpen size={48} sm:size={64} className="mx-auto text-gray-500 dark:text-gray-400 mb-4" />
            <p className="text-black dark:text-white text-base sm:text-lg">
              {t('reviews.noReviewsFound')}
            </p>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-6 sm:mt-8 text-center text-gray-700 dark:text-gray-300 text-sm sm:text-base">
          {t('reviews.showing')} {filteredReviews.length} {filteredReviews.length === 1 ? t('reviews.review') : t('reviews.reviews')}
        </div>
      </div>
    </div>
    </Layout>
  );
});

Reviews.displayName = 'Reviews';

export default Reviews;
