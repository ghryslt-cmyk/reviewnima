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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please Login</h1>
          <p className="text-gray-600 dark:text-gray-300">You need to login to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex-shrink-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-32 h-32 rounded-full border-4 border-purple-600 shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user?.displayName || 'User'}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Mail size={18} />
                  <span>{user?.email}</span>
                </div>
                {user?.metadata?.createdAt && (
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Calendar size={18} />
                    <span>Joined {new Date(user.metadata.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Reviews Read</p>
                <p className="text-3xl font-bold">{userReviews.length}</p>
              </div>
              <BookOpen size={32} className="text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm mb-1">Account Status</p>
                <p className="text-3xl font-bold">Active</p>
              </div>
              <User size={32} className="text-indigo-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Member Since</p>
                <p className="text-xl font-bold">
                  {user?.metadata?.createdAt ? new Date(user.metadata.createdAt).getFullYear() : '2024'}
                </p>
              </div>
              <Star size={32} className="text-blue-200" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Reviews
          </h2>
          
          {userReviews.length > 0 ? (
            <div className="space-y-4">
              {userReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  {review.animeData?.coverImage?.medium && (
                    <img
                      src={review.animeData.coverImage.medium}
                      alt={review.animeData.title?.english || review.animeData.title?.romaji}
                      className="w-16 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {review.animeData?.title?.english || review.animeData?.title?.romaji}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <Star size={16} className="text-yellow-400" fill="currentColor" />
                      <span>{review.rating}/10</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt?.toDate?.() || review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No reviews viewed yet. Start exploring!</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
