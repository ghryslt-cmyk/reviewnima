import axios from 'axios';

const ANILIST_API_URL = 'https://graphql.anilist.co';
const JIKAN_API_URL = 'https://api.jikan.moe/v4';

// Helper function to fetch JSON data from public directory
const fetchLocalData = async (path) => {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching local data:', error);
    return null;
  }
};

/**
 * Get current day of week in lowercase for MAL API
 * @returns {string} Day name (monday, tuesday, etc.)
 */
const getCurrentDayOfWeek = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

/**
 * Get current season based on current date
 * @returns {Object} Object with season and year
 */
const getCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  
  let season;
  if (month >= 3 && month <= 5) {
    season = 'SPRING';
  } else if (month >= 6 && month <= 8) {
    season = 'SUMMER';
  } else if (month >= 9 && month <= 11) {
    season = 'FALL';
  } else {
    season = 'WINTER';
    // If it's January or February, it's the previous year's winter
    if (month <= 2) {
      return { season, year: year - 1 };
    }
  }
  
  return { season, year };
};

/**
 * Fetch seasonal anime data from local JSON file
 * @returns {Promise<Object|null>} Seasonal anime data or null
 */
const fetchLocalSeasonalData = async () => {
  const { season, year } = getCurrentSeason();
  const fileName = `${season.toLowerCase()}_${year}.json`;
  const data = await fetchLocalData(`/data/seasonal/${fileName}`);
  return data;
};

/**
 * Fetch trending anime data from local JSON file
 * @returns {Promise<Object|null>} Trending anime data or null
 */
const fetchLocalTrendingData = async () => {
  const data = await fetchLocalData('/data/daily/trending_anime.json');
  return data;
};

/**
 * Fetch MAL schedule data from local JSON file
 * @returns {Promise<Object|null>} MAL schedule data or null
 */
const fetchLocalScheduleData = async () => {
  const data = await fetchLocalData('/data/daily/anime_schedule.json');
  return data;
};

/**
 * Fetch anime schedule from local JSON file or fallback to MAL API
 * @returns {Promise<Object>} Object with anime grouped by day
 */
const fetchMALSchedule = async () => {
  // Try to fetch from local data first
  const localData = await fetchLocalScheduleData();
  if (localData && localData.schedule) {
    console.log(`Using local schedule data`);
    return localData.schedule;
  }
  
  // Fallback to API if local data is not available
  console.log('Local schedule data not available, falling back to API');
  const day = getCurrentDayOfWeek();
  
  try {
    const response = await axios.get(`${JIKAN_API_URL}/schedules/${day}?limit=15`);
    return { [day]: response.data.data };
  } catch (error) {
    console.error('Error fetching MAL schedule:', error);
    return {};
  }
};

/**
 * Search AniList for anime by title to get assets
 * @param {string} title - Anime title to search
 * @returns {Promise<Object|null>} AniList anime data or null
 */
const searchAniListByTitle = async (title) => {
  const query = `
    query ($search: String) {
      Page(page: 1, perPage: 1) {
        media(search: $search, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            medium
            extraLarge
          }
          bannerImage
          description
          genres
          averageScore
          episodes
          status
          studios {
            nodes {
              name
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API_URL, {
      query,
      variables: { search: title }
    });
    return response.data.data.Page.media[0] || null;
  } catch (error) {
    console.error('Error searching AniList:', error);
    return null;
  }
};


// Fetch trending anime from local JSON file or fallback to API
const fetchTrendingAnime = async () => {
  // Try to fetch from local data first
  const localData = await fetchLocalTrendingData();
  if (localData && localData.anime && localData.anime.length > 0) {
    console.log(`Using local trending data: ${localData.anime.length} anime`);
    return localData.anime;
  }
  
  // Fallback to API if local data is not available
  console.log('Local trending data not available, falling back to API');
  const query = `
    query {
      Page(page: 1, perPage: 10) {
        media(type: ANIME, sort: TRENDING_DESC) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            medium
            extraLarge
          }
          bannerImage
          description
          genres
          averageScore
          episodes
          status
          season
          seasonYear
          studios {
            nodes {
              name
            }
          }
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API_URL, { query });
    return response.data.data.Page.media;
  } catch (error) {
    console.error('Error fetching trending anime:', error);
    return [];
  }
};


// Convert AniList anime data to news format
const convertAnimeToNews = (anime, category) => {
  const title = anime.title.english || anime.title.romaji;
  const studio = anime.studios?.nodes?.[0]?.name || 'Unknown Studio';
  const genres = anime.genres?.slice(0, 2) || ['Anime'];
  
  // Use current date for pubDate to show as today's news
  const pubDate = new Date().toISOString();
  
  return {
    id: `anime-${anime.id}`,
    title: `${title} - ${category}`,
    description: anime.description?.substring(0, 200) || `Popular ${genres.join(', ')} anime from ${studio}.`,
    content: anime.description || `No description available for ${title}.`,
    link: `https://anilist.co/anime/${anime.id}`,
    pubDate: pubDate,
    source: 'AniList',
    sourceIcon: '🎬',
    thumbnail: anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium,
    category: category,
    author: studio,
    keywords: genres,
    animeData: anime // Store original anime data
  };
};



