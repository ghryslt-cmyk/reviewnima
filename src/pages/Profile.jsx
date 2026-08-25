import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReviews } from '../lib/firebase';
import { User, Mail, Calendar, BookOpen, Star } from 'lucide-react';

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!isAuthenticated) return;
      
      try {
        const allReviews = await getReviews();
        // Filter reviews by user's email (if they've commented)
        // For now, we'll show all reviews since this is a personal review site
        setUserReviews(allReviews.slice(0, 6));
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-4">Please Login</h1>
          <p className="text-gray-700 dark:text-gray-300">You need to login to view your profile.</p>
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
    <div className="min-h-screen bg-white dark:bg-black py-8 sm:py-16 transition-all duration-300 lg:px-48 xl:px-64">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-black rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border-2 border-black dark:border-white">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 sm:md:space-x-8">
            <div className="flex-shrink-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-black dark:border-white shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-3xl sm:text-4xl font-bold shadow-xl">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">
                {user?.displayName || 'User'}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 sm:md:space-x-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Mail size={14} sm:size={18} />
                  <span>{user?.email}</span>
                </div>
                {user?.metadata?.createdAt && (
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Calendar size={14} sm:size={18} />
                    <span>Joined {new Date(user.metadata.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-black dark:bg-white rounded-xl shadow-lg p-4 sm:p-6 text-white dark:text-black border-2 border-black dark:border-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 dark:text-gray-600 text-xs sm:text-sm mb-1">Reviews Read</p>
                <p className="text-2xl sm:text-3xl font-bold">{userReviews.length}</p>
              </div>
              <BookOpen size={24} sm:size={32} className="text-gray-500 dark:text-gray-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 dark:bg-gray-100 rounded-xl shadow-lg p-4 sm:p-6 text-white dark:text-black border-2 border-gray-900 dark:border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 dark:text-gray-600 text-xs sm:text-sm mb-1">Account Status</p>
                <p className="text-2xl sm:text-3xl font-bold">Active</p>
              </div>
              <User size={24} sm:size={32} className="text-gray-500 dark:text-gray-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 dark:bg-gray-200 rounded-xl shadow-lg p-4 sm:p-6 text-white dark:text-black border-2 border-gray-800 dark:border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 dark:text-gray-600 text-xs sm:text-sm mb-1">Member Since</p>
                <p className="text-lg sm:text-xl font-bold">
                  {user?.metadata?.createdAt ? new Date(user.metadata.createdAt).getFullYear() : '2024'}
                </p>
              </div>
              <Star size={24} sm:size={32} className="text-gray-500 dark:text-gray-500" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-black rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-black dark:border-white">
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6">
            Recent Reviews
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
              <p className="text-sm sm:text-base">No reviews viewed yet. Start exploring!</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={logout}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 text-sm sm:text-base border-2 border-black dark:border-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
