import { useState, useEffect } from 'react';
import { getReviews } from '../lib/firebase';
import ReviewCard from '../components/ReviewCard';
import { BookOpen, Search } from 'lucide-react';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('All');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsData = await getReviews();
        setReviews(reviewsData);
        setFilteredReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    let filtered = reviews;

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

  const letters = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
            <BookOpen className="mr-3 text-purple-600" size={40} />
            All Reviews
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Browse through all anime reviews, sorted alphabetically
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search anime..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Alphabet Filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {letters.map(letter => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedLetter === letter
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-700'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No reviews found matching your criteria
            </p>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
          Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
