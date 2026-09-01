import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getReviewById, getComments, addComment, deleteComment, addCommentReply, getCommentReplies } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/translations';
import { Star, Calendar, Clock, User, MessageSquare, Send, ExternalLink, Trash2, Reply } from 'lucide-react';

const ReviewDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const [review, setReview] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [commentReplies, setCommentReplies] = useState({});
  const [showReplies, setShowReplies] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reviewData = await getReviewById(id);
        setReview(reviewData);
        
        if (reviewData) {
          const commentsData = await getComments(id);
          setComments(commentsData);
        }
      } catch (error) {
        console.error('Error fetching review:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;

    setSubmittingComment(true);
    try {
      const commentId = await addComment(id, {
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
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated) return;
    
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await deleteComment(id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim() || !isAuthenticated) return;

    setSubmittingReply(true);
    try {
      const replyId = await addCommentReply(id, commentId, {
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
  };

  const toggleReplies = async (commentId) => {
    if (showReplies[commentId]) {
      setShowReplies(prev => ({ ...prev, [commentId]: false }));
    } else {
      setShowReplies(prev => ({ ...prev, [commentId]: true }));
      if (!commentReplies[commentId]) {
        try {
          const replies = await getCommentReplies(id, commentId);
          setCommentReplies(prev => ({ ...prev, [commentId]: replies }));
        } catch (error) {
          console.error('Error fetching replies:', error);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-4">{t('reviewDetail.reviewNotFound')}</h1>
          <p className="text-gray-700 dark:text-gray-300">{t('reviewDetail.reviewNotFoundDesc')}</p>
        </div>
      </div>
    );
  }

  const animeData = review.animeData || {};
  const animeTitle = animeData.title?.english || animeData.title?.romaji || 'Unknown';
  const coverImage = animeData.coverImage?.large || animeData.coverImage?.medium;
  const bannerImage = animeData.bannerImage;
  const rating = review.rating || 0;

  // Get language-specific review text
  const getReviewText = () => {
    if (language === 'id' && review.reviewTextId) return review.reviewTextId;
    if (language === 'en' && review.reviewTextEn) return review.reviewTextEn;
    if (language === 'jp' && review.reviewTextJp) return review.reviewTextJp;
    // Fallback to Indonesian or original reviewText
    return review.reviewTextId || review.reviewText || t('reviewDetail.noReviewText');
  };

  return (
    <Layout>
      {/* Banner */}
      {bannerImage && (
        <div className="h-64 md:h-96 relative overflow-hidden">
          <img
            src={bannerImage}
            alt={animeTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black dark:from-white to-transparent"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {coverImage && (
            <div className="flex-shrink-0">
              <img
                src={coverImage}
                alt={animeTitle}
                className="w-64 h-96 object-cover rounded-xl shadow-2xl"
              />
            </div>
          )}
          
          <div className="flex-grow">
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
              {animeTitle}
            </h1>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center space-x-2 bg-black dark:bg-white px-4 py-2 rounded-full border-2 border-black dark:border-white">
                <Star size={20} className="text-white dark:text-black" fill="currentColor" />
                <span className="font-bold text-white dark:text-black text-lg">{rating}/10</span>
              </div>
              
              {animeData.genres && animeData.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {animeData.genres.slice(0, 4).map((genre, index) => (
                    <span key={index} className="bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full text-sm text-black dark:text-white border border-gray-300 dark:border-gray-700">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {animeData.episodes && (
                <div className="bg-white dark:bg-black p-4 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-1">
                    <Clock size={16} />
                    <span className="text-sm">{t('reviewDetail.episodes')}</span>
                  </div>
                  <p className="text-xl font-bold text-black dark:text-white">{animeData.episodes}</p>
                </div>
              )}
              
              {animeData.seasonYear && (
                <div className="bg-white dark:bg-black p-4 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar size={16} />
                    <span className="text-sm">{t('reviewDetail.year')}</span>
                  </div>
                  <p className="text-xl font-bold text-black dark:text-white">{animeData.seasonYear}</p>
                </div>
              )}

              {animeData.studios?.nodes?.length > 0 && (
                <div className="bg-white dark:bg-black p-4 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-1">
                    <User size={16} />
                    <span className="text-sm">{t('reviewDetail.studio')}</span>
                  </div>
                  <p className="text-xl font-bold text-black dark:text-white">{animeData.studios.nodes[0].name}</p>
                </div>
              )}

              {animeData.status && (
                <div className="bg-white dark:bg-black p-4 rounded-lg shadow-lg border-2 border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-1">
                    <ExternalLink size={16} />
                    <span className="text-sm">{t('reviewDetail.status')}</span>
                  </div>
                  <p className="text-xl font-bold text-black dark:text-white">{animeData.status}</p>
                </div>
              )}
            </div>

            {animeData.description && (
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-lg mb-6 border-2 border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-bold text-black dark:text-white mb-3">{t('reviewDetail.synopsis')}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {animeData.description.replace(/<[^>]*>/g, '')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Review Section */}
        <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl shadow-lg mb-12 border-2 border-gray-200 dark:border-gray-800">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-6 flex items-center">
            <Star className="mr-3 text-black dark:text-white" size={32} />
            {t('reviewDetail.myReview')}
          </h2>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
              {getReviewText()}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t-2 border-gray-300 dark:border-gray-700">
            <div className="flex items-center space-x-4 text-sm text-gray-700 dark:text-gray-300">
              <span>{t('reviewDetail.reviewedBy')}</span>
              <span>•</span>
              <span>{new Date(review.createdAt?.toDate?.() || review.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-800">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-6 flex items-center">
            <MessageSquare className="mr-3 text-black dark:text-white" size={32} />
            {t('reviewDetail.comments')} ({comments.length})
          </h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex space-x-4">
                {user?.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full border-2 border-black dark:border-white"
                  />
                )}
                <div className="flex-grow">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t('reviewDetail.writeComment')}
                    className="w-full p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent resize-none"
                    rows="3"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="flex items-center space-x-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      <Send size={18} />
                      <span>{submittingComment ? t('reviewDetail.sending') : t('reviewDetail.sendComment')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-white dark:bg-black rounded-lg text-center border-2 border-black dark:border-white">
              <p className="text-black dark:text-white">
                <span dangerouslySetInnerHTML={{ __html: t('reviewDetail.pleaseLogin') }} />
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="flex space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {comment.authorPhotoURL ? (
                    <img
                      src={comment.authorPhotoURL}
                      alt={comment.author}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                      {comment.author?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 dark:text-white">{comment.author}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
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
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.text}</p>
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
                          className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent resize-none"
                          rows="2"
                        />
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg transition-colors text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReply(comment.id)}
                            disabled={submittingReply || !replyText.trim()}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-400 disabled:text-gray-500 rounded-lg transition-colors text-sm"
                          >
                            {submittingReply ? 'Sending...' : 'Reply'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {showReplies[comment.id] && commentReplies[comment.id] && (
                      <div className="mt-3 space-y-2 ml-4 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
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
                                <span className="font-bold text-gray-900 dark:text-white text-sm">{reply.author}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(reply.createdAt?.toDate?.() || reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t('reviewDetail.noComments')}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReviewDetail;