// Cache for news data (2 minutes for fresh data)
let newsCache = null;
let cacheTime = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * Fetch anime news from RSS feeds with caching and fallback
 * @returns {Promise<Array>} Array of news items
 */
export const fetchAnimeNews = async () => {
  // Check cache first
  const now = Date.now();
  if (newsCache && (now - cacheTime) < CACHE_DURATION) {
    return newsCache;
  }

  try {
    const allNews = [];
    
    // Fetch trending anime (increase to 15)
    const trendingAnime = await fetchTrendingAnime();
    const trendingNews = trendingAnime.map(anime => convertAnimeToNews(anime, 'Trending'));
    allNews.push(...trendingNews.slice(0, 15));
    
    // Fetch anime schedule from MAL API (pre-fetched data)
    const animeByDay = await fetchMALSchedule();
    
    // Convert MAL anime to news format
    Object.keys(animeByDay).forEach(dayName => {
      animeByDay[dayName].forEach(anime => {
        const title = anime.title || 'Unknown';
        const studios = anime.studios?.map(s => s.name).join(', ') || 'Unknown Studio';
        const genres = anime.genres?.slice(0, 2) || ['Anime'];
        const imageUrl = anime.main_picture?.medium || anime.main_picture?.large || anime.images?.jpg?.image_url;
        
        const newsItem = {
          id: `mal-${anime.id}`,
          title: `${title} - ${dayName}`,
          description: anime.synopsis?.substring(0, 200) || `Airing on ${dayName}`,
          content: anime.synopsis || `No description available for ${title}.`,
          link: `https://myanimelist.net/anime/${anime.id}`,
          pubDate: new Date().toISOString(),
          source: 'MAL',
          sourceIcon: '📺',
          thumbnail: imageUrl,
          category: 'Now Airing',
          author: studios,
          keywords: genres,
          animeData: {
            ...anime,
            airingDay: dayName,
            dayName: dayName
          }
        };
        
        allNews.push(newsItem);
      });
    });
    
    // Limit to 30 items (trending first, then airing)
    const sortedNews = allNews.slice(0, 30);
    
    // Update cache
    newsCache = sortedNews;
    cacheTime = now;
    
    return sortedNews;
  } catch (error) {
    console.error('Error fetching anime news:', error);
    return [];
  }
};

/**
 * Fetch news from a specific source (AniList categories)
 * @param {string} sourceName - Name of the category (Trending, Now Airing)
 * @returns {Promise<Array>} Array of news items from the source
 */
export const fetchNewsBySource = async (sourceName) => {
  const allNews = await fetchAnimeNews();
  return allNews.filter(item => item.category === sourceName);
};

/**
 * Get a single news item by ID
 * @param {string} id - News item ID
 * @returns {Promise<Object>} News item
 */
export const getNewsById = async (id) => {
  const allNews = await fetchAnimeNews();
  return allNews.find(item => item.id === id) || null;
};

/**
 * Fetch seasonal anime banners from local JSON file or fallback to API
 * @returns {Promise<Array>} Array of banner image URLs from current season anime
 */
export const fetchSeasonalBanners = async () => {
  // Try to fetch from local data first
  const localData = await fetchLocalSeasonalData();
  if (localData && localData.banners && localData.banners.length > 0) {
    console.log(`Using local seasonal data: ${localData.banners.length} banners`);
    return localData.banners;
  }
  
  // Fallback to API if local data is not available
  console.log('Local data not available, falling back to API');
  const { season, year } = getCurrentSeason();
  
  const query = `
    query ($season: MediaSeason, $year: Int) {
      Page(page: 1, perPage: 20) {
        media(type: ANIME, sort: POPULARITY_DESC, season: $season, seasonYear: $year) {
          bannerImage
          coverImage {
            extraLarge
            large
          }
          season
          seasonYear
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API_URL, {
      query,
      variables: { season, year }
    });
    const media = response.data.data.Page.media;
    
    // Extract banner images, fallback to cover images if banner is not available
    const banners = media
      .map(anime => anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large)
      .filter(Boolean);
    
    console.log(`Fetched ${banners.length} banners for ${season} ${year}`);
    return banners;
  } catch (error) {
    console.error('Error fetching seasonal banners:', error);
    return [];
  }
};

// Cache for seasonal banners (1 hour)
let bannerCache = null;
let bannerCacheTime = 0;
const BANNER_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Fetch seasonal anime banners with caching
 * @returns {Promise<Array>} Array of banner image URLs
 */
export const getSeasonalBanners = async () => {
  const now = Date.now();
  if (bannerCache && (now - bannerCacheTime) < BANNER_CACHE_DURATION) {
    return bannerCache;
  }

  const banners = await fetchSeasonalBanners();
  bannerCache = banners;
  bannerCacheTime = now;
  
  return banners;
};
