import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';
import { getReviews, getSavedAnime, updateUserDisplayName, updateUserPhotoURL, getUserRank, getUserProfile, getUserRankByEmail, getUserDonationSummary } from '../lib/firebase';
import { formatRupiah } from '../lib/donation';
import { User, BookOpen, Star, Play, Trash2, Edit, Camera, Crown, Fingerprint, Copy, Check, Heart, Gem } from 'lucide-react';
import { CrownMedallion, adminNameClass, AdminLabel, rankNameClass, RankLabel } from '../components/AdminBadge';

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
  const [copiedUid, setCopiedUid] = useState(false);
  const [donationSummary, setDonationSummary] = useState({ total: 0, count: 0, lastDonationAt: null, lastDonationRank: null });

  const handleCopyUid = async () => {
    if (!user?.uid) return;
    try {
      await navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    } catch (error) {
      console.error('Failed to copy UID:', error);
    }
  };

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
        
        let rank = await getUserRank(user.uid);
        console.log('Profile - User rank from UID:', rank, 'type:', typeof rank, 'for user:', user.uid);
        
        // Fallback to email-based lookup if rank not found
        if (!rank && user?.email) {
          rank = await getUserRankByEmail(user.email);
          console.log('Profile - User rank from email fallback:', rank, 'for email:', user.email);
        }
        
        console.log('Profile - isAdminRank check:', rank === 'admin');
        setUserRank(rank);
        
        // Fetch user profile data from Firestore as fallback
        const profileData = await getUserProfile(user.uid);
        setFirestoreUserData(profileData);

        // Donation totals written by the Cloudflare Worker
        const summary = await getUserDonationSummary(user.uid);
        setDonationSummary(summary);
        
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
  
  console.log('Profile - Render state:', { userRank, isAdminRank, user });

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-black rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border-2 border-black dark:border-white">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 sm:md:space-x-8">
            <div className="flex-shrink-0 relative">
              {(user?.photoURL || firestoreUserData?.photoURL) ? (
                <div className={`relative rounded-full ${isAdminRank ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black dark:ring-offset-white shadow-[0_0_0_2px_rgba(250,204,21,0.45),0_0_20px_rgba(250,204,21,0.5)]' : ''}`}>
                  <img
                    src={user?.photoURL || firestoreUserData?.photoURL}
                    alt={user?.displayName || firestoreUserData?.displayName}
                    className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-xl ${isAdminRank ? 'border-2 border-yellow-400' : 'border-4 border-black dark:border-white'}`}
                  />
                  {isAdminRank && (
                    <CrownMedallion badgeClass="w-8 h-8 sm:w-9 sm:h-9" iconSize={17} stroke={2.5} animate="animate-pulse" />
                  )}
                </div>
              ) : (
                <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-3xl sm:text-4xl font-bold shadow-xl ${isAdminRank ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black dark:ring-offset-white shadow-[0_0_0_2px_rgba(250,204,21,0.45),0_0_20px_rgba(250,204,21,0.5)]' : ''}`}>
                  {(user?.displayName || firestoreUserData?.displayName)?.charAt(0) || 'U'}
                  {isAdminRank && (
                    <CrownMedallion badgeClass="w-8 h-8 sm:w-9 sm:h-9" iconSize={17} stroke={2.5} animate="animate-pulse" />
                  )}
                </div>
              )}
              <button
                onClick={() => setEditingPhoto(true)}
                className="absolute bottom-0 right-0 bg-brand-gradient text-white p-2 rounded-full shadow-glow hover:scale-110 transition-transform"
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
                      className="bg-brand-gradient text-white px-3 py-1 rounded hover:opacity-90 transition-opacity"
                    >
                      {t('profile.save')}
                    </button>
                    <button
                      onClick={() => {
                        setEditingName(false);
                        setNewName(user?.displayName || '');
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      {t('profile.cancel')}
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className={`text-2xl sm:text-3xl font-bold mb-2 flex items-center space-x-2 ${userRank ? rankNameClass(userRank) : 'text-black dark:text-white'}`}>
                      {userRank && <Crown className="shrink-0 text-amber-500" size={22} strokeWidth={2.5} />}
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
              {userRank && (
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <RankLabel rank={userRank} />
                </div>
              )}
              <div className="mt-3 flex flex-col items-center gap-2 md:items-start">
                <button
                  onClick={handleCopyUid}
                  title={t('profile.copyUidTitle')}
                  className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
                >
                  <Fingerprint size={14} className="text-brand-500 dark:text-brand-400" />
                  <span className="font-mono max-w-[180px] truncate sm:max-w-[280px]">{user?.uid || 'â€”'}</span>
                  {copiedUid ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} className="opacity-60 transition-opacity group-hover:opacity-100" />
                  )}
                </button>
                {copiedUid && (
                  <span className="text-[11px] font-medium text-emerald-500">{t('profile.uidCopied')}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Donation / rank CTA */}
        <div className="mb-6 overflow-hidden rounded-xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-cyan-50 p-4 dark:border-brand-900/60 dark:from-brand-500/10 dark:to-cyan-500/10 sm:mb-8 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <Heart size={22} />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">{t('profile.supportTitle')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.supportDesc')}</p>
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:ml-auto sm:items-end">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('profile.donatedTotal')}:{' '}
                <b className="text-gray-900 dark:text-white">{formatRupiah(donationSummary.total)}</b>
                {donationSummary.count > 0 ? ` Â· ${donationSummary.count}x` : ''}
              </div>
              <Link
                to="/donate"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105"
              >
                <Gem size={16} /> {t('profile.supportCta')}
              </Link>
            </div>
          </div>
        </div>

        {/* Photo Edit Modal */}
        {/* Photo Edit Modal */}
        {editingPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-black rounded-xl p-6 sm:p-8 max-w-md w-full border-2 border-black dark:border-white">
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">{t('profile.updatePhoto')}</h3>
              <input
                type="text"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder={t('profile.imageUrlPlaceholder')}
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
                  {t('profile.cancel')}
                </button>
                <button
                  onClick={handleUpdatePhoto}
                  className="px-4 py-2 bg-brand-gradient text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  {t('profile.save')}
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
              <BookOpen size={24} className="text-gray-500 dark:text-gray-500" />
            </div>
          </div>
          
          <div className="bg-gray-900 dark:bg-gray-100 rounded-xl shadow-lg p-4 sm:p-6 text-white dark:text-black border-2 border-gray-900 dark:border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 dark:text-gray-600 text-xs sm:text-sm mb-1">{t('profile.accountStatus')}</p>
                <p className="text-2xl sm:text-3xl font-bold">{t('profile.active')}</p>
              </div>
              <User size={24} className="text-gray-500 dark:text-gray-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 dark:bg-gray-200 rounded-xl shadow-lg p-4 sm:p-6 text-white dark:text-black border-2 border-gray-800 dark:border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 dark:text-gray-600 text-xs sm:text-sm mb-1">{t('profile.rank')}</p>
                <p className="text-lg sm:text-xl font-bold">
                  {userRank ? userRank.toUpperCase() : t('profile.none')}
                </p>
              </div>
              <Crown size={24} className="text-gray-500 dark:text-gray-500" />
            </div>
          </div>

          <div className="bg-black dark:bg-black rounded-xl shadow-lg p-4 sm:p-6 text-white dark:text-white border-2 border-gray-700 dark:border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 dark:text-gray-700 text-xs sm:text-sm mb-1">{t('profile.savedAnime')}</p>
                <p className="text-2xl sm:text-3xl font-bold">{savedAnime.length}</p>
              </div>
              <Play size={24} className="text-gray-400 dark:text-gray-600" />
            </div>
          </div>
        </div>

        {/* Saved Anime Section */}
        <div className="bg-white dark:bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border-2 border-black dark:border-white">
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 flex items-center">
            <Play className="mr-3 text-black dark:text-white" size={24} />
            {t('profile.savedAnime')}
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
              <Play size={32} className="mx-auto mb-4 text-gray-400" />
              <p className="text-sm sm:text-base">{t('profile.noSavedAnime')}</p>
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
                      <Star size={12} className="text-black dark:text-white" fill="currentColor" />
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
              <BookOpen size={32} className="mx-auto mb-4 text-gray-400" />
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
