import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';
import { getReviews, getSavedAnime, updateUserDisplayName, updateUserPhotoURL, getUserRank, getUserProfile } from '../lib/firebase';
import { User, Mail, BookOpen, Star, Play, Trash2, Edit, Camera, Crown, Shield } from 'lucide-react';

const Profile = () => {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const [userReviews, setUserReviews] = useState([]);
  const [savedAnime, setSavedAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [firestoreUserData, setFirestoreUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) return;
      
      try {
        const allReviews = await getReviews();
        // Filter reviews by user's email (if they've commented)
        // For now, we'll show all reviews since this is a personal review site
        setUserReviews(allReviews.slice(0, 6));
        
        const savedAnimeData = await getSavedAnime(user.uid);
        setSavedAnime(savedAnimeData);
        
        const rank = await getUserRank(user.uid);
        setUserRank(rank);
        
        // Fetch user profile data from Firestore as fallback
        const profileData = await getUserProfile(user.uid);
        setFirestoreUserData(profileData);
        
        setNewName(user?.displayName || profileData?.displayName || '');
        setNewPhotoUrl(user?.photoURL || profileData?.photoURL || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, user]);

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    try {
      await updateUserDisplayName(user.uid, newName);
      setEditingName(false);
      // Refresh Firestore data
      const profileData = await getUserProfile(user.uid);
      setFirestoreUserData(profileData);
      await refreshUser();
      setNewName(user?.displayName || profileData?.displayName || '');
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update name');
    }
  };

  const handleUpdatePhoto = async () => {
    if (!newPhotoUrl.trim()) return;
    try {
      await updateUserPhotoURL(user.uid, newPhotoUrl);
      setEditingPhoto(false);
      // Refresh Firestore data
      const profileData = await getUserProfile(user.uid);
      setFirestoreUserData(profileData);
      await refreshUser();
      setNewPhotoUrl(user?.photoURL || profileData?.photoURL || '');
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('Failed to update photo');
    }
  };

  const isAdminRank = userRank === 'admin';

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-4">{t('profile.pleaseLogin')}</h1>
          <p className="text-gray-700 dark:text-gray-300">{t('profile.needLogin')}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 sm:py-16 transition-all duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-black rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border-2 border-black dark:border-white">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 sm:md:space-x-8">
            <div className="flex-shrink-0 relative">
              {(user?.photoURL || firestoreUserData?.photoURL) ? (
                <div className={`relative ${isAdminRank ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-black dark:ring-offset-white' : ''}`}>
                  <img
                    src={user?.photoURL || firestoreUserData?.photoURL}
                    alt={user?.displayName || firestoreUserData?.displayName}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-black dark:border-white shadow-xl"
                  />
                  {isAdminRank && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                      <Crown className="text-black" size={20} />
                    </div>
                  )}
                </div>
              ) : (
                <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-3xl sm:text-4xl font-bold shadow-xl ${isAdminRank ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-black dark:ring-offset-white' : ''}`}>
                  {(user?.displayName || firestoreUserData?.displayName)?.charAt(0) || 'U'}
                  {isAdminRank && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                      <Crown className="text-black" size={20} />
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setEditingPhoto(true)}
                className="absolute bottom-0 right-0 bg-black dark:bg-white text-white dark:text-black p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Camera size={16} />
              </button>
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                {editingName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-3 py-1 border-2 border-black dark:border-white rounded bg-white dark:bg-black text-black dark:text-white text-2xl sm:text-3xl font-bold"
                    />
                    <button
                      onClick={handleUpdateName}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingName(false);
                        setNewName(user?.displayName || '');
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isAdminRank ? 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 bg-clip-text text-transparent' : 'text-black dark:text-white'}`}>
                      {user?.displayName || firestoreUserData?.displayName || 'User'}
                    </h1>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Edit size={16} />
                    </button>
                  </>
                )}
              </div>
              {isAdminRank && (
                <div className="flex items-center justify-center md:justify-start space-x-2 mt-2">
                  <Shield className="text-yellow-400" size={16} />
                  <span className="text-yellow-400 font-bold text-sm">ADMIN</span>
                </div>
              )}
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 sm:md:space-x-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base mt-2">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Mail size={14} sm:size={18} />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Edit Modal */}
        {editingPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-black rounded-xl p-6 sm:p-8 max-w-md w-full border-2 border-black dark:border-white">
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">Update Profile Photo</h3>
              <input
                type="text"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="Enter image URL"
                className="w-full px-4 py-2 border-2 border-black dark:border-white rounded-lg bg-white dark:bg-black text-black dark:text-white mb-4"
              />
              {newPhotoUrl && (
                <img
                  src={newPhotoUrl}
                  alt="Preview"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-2 border-black dark:border-white"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setEditingPhoto(false);
                    setNewPhotoUrl(user?.photoURL || '');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePhoto}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-black dark:bg-white rounded-xl shadow-lg p-4 sm:p-6 text-white dark:text-black border-2 border-black dark:border-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 dark:text-gray-600 text-xs sm:text-sm mb-1">{t('profile.reviewsRead')}</p>
                <p className="text-2xl sm:text-3xl font-bold">{userReviews.length}</p>
              </div>
              <BookOpen size={24} sm:size={32} className="text-gray-500 dark:text-gray-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 dark:bg-gray-100 rounded-xl shadow-lg p-4 sm:p-6 text-white dark:text-black border-2 border-gray-900 dark:border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 dark:text-gray-600 text-xs sm:text-sm mb-1">{t('profile.accountStatus')}</p>
                <p className="text-2xl sm:text-3xl font-bold">{t('profile.active')}</p>
              </div>
              <User size={24} sm:size={32} className="text-gray-500 dark:text-gray-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 dark:bg-gray-200 rounded-xl shadow-lg p-4 sm:p-6 text-white dark:text-black border-2 border-gray-800 dark:border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 dark:text-gray-600 text-xs sm:text-sm mb-1">Rank</p>
                <p className="text-lg sm:text-xl font-bold">
                  {userRank ? userRank.toUpperCase() : 'None'}
                </p>
              </div>
              <Crown size={24} sm:size={32} className="text-gray-500 dark:text-gray-500" />
            </div>
          </div>

          <div className="bg-purple-900 dark:bg-purple-100 rounded-xl shadow-lg p-4 sm:p-6 text-white dark:text-black border-2 border-purple-900 dark:border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 dark:text-purple-700 text-xs sm:text-sm mb-1">Saved Anime</p>
                <p className="text-2xl sm:text-3xl font-bold">{savedAnime.length}</p>
              </div>
              <Play size={24} sm:size={32} className="text-purple-400 dark:text-purple-600" />
            </div>
          </div>
        </div>

        {/* Saved Anime Section */}
        <div className="bg-white dark:bg-black rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border-2 border-black dark:border-white">
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 flex items-center">
            <Play className="mr-3 text-black dark:text-white" size={24} />
            Saved Anime
          </h2>
          
          {savedAnime.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {savedAnime.map((anime) => (
                <div
                  key={anime.id}
                  className="relative group bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-800"
                >
                  {anime.coverImage && (
                    <img
                      src={anime.coverImage.large || anime.coverImage.medium || anime.coverImage}
                      alt={typeof anime.title === 'object' ? (anime.title.english || anime.title.romaji) : anime.title}
                      className="w-full h-32 sm:h-40 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="p-2 sm:p-3">
                    <h3 className="font-bold text-black dark:text-white text-xs sm:text-sm truncate">
                      {typeof anime.title === 'object' ? (anime.title.english || anime.title.romaji) : anime.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(anime.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
              <Play size={32} sm:size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-sm sm:text-base">No saved anime yet</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-black rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-black dark:border-white">
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6">
            {t('profile.recentReviews')}
          </h2>
          
          {userReviews.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {userReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-gray-200 dark:border-gray-800"
                >
                  {review.animeData?.coverImage?.medium && (
                    <img
                      src={review.animeData.coverImage.medium}
                      alt={review.animeData.title?.english || review.animeData.title?.romaji}
                      className="w-12 h-16 sm:w-16 sm:h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-grow">
                    <h3 className="font-bold text-black dark:text-white text-sm sm:text-base">
                      {review.animeData?.title?.english || review.animeData.title?.romaji}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <Star size={12} sm:size={16} className="text-black dark:text-white" fill="currentColor" />
                      <span>{review.rating}/10</span>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {new Date(review.createdAt?.toDate?.() || review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
              <BookOpen size={32} sm:size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-sm sm:text-base">{t('profile.noReviewsViewed')}</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={logout}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 text-sm sm:text-base border-2 border-black dark:border-white"
          >
            {t('profile.logout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
