import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addReview, getReviews, deleteReview, toggleFavorite } from '../lib/firebase';
import { searchAnime, getAnimeById } from '../lib/anilist';
import { Shield, Search, Plus, Star, X, Loader2, Save, Heart } from 'lucide-react';

const Admin = () => {
  const { user, checkAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [rating, setRating] = useState(8);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Existing reviews
  const [existingReviews, setExistingReviews] = useState([]);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      
      const adminStatus = checkAdmin();
      setIsAdminUser(adminStatus);
      
      if (!adminStatus) {
        navigate('/');
        return;
      }
      
      // Load existing reviews
      try {
        const reviews = await getReviews();
        setExistingReviews(reviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
      
      setLoading(false);
    };

    checkAdminAccess();
  }, [isAuthenticated, checkAdmin, navigate]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const results = await searchAnime(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching anime:', error);
      setError('Failed to search anime. Please try again.');
    }
  };

  const handleSelectAnime = async (anime) => {
    try {
      const fullAnimeData = await getAnimeById(anime.id);
      setSelectedAnime(fullAnimeData);
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Error fetching anime details:', error);
      setError('Failed to load anime details. Please try again.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!selectedAnime || !reviewText.trim()) {
      setError('Please select an anime and write a review.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await addReview({
        animeData: selectedAnime,
        rating,
        reviewText,
        authorName: 'Morviss',
        authorEmail: user?.email
      });
      
      setSuccess('Review added successfully!');
      setSelectedAnime(null);
      setRating(8);
      setReviewText('');
      
      // Refresh existing reviews
      const reviews = await getReviews();
      setExistingReviews(reviews);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding review:', error);
      setError('Failed to add review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await deleteReview(reviewId);
      setExistingReviews(existingReviews.filter(r => r.id !== reviewId));
      setSuccess('Review deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review. Please try again.');
    }
  };

  const handleToggleFavorite = async (reviewId, currentFavorite) => {
    try {
      await toggleFavorite(reviewId, !currentFavorite);
      setExistingReviews(existingReviews.map(r => 
        r.id === reviewId ? { ...r, isFavorite: !currentFavorite } : r
      ));
      setSuccess(!currentFavorite ? 'Added to favorites!' : 'Removed from favorites!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorite status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (!isAdminUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 sm:py-16 transition-all duration-300 xl:mx-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-2 flex items-center">
            <Shield className="mr-2 sm:mr-3 text-black dark:text-white" size={32} sm:size={40} />
            Admin Panel
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            Add and manage anime reviews
          </p>
        </div>

        {/* Add Review Form */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border-2 border-gray-200 dark:border-gray-800">
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 flex items-center">
            <Plus className="mr-2 text-black dark:text-white" size={20} sm:size={24} />
            Add New Review
          </h2>

          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg">
              {success}
            </div>
          )}

          {/* Search Anime */}
          {!selectedAnime && (
            <form onSubmit={handleSearch} className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex-grow relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} sm:size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search anime from AniList..."
                    className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  Search
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
                  {searchResults.map((anime) => (
                    <div
                      key={anime.id}
                      onClick={() => handleSelectAnime(anime)}
                      className="flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b-2 border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      {anime.coverImage?.medium && (
                        <img
                          src={anime.coverImage.medium}
                          alt={anime.title.english || anime.title.romaji}
                          className="w-16 h-24 object-cover rounded mr-4 border border-gray-300 dark:border-gray-600"
                        />
                      )}
                      <div className="flex-grow">
                        <h3 className="font-bold text-black dark:text-white">
                          {anime.title.english || anime.title.romaji}
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {anime.title.native}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {anime.season} {anime.seasonYear}
                          </span>
                          {anime.episodes && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              • {anime.episodes} eps
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>
          )}

          {/* Selected Anime & Review Form */}
          {selectedAnime && (
            <form onSubmit={handleSubmitReview}>
              <div className="flex items-start space-x-4 mb-6 p-4 bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-800">
                {selectedAnime.coverImage?.large && (
                  <img
                    src={selectedAnime.coverImage.large}
                    alt={selectedAnime.title.english || selectedAnime.title.romaji}
                    className="w-32 h-48 object-cover rounded border border-gray-300 dark:border-gray-600"
                  />
                )}
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                    {selectedAnime.title.english || selectedAnime.title.romaji}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedAnime(null)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm flex items-center"
                  >
                    <X size={16} className="mr-1" />
                    Remove selection
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-black dark:text-white font-medium mb-2">
                  Rating (1-10)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-lg transition-colors ${
                        star <= rating
                          ? 'text-black dark:text-white bg-gray-200 dark:bg-gray-800'
                          : 'text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <Star size={24} fill={star <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                  <span className="ml-2 text-lg font-bold text-black dark:text-white">
                    {rating}/10
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-black dark:text-white font-medium mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your detailed review here..."
                  className="w-full p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent resize-none"
                  rows="10"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Adding Review...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Add Review</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Existing Reviews */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-800">
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6">
            Existing Reviews ({existingReviews.length})
          </h2>
          
          {existingReviews.length > 0 ? (
            <div className="space-y-4">
              {existingReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    {review.animeData?.coverImage?.medium && (
                      <img
                        src={review.animeData.coverImage.medium}
                        alt={review.animeData.title?.english || review.animeData.title?.romaji}
                        className="w-16 h-24 object-cover rounded border border-gray-300 dark:border-gray-600"
                    />
                    )}
                    <div>
                      <h3 className="font-bold text-black dark:text-white">
                        {review.animeData?.title?.english || review.animeData?.title?.romaji}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                        <Star size={16} className="text-black dark:text-white" fill="currentColor" />
                        <span>{review.rating}/10</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleFavorite(review.id, review.isFavorite)}
                      className={`p-2 rounded-lg transition-colors ${
                        review.isFavorite
                          ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                          : 'text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                      title={review.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart size={20} fill={review.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No reviews yet. Add your first review above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
