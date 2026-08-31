import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addReview, getReviews, deleteReview, toggleFavorite, getVisitorCount, updateReview, addAnime, getAllAnime, deleteAnime, addAnimeEpisode, getAnimeEpisodes, updateAnimeEpisode, deleteAnimeEpisode } from '../lib/firebase';
import { searchAnime, getAnimeById } from '../lib/anilist';
import { Shield, Search, Plus, Star, X, Loader2, Save, Heart, Users, Edit, Film, Trash2, Play, ChevronLeft, ChevronRight } from 'lucide-react';

const Admin = memo(() => {
  const { user, checkAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [rating, setRating] = useState(8);
  const [reviewTextId, setReviewTextId] = useState('');
  const [reviewTextEn, setReviewTextEn] = useState('');
  const [reviewTextJp, setReviewTextJp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  
  // Existing reviews
  const [existingReviews, setExistingReviews] = useState([]);
  
  // Visitor count
  const [visitorCount, setVisitorCount] = useState(0);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' or 'anime'
  
  // Anime management state
  const [animeSearchTerm, setAnimeSearchTerm] = useState('');
  const [animeSearchResults, setAnimeSearchResults] = useState([]);
  const [selectedAnimeForManagement, setSelectedAnimeForManagement] = useState(null);
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [episodes, setEpisodes] = useState([]);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [allAnimeList, setAllAnimeList] = useState([]);
  const [selectedManageAnime, setSelectedManageAnime] = useState(null);
  const [manageEpisodes, setManageEpisodes] = useState([]);

  const checkAdminAccess = useCallback(async () => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectPath', location.pathname);
      navigate('/login');
      return;
    }
    
    const adminStatus = checkAdmin();
    setIsAdminUser(adminStatus);
    
    if (!adminStatus) {
      navigate('/');
      return;
    }
    
    try {
      const [reviews, count, animeList] = await Promise.all([
        getReviews(),
        getVisitorCount(),
        getAllAnime()
      ]);
      setExistingReviews(reviews);
      setVisitorCount(count);
      setAllAnimeList(animeList);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, checkAdmin, navigate, location.pathname]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const results = await searchAnime(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching anime:', error);
      setError('Failed to search anime. Please try again.');
    }
  }, [searchTerm]);

  const handleAnimeSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!animeSearchTerm.trim()) return;

    try {
      const results = await searchAnime(animeSearchTerm);
      setAnimeSearchResults(results);
    } catch (error) {
      console.error('Error searching anime:', error);
      setError('Failed to search anime. Please try again.');
    }
  }, [animeSearchTerm]);

  const handleSelectAnime = useCallback(async (anime) => {
    try {
      const fullAnimeData = await getAnimeById(anime.id);
      setSelectedAnime(fullAnimeData);
      setSearchResults([]);
      setSearchTerm('');
    } catch (error) {
      console.error('Error fetching anime details:', error);
      setError('Failed to load anime details. Please try again.');
    }
  }, []);

  const handleSelectAnimeForManagement = useCallback(async (anime) => {
    try {
      const fullAnimeData = await getAnimeById(anime.id);
      setSelectedAnimeForManagement(fullAnimeData);
      setAnimeSearchResults([]);
      setAnimeSearchTerm('');
      
      const existingEpisodes = await getAnimeEpisodes(anime.id.toString());
      setEpisodes(existingEpisodes);
      setEpisodeNumber(existingEpisodes.length + 1);
    } catch (error) {
      console.error('Error fetching anime details:', error);
      setError('Failed to load anime details. Please try again.');
    }
  }, []);

  const handleAddAnime = useCallback(async () => {
    if (!selectedAnimeForManagement) {
      setError('Please select an anime first.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await addAnime({
        anilistId: selectedAnimeForManagement.id,
        animeData: selectedAnimeForManagement
      });
      
      setSuccess('Anime added successfully!');
      setSelectedAnimeForManagement(null);
      setEpisodes([]);
      setEpisodeNumber(1);
      setEpisodeTitle('');
      setVideoUrl('');
      
      const animeList = await getAllAnime();
      setAllAnimeList(animeList);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding anime:', error);
      setError('Failed to add anime. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedAnimeForManagement]);

  const handleAddEpisode = useCallback(async (e) => {
    e.preventDefault();
    
    if (!selectedAnimeForManagement || !videoUrl.trim()) {
      setError('Please provide a video URL for the episode.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const episodeData = {
        episodeNumber,
        title: episodeTitle,
        videoUrl
      };

      if (editingEpisode) {
        await updateAnimeEpisode(selectedAnimeForManagement.id.toString(), editingEpisode.id, episodeData);
        setSuccess('Episode updated successfully!');
        setEditingEpisode(null);
      } else {
        await addAnimeEpisode(selectedAnimeForManagement.id.toString(), episodeData);
        setSuccess('Episode added successfully!');
      }
      
      setEpisodeNumber(prev => prev + 1);
      setEpisodeTitle('');
      setVideoUrl('');
      
      const updatedEpisodes = await getAnimeEpisodes(selectedAnimeForManagement.id.toString());
      setEpisodes(updatedEpisodes);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding/updating episode:', error);
      setError('Failed to add/update episode. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedAnimeForManagement, episodeNumber, episodeTitle, videoUrl, editingEpisode]);

  const handleEditEpisode = useCallback((episode) => {
    setEpisodeNumber(episode.episodeNumber);
    setEpisodeTitle(episode.title || '');
    setVideoUrl(episode.videoUrl);
    setEditingEpisode(episode);
  }, []);

  const handleDeleteEpisode = useCallback(async (episodeId) => {
    if (!window.confirm('Are you sure you want to delete this episode?')) return;
    
    try {
      await deleteAnimeEpisode(selectedAnimeForManagement.id.toString(), episodeId);
      setSuccess('Episode deleted successfully!');
      
      const updatedEpisodes = await getAnimeEpisodes(selectedAnimeForManagement.id.toString());
      setEpisodes(updatedEpisodes);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting episode:', error);
      setError('Failed to delete episode. Please try again.');
    }
  }, [selectedAnimeForManagement]);

  const handleDeleteAnime = useCallback(async (animeId) => {
    if (!window.confirm('Are you sure you want to delete this anime and all its episodes?')) return;
    
    try {
      await deleteAnime(animeId);
      setSuccess('Anime deleted successfully!');
      
      const animeList = await getAllAnime();
      setAllAnimeList(animeList);
      
      if (selectedManageAnime?.id === animeId) {
        setSelectedManageAnime(null);
        setManageEpisodes([]);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting anime:', error);
      setError('Failed to delete anime. Please try again.');
    }
  }, [selectedManageAnime]);

  const handleSelectManageAnime = useCallback(async (anime) => {
    setSelectedManageAnime(anime);
    try {
      const animeEpisodes = await getAnimeEpisodes(anime.anilistId?.toString() || anime.id);
      setManageEpisodes(animeEpisodes);
    } catch (error) {
      console.error('Error loading episodes:', error);
      setManageEpisodes([]);
    }
  }, []);

  const handleSubmitReview = useCallback(async (e) => {
    e.preventDefault();
    
    if (!selectedAnime || !reviewTextId.trim()) {
      setError('Please select an anime and write a review in Indonesian.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const reviewData = {
        animeData: selectedAnime,
        rating,
        reviewTextId,
        reviewTextEn: reviewTextEn.trim() || reviewTextId,
        reviewTextJp: reviewTextJp.trim() || reviewTextId,
        authorName: 'Morviss',
        authorEmail: user?.email
      };

      if (editingReview) {
        await updateReview(editingReview.id, reviewData);
        setSuccess('Review updated successfully!');
      } else {
        await addReview(reviewData);
        setSuccess('Review added successfully!');
      }
      
      setSelectedAnime(null);
      setRating(8);
      setReviewTextId('');
      setReviewTextEn('');
      setReviewTextJp('');
      setEditingReview(null);
      
      const reviews = await getReviews();
      setExistingReviews(reviews);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding/updating review:', error);
      setError('Failed to add/update review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedAnime, rating, reviewTextId, reviewTextEn, reviewTextJp, user?.email, editingReview]);

  const handleDeleteReview = useCallback(async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await deleteReview(reviewId);
      setExistingReviews(prev => prev.filter(r => r.id !== reviewId));
      setSuccess('Review deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review. Please try again.');
    }
  }, []);

  const handleEditReview = useCallback(async (review) => {
    setSelectedAnime(review.animeData);
    setRating(review.rating);
    setReviewTextId(review.reviewTextId || review.reviewText || '');
    setReviewTextEn(review.reviewTextEn || '');
    setReviewTextJp(review.reviewTextJp || '');
    setEditingReview(review);
  }, []);

  const handleToggleFavorite = useCallback(async (reviewId, currentFavorite) => {
    try {
      await toggleFavorite(reviewId, !currentFavorite);
      setExistingReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, isFavorite: !currentFavorite } : r
      ));
      setSuccess(!currentFavorite ? 'Added to favorites!' : 'Removed from favorites!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorite status. Please try again.');
    }
  }, []);

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
    <div className="min-h-screen bg-white dark:bg-black py-8 sm:py-16 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-2 flex items-center">
            <Shield className="mr-2 sm:mr-3 text-black dark:text-white" size={32} sm:size={40} />
            Admin Panel
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            Add and manage anime reviews and episodes
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 sm:mb-8 border-b-2 border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 sm:px-6 py-3 font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Reviews
          </button>
          <button
            onClick={() => setActiveTab('anime')}
            className={`px-4 sm:px-6 py-3 font-medium transition-colors ${
              activeTab === 'anime'
                ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Anime & Episodes
          </button>
        </div>

        {/* Visitor Count Card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-900 dark:to-blue-900 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border-2 border-purple-400 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center">
                <Users className="mr-2" size={24} sm:size={28} />
                Total Visitors
              </h2>
              <p className="text-purple-100 dark:text-purple-200 text-sm sm:text-base">
                Live visitor count
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                {visitorCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <>
            {/* Add Review Form */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border-2 border-gray-200 dark:border-gray-800">
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 flex items-center">
            <Plus className="mr-2 text-black dark:text-white" size={20} sm:size={24} />
            {editingReview ? 'Edit Review' : 'Add New Review'}
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

              {/* Review Text - Indonesian */}
              <div className="mb-6">
                <label className="block text-black dark:text-white font-medium mb-2">
                  Review (Indonesian) *
                </label>
                <textarea
                  value={reviewTextId}
                  onChange={(e) => setReviewTextId(e.target.value)}
                  placeholder="Tulis review detail di sini..."
                  className="w-full p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent resize-none"
                  rows="6"
                  required
                />
              </div>

              {/* Review Text - English */}
              <div className="mb-6">
                <label className="block text-black dark:text-white font-medium mb-2">
                  Review (English)
                </label>
                <textarea
                  value={reviewTextEn}
                  onChange={(e) => setReviewTextEn(e.target.value)}
                  placeholder="Write your detailed review here..."
                  className="w-full p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent resize-none"
                  rows="6"
                />
              </div>

              {/* Review Text - Japanese */}
              <div className="mb-6">
                <label className="block text-black dark:text-white font-medium mb-2">
                  Review (Japanese)
                </label>
                <textarea
                  value={reviewTextJp}
                  onChange={(e) => setReviewTextJp(e.target.value)}
                  placeholder="ここに詳細なレビューを書いてください..."
                  className="w-full p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent resize-none"
                  rows="6"
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
                    <span>{editingReview ? 'Updating Review...' : 'Adding Review...'}</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>{editingReview ? 'Update Review' : 'Add Review'}</span>
                  </>
                )}
              </button>

              {editingReview && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAnime(null);
                    setRating(8);
                    setReviewTextId('');
                    setReviewTextEn('');
                    setReviewTextJp('');
                    setEditingReview(null);
                  }}
                  className="ml-4 flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                >
                  <X size={20} />
                  <span>Cancel Edit</span>
                </button>
              )}
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
                          onClick={() => handleEditReview(review)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                        >
                          <Edit size={20} />
                        </button>
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
          </>
        )}

        {/* Anime & Episodes Tab */}
        {activeTab === 'anime' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Add Anime Sub-tab */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-800">
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 flex items-center">
                <Search className="mr-2 text-black dark:text-white" size={20} sm:size={24} />
                Search Anime from AniList
              </h2>

              <form onSubmit={handleAnimeSearch} className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex-grow relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} sm:size={20} />
                    <input
                      type="text"
                      value={animeSearchTerm}
                      onChange={(e) => setAnimeSearchTerm(e.target.value)}
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

                {animeSearchResults.length > 0 && (
                  <div className="mt-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
                    {animeSearchResults.map((anime) => (
                      <div
                        key={anime.id}
                        onClick={() => handleSelectAnimeForManagement(anime)}
                        className="flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b-2 border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors"
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
            </div>

            {/* Selected Anime & Episode Management */}
            {selectedAnimeForManagement && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-800">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white flex items-center">
                    <Film className="mr-2 text-black dark:text-white" size={20} sm:size={24} />
                    Manage Episodes
                  </h2>
                  <button
                    onClick={() => setSelectedAnimeForManagement(null)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm flex items-center"
                  >
                    <X size={16} className="mr-1" />
                    Clear selection
                  </button>
                </div>

                <div className="flex items-start space-x-4 mb-6 p-4 bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-800">
                  {selectedAnimeForManagement.coverImage?.large && (
                    <img
                      src={selectedAnimeForManagement.coverImage.large}
                      alt={selectedAnimeForManagement.title.english || selectedAnimeForManagement.title.romaji}
                      className="w-32 h-48 object-cover rounded border border-gray-300 dark:border-gray-600"
                    />
                  )}
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                      {selectedAnimeForManagement.title.english || selectedAnimeForManagement.title.romaji}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {selectedAnimeForManagement.title.native}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnimeForManagement.genres?.slice(0, 5).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-xs"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAddEpisode} className="mb-6">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">
                    {editingEpisode ? 'Edit Episode' : 'Add New Episode'}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-black dark:text-white font-medium mb-2">
                        Episode Number
                      </label>
                      <input
                        type="number"
                        value={episodeNumber}
                        onChange={(e) => setEpisodeNumber(parseInt(e.target.value))}
                        min="1"
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-black dark:text-white font-medium mb-2">
                        Episode Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={episodeTitle}
                        onChange={(e) => setEpisodeTitle(e.target.value)}
                        placeholder="Episode title"
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-black dark:text-white font-medium mb-2">
                      Archive.org Video URL *
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://archive.org/embed/..."
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Use the embed URL from archive.org (e.g., https://archive.org/embed/identifier)
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center space-x-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>{editingEpisode ? 'Updating...' : 'Adding...'}</span>
                        </>
                      ) : (
                        <>
                          <Plus size={20} />
                          <span>{editingEpisode ? 'Update Episode' : 'Add Episode'}</span>
                        </>
                      )}
                    </button>
                    
                    {editingEpisode && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEpisode(null);
                          setEpisodeTitle('');
                          setVideoUrl('');
                        }}
                        className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                      >
                        <X size={20} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </form>

                {episodes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white mb-4">
                      Episodes ({episodes.length})
                    </h3>
                    <div className="space-y-3">
                      {episodes.map((episode) => (
                        <div
                          key={episode.id}
                          className="flex items-center justify-between p-4 bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-800"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg">
                              <Play size={20} className="text-black dark:text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-black dark:text-white">
                                Episode {episode.episodeNumber}
                              </h4>
                              {episode.title && (
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {episode.title}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditEpisode(episode)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteEpisode(episode.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-800">
                  <button
                    onClick={handleAddAnime}
                    disabled={submitting || episodes.length === 0}
                    className="flex items-center space-x-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                  >
                    <Save size={20} />
                    <span>Save Anime with {episodes.length} Episode{episodes.length !== 1 ? 's' : ''}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Manage Anime */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-800">
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 flex items-center">
                <Film className="mr-2 text-black dark:text-white" size={20} sm:size={24} />
                All Anime ({allAnimeList.length})
              </h2>
              
              {allAnimeList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allAnimeList.map((anime) => (
                    <div
                      key={anime.id}
                      onClick={() => handleSelectManageAnime(anime)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedManageAnime?.id === anime.id
                          ? 'bg-gray-200 dark:bg-gray-800 border-black dark:border-white'
                          : 'bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:border-gray-400'
                      }`}
                    >
                      {anime.animeData?.coverImage?.medium && (
                        <img
                          src={anime.animeData.coverImage.medium}
                          alt={anime.animeData.title?.english || anime.animeData.title?.romaji}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-bold text-black dark:text-white line-clamp-1">
                        {anime.animeData?.title?.english || anime.animeData?.title?.romaji}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {anime.anilistId || anime.id}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnime(anime.id);
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No anime added yet.
                </div>
              )}
            </div>

            {/* Selected Anime Episodes */}
            {selectedManageAnime && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white flex items-center">
                    <Film className="mr-2 text-black dark:text-white" size={20} sm:size={24} />
                    Episodes for {selectedManageAnime.animeData?.title?.english || selectedManageAnime.animeData?.title?.romaji}
                  </h2>
                </div>
                
                {manageEpisodes.length > 0 ? (
                  <div className="space-y-3">
                    {manageEpisodes.map((episode) => (
                      <div
                        key={episode.id}
                        className="flex items-center justify-between p-4 bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-800"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg">
                            <Play size={20} className="text-black dark:text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-black dark:text-white">
                              Episode {episode.episodeNumber}
                            </h4>
                            {episode.title && (
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {episode.title}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEpisode(episode.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    No episodes added for this anime yet.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

Admin.displayName = 'Admin';

export default Admin;
