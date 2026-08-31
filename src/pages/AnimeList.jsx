import { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { getAllAnime } from '../lib/firebase';
import Layout from '../components/Layout';
import { Film, Star, Calendar, Clock, Search, Loader2, Play } from 'lucide-react';

const AnimeList = memo(() => {
  const [animeList, setAnimeList] = useState([]);
  const [filteredAnime, setFilteredAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const fetchAnime = useCallback(async () => {
    try {
      setLoading(true);
      const anime = await getAllAnime();
      setAnimeList(anime);
      setFilteredAnime(anime);
    } catch (error) {
      console.error('Error fetching anime:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  useEffect(() => {
    let filtered = animeList;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(anime => {
        const title = anime.animeData?.title?.english || anime.animeData?.title?.romaji || '';
        const nativeTitle = anime.animeData?.title?.native || '';
        const genres = anime.animeData?.genres?.join(' ') || '';
        return (
          title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nativeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          genres.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filter by genre
    if (selectedGenre !== 'All') {
      filtered = filtered.filter(anime =>
        anime.animeData?.genres?.includes(selectedGenre)
      );
    }

    setFilteredAnime(filtered);
  }, [searchTerm, selectedGenre, animeList]);

  // Get all unique genres
  const allGenres = ['All', ...new Set(animeList.flatMap(anime => anime.animeData?.genres || []))];

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

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative min-h-[300px] bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-900 dark:to-blue-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in-up">
              Anime Library
            </h1>
            <p className="text-lg sm:text-xl text-purple-100 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Browse and watch your favorite anime
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search anime by title, genre..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-md text-white placeholder-white/70 focus:ring-2 focus:ring-white focus:border-transparent text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {allGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                  selectedGenre === genre
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Anime Grid */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Film className="mr-2 text-purple-600" size={28} />
              {filteredAnime.length} Anime{filteredAnime.length !== 1 ? 's' : ''} Found
            </h2>
          </div>

          {filteredAnime.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {filteredAnime.map((anime, index) => (
                <Link
                  key={anime.id}
                  to={`/anime/${anime.anilistId || anime.id}`}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400">
                    {/* Cover Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {anime.animeData?.coverImage?.large ? (
                        <img
                          src={anime.animeData.coverImage.large}
                          alt={anime.animeData.title?.english || anime.animeData.title?.romaji}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <Film size={48} className="text-white/50" />
                        </div>
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-center justify-center">
                            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                              <Play size={24} className="text-white" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rating Badge */}
                      {anime.animeData?.averageScore && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-lg font-bold text-sm flex items-center">
                          <Star size={14} className="fill-current mr-1" />
                          {(anime.animeData.averageScore / 10).toFixed(1)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {anime.animeData?.title?.english || anime.animeData?.title?.romaji}
                      </h3>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {anime.animeData?.genres?.slice(0, 2).map((genre) => (
                          <span
                            key={genre}
                            className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        {anime.animeData?.season && anime.animeData?.seasonYear && (
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{anime.animeData.season} {anime.animeData.seasonYear}</span>
                          </div>
                        )}
                        {anime.animeData?.episodes && (
                          <div className="flex items-center gap-1">
                            <Film size={12} />
                            <span>{anime.animeData.episodes} eps</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
              <Film size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No anime found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || selectedGenre !== 'All'
                  ? 'Try adjusting your search or filters'
                  : 'No anime have been added yet. Check back later!'}
              </p>
              {(searchTerm || selectedGenre !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedGenre('All');
                  }}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
});

AnimeList.displayName = 'AnimeList';

export default AnimeList;
