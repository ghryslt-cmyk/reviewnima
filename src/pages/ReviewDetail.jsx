import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getReviewById, getComments, addComment } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Star, Calendar, Clock, User, MessageSquare, Send, ExternalLink } from 'lucide-react';

const ReviewDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [review, setReview] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Review Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300">The review you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const animeData = review.animeData || {};
  const animeTitle = animeData.title?.english || animeData.title?.romaji || 'Unknown';
  const coverImage = animeData.coverImage?.large || animeData.coverImage?.medium;
  const bannerImage = animeData.bannerImage;
  const rating = review.rating || 0;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-all duration-300">
      {/* Banner */}
      {bannerImage && (
        <div className="h-48 sm:h-64 md:h-96 relative overflow-hidden">
          <img
            src={bannerImage}
            alt={animeTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black dark:from-white to-transparent"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 mb-8 sm:mb-12">
          {coverImage && (
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src={coverImage}
                alt={animeTitle}
                className="w-48 h-72 sm:w-56 sm:h-80 md:w-64 md:h-96 object-cover rounded-xl shadow-2xl"
              />
            </div>
          )}
          
          <div className="flex-grow">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {animeTitle}
            </h1>
            
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full">
                <Star size={16} sm:size={20} className="text-gray-900 dark:text-white" fill="currentColor" />
                <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-lg">{rating}/10</span>
              </div>
              
              {animeData.genres && animeData.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {animeData.genres.slice(0, 4).map((genre, index) => (
                    <span key={index} className="bg-gray-100 dark:bg-gray-900 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {animeData.episodes && (
                <div className="bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 rounded-lg shadow border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                    <Clock size={12} sm:size={16} />
                    <span className="text-xs sm:text-sm">Episodes</span>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">{animeData.episodes}</p>
                </div>
              )}
              
              {animeData.seasonYear && (
                <div className="bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 rounded-lg shadow border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                    <Calendar size={12} sm:size={16} />
                    <span className="text-xs sm:text-sm">Year</span>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">{animeData.seasonYear}</p>
                </div>
              )}

              {animeData.studios?.nodes?.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 rounded-lg shadow border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                    <User size={12} sm:size={16} />
                    <span className="text-xs sm:text-sm">Studio</span>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">{animeData.studios.nodes[0].name}</p>
                </div>
              )}

              {animeData.status && (
                <div className="bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 rounded-lg shadow border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                    <ExternalLink size={12} sm:size={16} />
                    <span className="text-xs sm:text-sm">Status</span>
                  </div>
                  <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">{animeData.status}</p>
                </div>
              )}
            </div>

            {animeData.description && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-lg mb-4 sm:mb-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">Synopsis</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  {animeData.description.replace(/<[^>]*>/g, '')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Review Section */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg mb-8 sm:mb-12 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <Star className="mr-2 sm:mr-3 text-gray-600 dark:text-gray-400" size={24} sm:size={32} />
            My Review
          </h2>
          
          <div className="prose prose-sm sm:prose-lg dark:prose-invert max-w-none">
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-sm sm:text-base">
              {review.reviewText || 'No review text available.'}
            </div>
          </div>

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span>Reviewed by Morviss</span>
              <span>•</span>
              <span>{new Date(review.createdAt?.toDate?.() || review.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <MessageSquare className="mr-2 sm:mr-3 text-gray-600 dark:text-gray-400" size={24} sm:size={32} />
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-6 sm:mb-8">
              <div className="flex space-x-2 sm:space-x-4">
                {user?.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                  />
                )}
                <div className="flex-grow">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none text-sm sm:text-base"
                    rows="3"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="flex items-center space-x-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                    >
                      <Send size={14} sm:size={18} />
                      <span>{submittingComment ? 'Sending...' : 'Send Comment'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                Please <a href="/login" className="underline font-bold">login</a> to leave a comment
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4 sm:space-y-6">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="flex space-x-2 sm:space-x-4 p-3 sm:p-4 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800">
                  {comment.authorPhotoURL ? (
                    <img
                      src={comment.authorPhotoURL}
                      alt={comment.author}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-600 dark:bg-gray-400 flex items-center justify-center text-white dark:text-black font-bold text-sm">
                      {comment.author?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                      <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{comment.author}</span>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt?.toDate?.() || comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;
