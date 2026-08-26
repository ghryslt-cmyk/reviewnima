import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAnimeNews } from '../lib/animeNews';
import { useLanguage } from '../context/LanguageContext';
import { translateContent } from '../lib/translator';
import { ArrowLeft, Calendar, ExternalLink, Share2, Newspaper, MessageCircle, Send, User as UserIcon } from 'lucide-react';

const NewsDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [translatedContent, setTranslatedContent] = useState(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    loadNewsDetail();
  }, [id]);

  // Translate news content when language changes
  useEffect(() => {
    const translateNewsContent = async () => {
      if (newsItem && newsItem.description && language !== 'id') {
        setTranslating(true);
        try {
          const translated = await translateContent(newsItem.description, 'id', language);
          setTranslatedContent(translated);
        } catch (error) {
          console.error('Translation error:', error);
          setTranslatedContent(newsItem.description);
        } finally {
          setTranslating(false);
        }
      } else {
        setTranslatedContent(null); // Use original Indonesian text
      }
    };

    translateNewsContent();
  }, [newsItem, language]);

  const loadNewsDetail = async () => {
    try {
      setLoading(true);
      const allNews = await fetchAnimeNews();
      const item = allNews.find(news => news.id === id);
      
      if (item) {
        setNewsItem(item);
        
        // Get related news (same category, excluding current item)
        const related = allNews
          .filter(news => news.category === item.category && news.id !== id)
          .slice(0, 4);
        setRelatedNews(related);
        
        // Load comments from localStorage (demo purposes)
        loadComments(id);
      }
    } catch (error) {
      console.error('Error loading news detail:', error);
    } finally {
      setLoading(false);
    }
  };


  const loadComments = (newsId) => {
    const storedComments = localStorage.getItem(`news_comments_${newsId}`);
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      text: newComment,
      author: 'Anonymous User',
      timestamp: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
    };
    
    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    localStorage.setItem(`news_comments_${id}`, JSON.stringify(updatedComments));
    setNewComment('');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: newsItem.title,
          text: newsItem.description,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-gray-700 dark:border-gray-300"></div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Newspaper size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">News Not Found</h2>
          <Link to="/news" className="text-purple-600 dark:text-purple-400 hover:underline">
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8 py-4">
          <Link
            to="/news"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to News
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-6 lg:px-8 py-8 xs:py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article */}
          <div className="lg:col-span-2">
            <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Hero Image */}
              <div className="relative aspect-[16/9] xs:aspect-[2/1] sm:aspect-[21/9] overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-700 dark:to-gray-600">
                <img
                  src={newsItem.thumbnail}
                  alt={newsItem.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 xs:p-8">
                  <span className="inline-block px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-full mb-3 shadow-lg backdrop-blur-sm">
                    {newsItem.category}
                  </span>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6 xs:p-8 sm:p-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded-full flex items-center">
                      {newsItem.sourceIcon} {newsItem.source}
                    </span>
                  </div>
                  <button
                    onClick={handleShare}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-300"
                  >
                    <Share2 size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {newsItem.title}
                </h1>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <Calendar size={16} className="mr-2" />
                  {new Date(newsItem.pubDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {translating ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-gray-900 dark:border-white"></div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Translating...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 dark:text-gray-300 text-base xs:text-lg leading-relaxed mb-4">
                        {translatedContent || newsItem.description}
                      </p>
                      <div 
                        className="text-gray-700 dark:text-gray-300 text-base xs:text-lg leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: newsItem.content }}
                      />
                    </>
                  )}
                </div>


                {/* Comments Section */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <MessageCircle className="mr-2 text-gray-600 dark:text-gray-400" size={20} />
                    Comments ({comments.length})
                  </h3>
                  
                  {/* Add Comment Form */}
                  <div className="mb-6">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <UserIcon className="w-10 h-10 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full p-2" />
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent resize-none transition-all duration-300"
                          rows="3"
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="flex items-center px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-medium rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <Send size={16} className="mr-2" />
                            Post Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Comments List */}
                  {comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                          <img
                            src={comment.avatar}
                            alt={comment.author}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                {comment.author}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(comment.timestamp).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={newsItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    Read Full Article
                    <ExternalLink size={18} className="ml-2" />
                  </a>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar - Related News */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Newspaper className="mr-2 text-gray-600 dark:text-gray-400" size={20} />
                Related News
              </h3>
              
              {relatedNews.length > 0 ? (
                <div className="space-y-4">
                  {relatedNews.map((related) => (
                    <Link
                      key={related.id}
                      to={`/news/${related.id}`}
                      className="block group"
                    >
                      <div className="flex gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <img
                            src={related.thumbnail}
                            alt={related.title}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-gray-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 leading-tight">
                            {related.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="text-gray-900 dark:text-white font-medium">
                              {related.category}
                            </span>
                            <span>•</span>
                            <Calendar size={12} className="mr-1 inline" />
                            {new Date(related.pubDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No related news found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
