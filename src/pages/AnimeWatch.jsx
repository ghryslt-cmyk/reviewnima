import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimeById } from '../lib/anilist';
import { getAnimeEpisodes, addAnimeEpisode, updateAnimeEpisode, deleteAnimeEpisode } from '../lib/firebase';
import Layout from '../components/Layout';
import { Play, Star, Calendar, Clock, Film, ChevronLeft, ChevronRight, Loader2, Share, Heart, Plus, X } from 'lucide-react';

const TelegramWidget = ({ postUrl }) => {
  const containerRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    if (!postUrl || !containerRef.current) return;

    // Remove existing script
    if (scriptRef.current) {
      scriptRef.current.remove();
    }

    // Clear container
    containerRef.current.innerHTML = '';

    // Strip https://t.me/ prefix if present
    const cleanPostUrl = postUrl.replace(/^https?:\/\/t\.me\//, '');

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-post', cleanPostUrl);
    script.setAttribute('data-width', '100%');
    script.setAttribute('data-height', '100%');
    script.setAttribute('data-color', '000000');
    script.setAttribute('data-dark', '1');
    script.async = true;

    containerRef.current.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current) {
        scriptRef.current.remove();
      }
    };
  }, [postUrl]);

  return <div ref={containerRef} className="w-full h-full" />;
};

const AnimeWatch = memo(() => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

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
      setError('Failed to load anime data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Loader2 className="animate-spin text-gray-600 mx-auto mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">Loading anime...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !anime) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error || 'Anime not found'}</p>
            <Link to="/" className="text-gray-600 hover:text-gray-900 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative min-h-[500px] overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900">
        {anime.bannerImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={anime.bannerImage}
              alt={anime.title.english || anime.title.romaji}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
          </div>
        )}
        
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              {anime.coverImage?.extraLarge && (
                <div className="flex-shrink-0 animate-fade-in-up">
                  <img
                    src={anime.coverImage.extraLarge}
                    alt={anime.title.english || anime.title.romaji}
                    className="w-40 h-60 sm:w-48 sm:h-72 object-cover rounded-xl shadow-2xl border-4 border-white/20 backdrop-blur-sm hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="flex-grow text-white animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
                  {anime.title.english || anime.title.romaji}
                </h1>
                {anime.title.native && (
                  <p className="text-lg sm:text-xl text-gray-300 mb-4">{anime.title.native}</p>
                )}
                <div className="flex flex-wrap gap-3 mb-4">
                  {anime.genres?.slice(0, 5).map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-gray-700 rounded-full text-sm border border-gray-600"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-sm sm:text-base text-gray-300">
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500" size={18} fill="currentColor" />
                    <span>{anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'}/10</span>
                  </div>
                  {anime.season && anime.seasonYear && (
                    <div className="flex items-center gap-2">
                      <Calendar size={18} />
                      <span>{anime.season} {anime.seasonYear}</span>
                    </div>
                  )}
                  {anime.episodes && (
                    <div className="flex items-center gap-2">
                      <Film size={18} />
                      <span>{anime.episodes} Episodes</span>
                    </div>
                  )}
                  {anime.duration && (
                    <div className="flex items-center gap-2">
                      <Clock size={18} />
                      <span>{anime.duration} min</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Video Area */}
            <div className="lg:col-span-3">
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                {currentEpisode ? (
                  <>
                    <div className="aspect-video w-full bg-black flex items-center justify-center">
                      <TelegramWidget postUrl={currentEpisode.videoUrl} />
                    </div>
                    
                    {/* Video Controls */}
                    <div className="bg-gray-800 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                            Episode {currentEpisode.episodeNumber}
                            {currentEpisode.title && `: ${currentEpisode.title}`}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {anime.title.english || anime.title.romaji}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handlePreviousEpisode}
                            disabled={episodes.findIndex(ep => ep.id === currentEpisode?.id) === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                          >
                            <ChevronLeft size={20} />
                            <span className="hidden sm:inline">Previous</span>
                          </button>
                          <button
                            onClick={handleNextEpisode}
                            disabled={episodes.findIndex(ep => ep.id === currentEpisode?.id) === episodes.length - 1}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight size={20} />
                          </button>
                          <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                          >
                            <Share size={20} />
                            <span className="hidden sm:inline">Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
              </>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="text-gray-500">
                      <Play size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg text-white">No episodes available</p>
                    </div>
                  </div>
                </div>
              )}
              </div>

              {/* Episode Review */}
              {currentEpisode?.review && (
                <div className="mt-6 bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-3">Episode Review</h3>
                  <p className="text-gray-300 leading-relaxed">{currentEpisode.review}</p>
                </div>
              )}
            </div>

            {/* Episode Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl p-4 sticky top-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Film size={20} className="mr-2" />
                  Episodes ({episodes.length})
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {episodes.map((episode) => (
                    <button
                      key={episode.id}
                      onClick={() => handleEpisodeChange(episode)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 hover:scale-102 ${
                        currentEpisode?.id === episode.id
                          ? 'bg-gray-700 text-white border-l-4 border-white'
                          : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Play size={16} className={currentEpisode?.id === episode.id ? 'text-white' : 'text-gray-400'} />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="font-semibold text-sm truncate">EP {episode.episodeNumber}</div>
                          {episode.title && (
                            <div className="text-xs text-gray-400 truncate">{episode.title}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      {anime.description && (
        <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Synopsis</h3>
            <div
              className="prose prose-invert max-w-none text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: anime.description }}
            />
          </div>
        </div>
      )}

      {/* Studios Section */}
      {anime.studios?.nodes?.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Studios</h3>
            <div className="flex flex-wrap gap-3">
              {anime.studios.nodes.map((studio) => (
                <span
                  key={studio.name}
                  className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 text-white font-medium"
                >
                  {studio.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Share Anime</h3>
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
                  Share Link
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
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
});

AnimeWatch.displayName = 'AnimeWatch';

export default AnimeWatch;
