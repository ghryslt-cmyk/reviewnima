import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAnimeNews } from '../lib/animeNews';
import { ArrowLeft, Calendar, ExternalLink, Share2, Newspaper } from 'lucide-react';

const NewsDetail = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    loadNewsDetail();
  }, [id]);

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
      }
    } catch (error) {
      console.error('Error loading news detail:', error);
    } finally {
      setLoading(false);
    }
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
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
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
            <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Hero Image */}
              <div className="relative h-64 xs:h-80 sm:h-96 overflow-hidden">
                <img
                  src={newsItem.thumbnail}
                  alt={newsItem.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <span className="inline-block px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full mb-3">
                    {newsItem.category}
                  </span>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6 xs:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full flex items-center">
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

                <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
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
                  <p className="text-gray-700 dark:text-gray-300 text-base xs:text-lg leading-relaxed mb-4">
                    {newsItem.description}
                  </p>
                  <div 
                    className="text-gray-700 dark:text-gray-300 text-base xs:text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: newsItem.content }}
                  />
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={newsItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105"
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
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
                      <div className="flex gap-3">
                        <img
                          src={related.thumbnail}
                          alt={related.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                            {related.title}
                          </h4>
                          <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar size={12} className="mr-1" />
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
