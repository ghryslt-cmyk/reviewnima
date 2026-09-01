import { useState, useEffect, useCallback, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimeById } from '../lib/anilist';
import { getAnimeEpisodes, addAnimeEpisode, updateAnimeEpisode, deleteAnimeEpisode, getComments, addComment } from '../lib/firebase';
import WatchLayout from '../components/WatchLayout';
import { Play, ThumbsUp, ThumbsDown, Share, Bookmark, Flag, Loader2, X, AlertCircle, Heart, MessageSquare, Send, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../lib/translations';

const AnimeWatch = memo(() => {
  const { id } = useParams();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { user, isAuthenticated } = useAuth();
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchAnimeData = useCallback(async () => {
    try {
      setLoading(true);
      const [animeData, episodesData] = await Promise.all([
        getAnimeById(id),
        getAnimeEpisodes(id)
      ]);
      setAnime(animeData);
      setEpisodes(episodesData);
      if (episodesData.length > 0) {
        setCurrentEpisode(episodesData[0]);
      }
    } catch (err) {
      console.error('Error fetching anime data:', err);
      setError(t('animeWatch.error'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchAnimeData();
  }, [fetchAnimeData]);

  const handleEpisodeChange = useCallback((episode) => {
    setCurrentEpisode(episode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePreviousEpisode = useCallback(() => {
    const currentIndex = episodes.findIndex(ep => ep.id === currentEpisode?.id);
    if (currentIndex > 0) {
      handleEpisodeChange(episodes[currentIndex - 1]);
    }
  }, [episodes, currentEpisode, handleEpisodeChange]);

  const handleNextEpisode = useCallback(() => {
    const currentIndex = episodes.findIndex(ep => ep.id === currentEpisode?.id);
    if (currentIndex < episodes.length - 1) {
      handleEpisodeChange(episodes[currentIndex + 1]);
    }
  }, [episodes, currentEpisode, handleEpisodeChange]);

  const handleShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  const copyShareLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareModal(false);
  }, []);

  const handleSubmitComment = useCallback(async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;

    setSubmittingComment(true);
    try {
      await addComment(id, {
        text: commentText,
        author: user.displayName,
        authorEmail: user.email,
        authorPhotoURL: user.photoURL
      });
      
      const commentsData = await getComments(id);
      setComments(commentsData);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  }, [id, isAuthenticated, user]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsData = await getComments(id);
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, [id]);

  if (loading) {
    return (
      <WatchLayout>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-center">
            <Loader2 className="animate-spin text-white mx-auto mb-4" size={48} />
            <p className="text-white">{t('animeWatch.loading')}</p>
          </div>
        </div>
      </WatchLayout>
    );
  }

  if (error || !anime) {
    return (
      <WatchLayout>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error || t('animeWatch.animeNotFound')}</p>
            <Link to="/" className="text-white hover:text-gray-300 hover:underline">
              {t('animeWatch.returnHome')}
            </Link>
          </div>
        </div>
      </WatchLayout>
    );
  }

  return (
    <WatchLayout>
      <div className="w-full bg-black">
        {/* Main Layout - CSS Grid 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 py-6 max-w-[1920px] mx-auto">
          {/* Main Content - Left Column (75%) */}
          <div className="lg:col-span-3 min-w-0">
            {/* Video Player */}
            <div className="w-full aspect-video bg-black flex items-center justify-center mb-4">
              {currentEpisode ? (
                currentEpisode.videoUrl.match(/\.(mp4|webm|ogg|m3u8|mpd)(\?.*)?$/i) ? (
                  <video
                    src={currentEpisode.videoUrl}
                    className="w-full h-full max-w-full"
                    controls
                    autoPlay
                    title={`Episode ${currentEpisode.episodeNumber}`}
                    allowFullScreen
                  />
                ) : (
                  <iframe
                    src={currentEpisode.videoUrl}
                    className="w-full h-full max-w-full"
                    allowFullScreen
                    title={`Episode ${currentEpisode.episodeNumber}`}
                    allow="autoplay; fullscreen"
                    scrolling="no"
                    frameBorder="0"
                  />
                )
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <Play size={48} className="mx-auto mb-4 opacity-50 text-gray-500" />
                    <p className="text-lg text-white">{t('animeWatch.noEpisodes')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                <ThumbsUp size={18} />
                <span>Like</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                <ThumbsDown size={18} />
                <span>Dislike</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Share size={18} />
                <span>Share</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                <Bookmark size={18} />
                <span>Save</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                <Flag size={18} />
                <span>Report</span>
              </button>
            </div>

            {/* Content Information */}
            <div className="flex gap-4 mb-4">
              {anime.coverImage?.extraLarge && (
                <div className="flex-shrink-0">
                  <img
                    src={anime.coverImage.extraLarge}
                    alt={anime.title.english || anime.title.romaji}
                    className="w-32 h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-grow min-w-0">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {language === 'id' && anime.title?.english ? anime.title.english :
                   language === 'en' && anime.title?.english ? anime.title.english :
                   language === 'jp' && anime.title?.native ? anime.title.native :
                   anime.title.english || anime.title.romaji}
                </h1>
                {currentEpisode && (
                  <p className="text-lg text-gray-300 mb-2">
                    {t('animeWatch.episode')} {currentEpisode.episodeNumber}
                    {currentEpisode.title && `: ${currentEpisode.title}`}
                  </p>
                )}
                {(language === 'jp' ? anime.title?.romaji : anime.title?.native) && (
                  <p className="text-gray-400 mb-2">
                    {language === 'jp' ? anime.title?.romaji : anime.title?.native}
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres?.slice(0, 10).map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Description */}
            {anime.description && (
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-2">{t('animeWatch.synopsis')}</h3>
                <div
                  className="prose prose-invert max-w-none text-gray-300 text-sm"
                  dangerouslySetInnerHTML={{ __html: anime.description }}
                />
              </div>
            )}

            {/* Comments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <MessageSquare className="mr-2" size={20} />
                  Comments ({comments.length})
                </h3>
              </div>
              
              {/* Comment Form */}
              {isAuthenticated ? (
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <div className="flex space-x-4">
                    {user?.photoURL && (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full border-2 border-gray-600"
                      />
                    )}
                    <div className="flex-grow">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-4 border-2 border-gray-700 rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                        rows="3"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingComment || !commentText.trim()}
                          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500 px-6 py-2 rounded-lg transition-colors"
                        >
                          <Send size={18} />
                          <span>{submittingComment ? 'Sending...' : 'Send Comment'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-6 p-4 bg-gray-800 rounded-lg text-center border-2 border-gray-700">
                  <p className="text-white">
                    Please <Link to="/login" className="text-cyan-400 hover:text-cyan-300 underline">login</Link> to leave a comment.
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} className="flex space-x-4 p-4 bg-gray-800 rounded-lg">
                      {comment.authorPhotoURL ? (
                        <img
                          src={comment.authorPhotoURL}
                          alt={comment.author}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">
                          {comment.author?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-bold text-white">{comment.author}</span>
                          <span className="text-sm text-gray-400">
                            {new Date(comment.createdAt?.toDate?.() || comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300">{comment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column (25%) */}
          <div className="lg:col-span-1 min-w-0">
            {/* Alert */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-white font-semibold mb-1">Important Notice</h4>
                  <p className="text-gray-400 text-sm">Jika video eps anime yang kalian tonton tidak bisa berjalan maka limit Bandwidth sudah penuh, saya memakai free cloud storage jadi akan ada limit Bandwidth harian. Jika kalian ingin website ini bisa streaming semua anime tanpa limit Bandwidth harian, kalian bisa donasi di bawah ini....</p>
                </div>
              </div>
            </div>

            {/* Donation Banner */}
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="text-white" size={20} />
                <h4 className="text-white font-semibold">Support Us</h4>
              </div>
              <p className="text-gray-100 text-sm mb-3">Help keep this site running by donating.</p>
              <button className="w-full px-4 py-2 bg-white text-cyan-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Donate Now
              </button>
            </div>

            {/* Episode List - Text Only */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-4">Episodes ({episodes.length})</h3>
              <div className="space-y-2">
                {episodes.map((episode) => (
                  <button
                    key={episode.id}
                    onClick={() => handleEpisodeChange(episode)}
                    className={`w-full px-4 py-3 text-left rounded-lg transition-colors ${
                      currentEpisode?.id === episode.id
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">{t('animeWatch.episode')} {episode.episodeNumber}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{t('animeWatch.shareAnime')}</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('animeWatch.shareLink')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={window.location.href}
                    readOnly
                    className="flex-grow px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    {t('animeWatch.copy')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </WatchLayout>
  );
});

AnimeWatch.displayName = 'AnimeWatch';

export default AnimeWatch;
