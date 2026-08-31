import { useState, useEffect, useCallback, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimeById } from '../lib/anilist';
import { getAnimeEpisodes, addAnimeEpisode, updateAnimeEpisode, deleteAnimeEpisode } from '../lib/firebase';
import Layout from '../components/Layout';
import { Play, Star, Calendar, Clock, Film, ChevronLeft, ChevronRight, Loader2, Share, Heart, Plus, X } from 'lucide-react';

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
            <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
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
            <Link to="/" className="text-purple-600 dark:text-purple-400 hover:underline">
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
      <div className="relative min-h-[400px] overflow-hidden">
        {anime.bannerImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={anime.bannerImage}
              alt={anime.title.english || anime.title.romaji}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
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
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
                  {anime.title.english || anime.title.romaji}
                </h1>
                {anime.title.native && (
                  <p className="text-lg sm:text-xl text-gray-300 mb-4">{anime.title.native}</p>
                )}
                <div className="flex flex-wrap gap-3 mb-4">
                  {anime.genres?.slice(0, 5).map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm border border-white/30 hover:bg-white/30 transition-colors"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-sm sm:text-base">
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={18} />
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
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            {currentEpisode ? (
              <>
                <div className="aspect-video w-full">
                  <iframe
                    src={currentEpisode.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={`Episode ${currentEpisode.episodeNumber}`}
                    allow="autoplay; fullscreen"
                  />
                </div>
                
                {/* Video Controls */}
                <div className="bg-gray-900 p-4 sm:p-6">
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
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={20} />
                        <span className="hidden sm:inline">Previous</span>
                      </button>
                      <button
                        onClick={handleNextEpisode}
                        disabled={episodes.findIndex(ep => ep.id === currentEpisode?.id) === episodes.length - 1}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight size={20} />
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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
                <div className="text-center text-gray-400">
                  <Play size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No episodes available</p>
                </div>
              </div>
            )}
          </div>

          {/* Episode List */}
          {episodes.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Film size={28} className="text-purple-600" />
                Episodes
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {episodes.map((episode, index) => (
                  <button
                    key={episode.id}
                    onClick={() => handleEpisodeChange(episode)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      currentEpisode?.id === episode.id
                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-purple-400 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Play size={20} className={currentEpisode?.id === episode.id ? 'text-white' : 'text-purple-600'} />
                    </div>
                    <div className="font-semibold text-sm sm:text-base">EP {episode.episodeNumber}</div>
                    {episode.title && (
                      <div className="text-xs mt-1 line-clamp-2 opacity-80">
                        {episode.title}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description Section */}
      {anime.description && (
        <div className="px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Synopsis</h3>
            <div 
              className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: anime.description }}
            />
          </div>
        </div>
      )}

      {/* Studios Section */}
      {anime.studios?.nodes?.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Studios</h3>
            <div className="flex flex-wrap gap-3">
              {anime.studios.nodes.map((studio) => (
                <span
                  key={studio.name}
                  className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium"
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share Anime</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={window.location.href}
                    readOnly
                    className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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
