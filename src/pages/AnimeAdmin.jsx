import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchAnime, getAnimeById } from '../lib/anilist';
import { addAnime, getAllAnime, deleteAnime, addAnimeEpisode, getAnimeEpisodes, updateAnimeEpisode, deleteAnimeEpisode } from '../lib/firebase';
import { Shield, Search, Plus, X, Loader2, Save, Film, Edit, Trash2, Play, ChevronLeft, ChevronRight } from 'lucide-react';

const AnimeAdmin = memo(() => {
  const { user, checkAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('add-anime'); // 'add-anime' or 'manage-anime'
  
  // Add anime form state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Episode management state
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [episodes, setEpisodes] = useState([]);
  const [editingEpisode, setEditingEpisode] = useState(null);
  
  // Manage anime state
  const [allAnime, setAllAnime] = useState([]);
  const [selectedManageAnime, setSelectedManageAnime] = useState(null);
  const [manageEpisodes, setManageEpisodes] = useState([]);

  const checkAdminAccess = useCallback(async () => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectPath', location.pathname);
      navigate('/login');
      return;
    }
    
    const adminStatus = checkAdmin();
    setIsAdminUser(adminStatus);
    
    if (!adminStatus) {
      navigate('/');
      return;
    }
    
    try {
      const animeList = await getAllAnime();
      setAllAnime(animeList);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, checkAdmin, navigate, location.pathname]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const results = await searchAnime(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching anime:', error);
      setError('Failed to search anime. Please try again.');
    }
  }, [searchTerm]);

  const handleSelectAnime = useCallback(async (anime) => {
    try {
      const fullAnimeData = await getAnimeById(anime.id);
      setSelectedAnime(fullAnimeData);
      setSearchResults([]);
      setSearchTerm('');
      
      // Load existing episodes for this anime
      const existingEpisodes = await getAnimeEpisodes(anime.id.toString());
      setEpisodes(existingEpisodes);
      setEpisodeNumber(existingEpisodes.length + 1);
    } catch (error) {
      console.error('Error fetching anime details:', error);
      setError('Failed to load anime details. Please try again.');
    }
  }, []);

  const handleAddAnime = useCallback(async () => {
    if (!selectedAnime) {
      setError('Please select an anime first.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await addAnime({
        anilistId: selectedAnime.id,
        animeData: selectedAnime
      });
      
      setSuccess('Anime added successfully!');
      setSelectedAnime(null);
      setEpisodes([]);
      setEpisodeNumber(1);
      setEpisodeTitle('');
      setVideoUrl('');
      
      // Refresh anime list
      const animeList = await getAllAnime();
      setAllAnime(animeList);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding anime:', error);
      setError('Failed to add anime. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedAnime]);

  const handleAddEpisode = useCallback(async (e) => {
    e.preventDefault();
    
    if (!selectedAnime || !videoUrl.trim()) {
      setError('Please provide a video URL for the episode.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const episodeData = {
        episodeNumber,
        title: episodeTitle,
        videoUrl
      };

      if (editingEpisode) {
        await updateAnimeEpisode(selectedAnime.id.toString(), editingEpisode.id, episodeData);
        setSuccess('Episode updated successfully!');
        setEditingEpisode(null);
      } else {
        await addAnimeEpisode(selectedAnime.id.toString(), episodeData);
        setSuccess('Episode added successfully!');
      }
      
      setEpisodeNumber(prev => prev + 1);
      setEpisodeTitle('');
      setVideoUrl('');
      
      // Refresh episodes
      const updatedEpisodes = await getAnimeEpisodes(selectedAnime.id.toString());
      setEpisodes(updatedEpisodes);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding/updating episode:', error);
      setError('Failed to add/update episode. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedAnime, episodeNumber, episodeTitle, videoUrl, editingEpisode]);

  const handleEditEpisode = useCallback((episode) => {
    setEpisodeNumber(episode.episodeNumber);
    setEpisodeTitle(episode.title || '');
    setVideoUrl(episode.videoUrl);
    setEditingEpisode(episode);
  }, []);

  const handleDeleteEpisode = useCallback(async (episodeId) => {
    if (!window.confirm('Are you sure you want to delete this episode?')) return;
    
    try {
      await deleteAnimeEpisode(selectedAnime.id.toString(), episodeId);
      setSuccess('Episode deleted successfully!');
      
      const updatedEpisodes = await getAnimeEpisodes(selectedAnime.id.toString());
      setEpisodes(updatedEpisodes);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting episode:', error);
      setError('Failed to delete episode. Please try again.');
    }
  }, [selectedAnime]);

  const handleDeleteAnime = useCallback(async (animeId) => {
    if (!window.confirm('Are you sure you want to delete this anime and all its episodes?')) return;
    
    try {
      await deleteAnime(animeId);
      setSuccess('Anime deleted successfully!');
      
      const animeList = await getAllAnime();
      setAllAnime(animeList);
      
      if (selectedManageAnime?.id === animeId) {
        setSelectedManageAnime(null);
        setManageEpisodes([]);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting anime:', error);
      setError('Failed to delete anime. Please try again.');
    }
  }, [selectedManageAnime]);

  const handleSelectManageAnime = useCallback(async (anime) => {
    setSelectedManageAnime(anime);
    try {
      const animeEpisodes = await getAnimeEpisodes(anime.anilistId?.toString() || anime.id);
      setManageEpisodes(animeEpisodes);
    } catch (error) {
      console.error('Error loading episodes:', error);
      setManageEpisodes([]);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (!isAdminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 sm:py-16 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-2 flex items-center">
            <Shield className="mr-2 sm:mr-3 text-black dark:text-white" size={32} sm:size={40} />
            Anime Admin Panel
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            Add and manage anime with episodes
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 sm:mb-8 border-b-2 border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('add-anime')}
            className={`px-4 sm:px-6 py-3 font-medium transition-colors ${
              activeTab === 'add-anime'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Add Anime
          </button>
          <button
            onClick={() => setActiveTab('manage-anime')}
            className={`px-4 sm:px-6 py-3 font-medium transition-colors ${
              activeTab === 'manage-anime'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Manage Anime
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg">
            {success}
          </div>
        )}

        {/* Add Anime Tab */}
        {activeTab === 'add-anime' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Search Anime */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-800">
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 flex items-center">
                <Search className="mr-2 text-black dark:text-white" size={20} sm:size={24} />
                Search Anime from AniList
              </h2>

              <form onSubmit={handleSearch} className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex-grow relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} sm:size={20} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search anime from AniList..."
                      className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                  >
                    Search
                  </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
                    {searchResults.map((anime) => (
                      <div
                        key={anime.id}
                        onClick={() => handleSelectAnime(anime)}
                        className="flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b-2 border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors"
                      >
                        {anime.coverImage?.medium && (
                          <img
                            src={anime.coverImage.medium}
                            alt={anime.title.english || anime.title.romaji}
                            className="w-16 h-24 object-cover rounded mr-4 border border-gray-300 dark:border-gray-600"
                          />
                        )}
                        <div className="flex-grow">
                          <h3 className="font-bold text-black dark:text-white">
                            {anime.title.english || anime.title.romaji}
                          </h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {anime.title.native}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {anime.season} {anime.seasonYear}
                            </span>
                            {anime.episodes && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                • {anime.episodes} eps
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Selected Anime & Episode Management */}
            {selectedAnime && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-800">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white flex items-center">
                    <Film className="mr-2 text-black dark:text-white" size={20} sm:size={24} />
                    Manage Episodes
                  </h2>
                  <button
                    onClick={() => setSelectedAnime(null)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm flex items-center"
                  >
                    <X size={16} className="mr-1" />
                    Clear selection
                  </button>
                </div>

                {/* Anime Info */}
                <div className="flex items-start space-x-4 mb-6 p-4 bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-800">
                  {selectedAnime.coverImage?.large && (
                    <img
                      src={selectedAnime.coverImage.large}
                      alt={selectedAnime.title.english || selectedAnime.title.romaji}
                      className="w-32 h-48 object-cover rounded border border-gray-300 dark:border-gray-600"
                    />
                  )}
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                      {selectedAnime.title.english || selectedAnime.title.romaji}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {selectedAnime.title.native}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnime.genres?.slice(0, 5).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-xs"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add Episode Form */}
                <form onSubmit={handleAddEpisode} className="mb-6">
                  <h3 className="text-lg font-bold text-black dark:text-white mb-4">
                    {editingEpisode ? 'Edit Episode' : 'Add New Episode'}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-black dark:text-white font-medium mb-2">
                        Episode Number
                      </label>
                      <input
                        type="number"
                        value={episodeNumber}
                        onChange={(e) => setEpisodeNumber(parseInt(e.target.value))}
                        min="1"
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-black dark:text-white font-medium mb-2">
                        Episode Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={episodeTitle}
                        onChange={(e) => setEpisodeTitle(e.target.value)}
                        placeholder="Episode title"
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-black dark:text-white font-medium mb-2">
                      Archive.org Video URL *
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://archive.org/embed/..."
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Use the embed URL from archive.org (e.g., https://archive.org/embed/identifier)
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center space-x-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:bg-gray-400 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>{editingEpisode ? 'Updating...' : 'Adding...'}</span>
                        </>
                      ) : (
                        <>
                          <Plus size={20} />
                          <span>{editingEpisode ? 'Update Episode' : 'Add Episode'}</span>
                        </>
                      )}
                    </button>
                    
                    {editingEpisode && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEpisode(null);
                          setEpisodeTitle('');
                          setVideoUrl('');
                        }}
                        className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                      >
                        <X size={20} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </form>

                {/* Episodes List */}
                {episodes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white mb-4">
                      Episodes ({episodes.length})
                    </h3>
                    <div className="space-y-3">
                      {episodes.map((episode) => (
                        <div
                          key={episode.id}
                          className="flex items-center justify-between p-4 bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-800"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <Play size={20} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-black dark:text-white">
                                Episode {episode.episodeNumber}
                              </h4>
                              {episode.title && (
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {episode.title}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditEpisode(episode)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteEpisode(episode.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Anime Button */}
                <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-800">
                  <button
                    onClick={handleAddAnime}
                    disabled={submitting || episodes.length === 0}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                  >
                    <Save size={20} />
                    <span>Save Anime with {episodes.length} Episode{episodes.length !== 1 ? 's' : ''}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manage Anime Tab */}
        {activeTab === 'manage-anime' && (
          <div className="space-y-6">
            {/* Anime List */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-800">
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 flex items-center">
                <Film className="mr-2 text-black dark:text-white" size={20} sm:size={24} />
                All Anime ({allAnime.length})
              </h2>
              
              {allAnime.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allAnime.map((anime) => (
                    <div
                      key={anime.id}
                      onClick={() => handleSelectManageAnime(anime)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedManageAnime?.id === anime.id
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-600 dark:border-purple-400'
                          : 'bg-white dark:bg-black border-gray-200 dark:border-gray-800 hover:border-purple-400'
                      }`}
                    >
                      {anime.animeData?.coverImage?.medium && (
                        <img
                          src={anime.animeData.coverImage.medium}
                          alt={anime.animeData.title?.english || anime.animeData.title?.romaji}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-bold text-black dark:text-white line-clamp-1">
                        {anime.animeData?.title?.english || anime.animeData?.title?.romaji}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {anime.anilistId || anime.id}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnime(anime.id);
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No anime added yet. Go to "Add Anime" tab to add your first anime.
                </div>
              )}
            </div>

            {/* Selected Anime Episodes */}
            {selectedManageAnime && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white flex items-center">
                    <Film className="mr-2 text-black dark:text-white" size={20} sm:size={24} />
                    Episodes for {selectedManageAnime.animeData?.title?.english || selectedManageAnime.animeData?.title?.romaji}
                  </h2>
                  <Link
                    to={`/anime/${selectedManageAnime.anilistId || selectedManageAnime.id}`}
                    target="_blank"
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm flex items-center"
                  >
                    <Play size={16} className="mr-1" />
                    Watch Page
                  </Link>
                </div>
                
                {manageEpisodes.length > 0 ? (
                  <div className="space-y-3">
                    {manageEpisodes.map((episode) => (
                      <div
                        key={episode.id}
                        className="flex items-center justify-between p-4 bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-800"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Play size={20} className="text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-black dark:text-white">
                              Episode {episode.episodeNumber}
                            </h4>
                            {episode.title && (
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {episode.title}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEpisode(episode.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    No episodes added for this anime yet.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

AnimeAdmin.displayName = 'AnimeAdmin';

export default AnimeAdmin;
