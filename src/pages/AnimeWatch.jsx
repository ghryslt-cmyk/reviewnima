import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimeById } from '../lib/anilist';
import { getAnimeEpisodes, addAnimeEpisode, updateAnimeEpisode, deleteAnimeEpisode, getAnimeComments, addAnimeComment, deleteAnimeComment, addAnimeCommentReply, getAnimeCommentReplies, saveAnimeToProfile, removeAnimeFromProfile, getSavedAnime, reportAnime } from '../lib/firebase';
import WatchLayout from '../components/WatchLayout';
import { Play, ThumbsUp, ThumbsDown, Share, Bookmark, Flag, Loader2, X, AlertCircle, Heart, MessageSquare, Send, User, Trash2, Reply } from 'lucide-react';
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
  const [isSaved, setIsSaved] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const hasFetchedComments = useRef(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [commentReplies, setCommentReplies] = useState({});
  const [showReplies, setShowReplies] = useState({});

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
      const commentId = await addAnimeComment(id, {
        text: commentText,
        author: user.displayName,
        authorEmail: user.email,
        authorPhotoURL: user.photoURL
      });
      
      const newComment = {
        id: commentId,
        text: commentText,
        author: user.displayName,
        authorEmail: user.email,
        authorPhotoURL: user.photoURL,
        createdAt: new Date()
      };
      
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment: ' + error.message);
    } finally {
      setSubmittingComment(false);
    }
  }, [id, isAuthenticated, user, commentText]);

  const handleDeleteComment = useCallback(async (commentId) => {
    if (!isAuthenticated) return;
    
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await deleteAnimeComment(id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  }, [id, isAuthenticated]);

  const handleReply = useCallback(async (commentId) => {
    if (!replyText.trim() || !isAuthenticated) return;

    setSubmittingReply(true);
    try {
      const replyId = await addAnimeCommentReply(id, commentId, {
        text: replyText,
        author: user.displayName,
        authorEmail: user.email,
        authorPhotoURL: user.photoURL
      });
      
      const newReply = {
        id: replyId,
        text: replyText,
        author: user.displayName,
        authorEmail: user.email,
        authorPhotoURL: user.photoURL,
        createdAt: new Date()
      };
      
      setCommentReplies(prev => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), newReply]
      }));
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  }, [id, isAuthenticated, user, replyText]);

  const toggleReplies = useCallback(async (commentId) => {
    if (showReplies[commentId]) {
      setShowReplies(prev => ({ ...prev, [commentId]: false }));
    } else {
      setShowReplies(prev => ({ ...prev, [commentId]: true }));
      if (!commentReplies[commentId]) {
        try {
          const replies = await getAnimeCommentReplies(id, commentId);
          setCommentReplies(prev => ({ ...prev, [commentId]: replies }));
        } catch (error) {
          console.error('Error fetching replies:', error);
        }
      }
    }
  }, [id, showReplies, commentReplies]);

  useEffect(() => {
    const fetchComments = async () => {
      if (hasFetchedComments.current) return;
      try {
        const commentsData = await getAnimeComments(id);
        setComments(commentsData);
        hasFetchedComments.current = true;
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, [id]);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (isAuthenticated && user?.uid) {
        try {
          const savedAnime = await getSavedAnime(user.uid);
          setIsSaved(savedAnime.some(anime => anime.id === id));
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
      }
    };
    checkIfSaved();
  }, [id, isAuthenticated, user]);

  const handleSave = useCallback(async () => {
    if (!isAuthenticated) {
      alert('Please login to save anime');
      return;
    }

    try {
      if (isSaved) {
        await removeAnimeFromProfile(user.uid, id);
        setIsSaved(false);
      } else {
        await saveAnimeToProfile(user.uid, {
          id,
          title: anime.title,
          coverImage: anime.coverImage
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving/removing anime:', error);
      alert('Failed to save anime. Please try again.');
    }
  }, [isSaved, isAuthenticated, user, id, anime]);

  const handleReport = useCallback(async () => {
    if (!isAuthenticated) {
      alert('Please login to report anime');
      return;
    }

    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting');
      return;
    }

    setSubmittingReport(true);
    try {
      await reportAnime({
        animeId: id,
        animeTitle: anime.title.english || anime.title.romaji,
        reason: reportReason,
        reportedBy: user?.email,
        reportedAt: new Date().toISOString()
      });
      alert('Report submitted successfully. Thank you for your feedback.');
      setReportReason('');
      setShowReportModal(false);
    } catch (error) {
      console.error('Error reporting anime:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setSubmittingReport(false);
    }
  }, [id, anime, reportReason, user, isAuthenticated]);

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
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Share size={18} />
                <span>Share</span>
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 ${isSaved ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-800 hover:bg-gray-700'} text-white rounded-lg transition-colors`}
              >
                <Bookmark size={18} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
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
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white">{comment.author}</span>
                            <span className="text-sm text-gray-400">
                              {new Date(comment.createdAt?.toDate?.() || comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {isAuthenticated && user?.email === comment.authorEmail && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <p className="text-gray-300 mb-2">{comment.text}</p>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => toggleReplies(comment.id)}
                            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            {showReplies[comment.id] ? 'Hide replies' : 'Show replies'}
                          </button>
                          {isAuthenticated && (
                            <button
                              onClick={() => {
                                setReplyingTo(comment.id);
                                setReplyText('');
                              }}
                              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1"
                            >
                              <Reply size={14} />
                              <span>Reply</span>
                            </button>
                          )}
                        </div>
                        
                        {replyingTo === comment.id && (
                          <div className="mt-3">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              className="w-full p-3 border-2 border-gray-700 rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                              rows="2"
                            />
                            <div className="mt-2 flex justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText('');
                                }}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReply(comment.id)}
                                disabled={submittingReply || !replyText.trim()}
                                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors text-sm"
                              >
                                {submittingReply ? 'Sending...' : 'Reply'}
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {showReplies[comment.id] && commentReplies[comment.id] && (
                          <div className="mt-3 space-y-2 ml-4 border-l-2 border-gray-700 pl-4">
                            {commentReplies[comment.id].map(reply => (
                              <div key={reply.id} className="flex space-x-3">
                                {reply.authorPhotoURL ? (
                                  <img
                                    src={reply.authorPhotoURL}
                                    alt={reply.author}
                                    className="w-8 h-8 rounded-full"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                    {reply.author?.charAt(0) || 'U'}
                                  </div>
                                )}
                                <div className="flex-grow">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-bold text-white text-sm">{reply.author}</span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(reply.createdAt?.toDate?.() || reply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 text-sm">{reply.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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
            <div className="bg-gray-800 rounded-lg p-6 mb-4 border-2 border-yellow-500">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-yellow-500 flex-shrink-0 mt-1" size={32} />
                <div>
                  <h4 className="text-white font-bold text-lg mb-2">Important Notice</h4>
                  <p className="text-gray-300 text-base leading-relaxed">Jika video eps anime yang kalian tonton tidak bisa berjalan maka limit Bandwidth sudah penuh, saya memakai free cloud storage jadi akan ada limit Bandwidth harian. Jika kalian ingin website ini bisa streaming semua anime tanpa limit Bandwidth harian, kalian bisa donasi di bawah ini....</p>
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

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Report Anime</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for reporting
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Please describe the issue..."
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white resize-none"
                  rows="4"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={submittingReport || !reportReason.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
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
