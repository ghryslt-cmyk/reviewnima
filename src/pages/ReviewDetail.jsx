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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Banner */}
      {bannerImage && (
        <div className="h-64 md:h-96 relative overflow-hidden">
          <img
            src={bannerImage}
            alt={animeTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {animeTitle}
            </h1>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900 px-4 py-2 rounded-full">
                <Star size={20} className="text-purple-600 dark:text-purple-400" fill="currentColor" />
                <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">{rating}/10</span>
              </div>
              
              {animeData.genres && animeData.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {animeData.genres.slice(0, 4).map((genre, index) => (
                    <span key={index} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {animeData.episodes && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                    <Clock size={16} />
                    <span className="text-sm">Episodes</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{animeData.episodes}</p>
                </div>
              )}
              
              {animeData.seasonYear && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                    <Calendar size={16} />
                    <span className="text-sm">Year</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{animeData.seasonYear}</p>
                </div>
              )}

              {animeData.studios?.nodes?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                    <User size={16} />
                    <span className="text-sm">Studio</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{animeData.studios.nodes[0].name}</p>
                </div>
              )}

              {animeData.status && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                    <ExternalLink size={16} />
                    <span className="text-sm">Status</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{animeData.status}</p>
                </div>
              )}
            </div>

            {animeData.description && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Synopsis</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {animeData.description.replace(/<[^>]*>/g, '')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Review Section */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Star className="mr-3 text-purple-600" size={32} />
            My Review
          </h2>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {review.reviewText || 'No review text available.'}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Reviewed by Morviss</span>
              <span>•</span>
              <span>{new Date(review.createdAt?.toDate?.() || review.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <MessageSquare className="mr-3 text-purple-600" size={32} />
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex space-x-4">
                {user?.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="flex-grow">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      <Send size={18} />
                      <span>{submittingComment ? 'Sending...' : 'Send Comment'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
              <p className="text-purple-600 dark:text-purple-400">
                Please <a href="/login" className="underline font-bold">login</a> to leave a comment
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
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-bold text-gray-900 dark:text-white">{comment.author}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt?.toDate?.() || comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
