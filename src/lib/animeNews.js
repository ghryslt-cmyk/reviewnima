import axios from 'axios';

const ANILIST_API_URL = 'https://graphql.anilist.co';
const JIKAN_API_URL = 'https://api.jikan.moe/v4';

/**
 * Get current day of week in lowercase for MAL API
 * @returns {string} Day name (monday, tuesday, etc.)
 */
const getCurrentDayOfWeek = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

/**
 * Fetch anime schedule from MAL (Jikan API) for current day
 * @returns {Promise<Array>} Array of anime from MAL
 */
const fetchMALSchedule = async () => {
  const day = getCurrentDayOfWeek();
  
  try {
    const response = await axios.get(`${JIKAN_API_URL}/schedules/${day}?limit=15`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching MAL schedule:', error);
    return [];
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

// Fetch trending anime from AniList to use as "news"
const fetchTrendingAnime = async () => {
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

// Fetch currently airing anime from MAL schedule and enrich with AniList assets
const fetchAiringAnime = async () => {
  try {
    // Fetch schedule from MAL for current day
    const malAnime = await fetchMALSchedule();
    
    // Enrich each MAL anime with AniList assets
    const enrichedAnime = await Promise.all(
      malAnime.map(async (malItem) => {
        const anilistData = await searchAniListByTitle(malItem.title);
        
        // Use AniList data if found, otherwise use MAL data
        if (anilistData) {
          return {
            ...anilistData,
            malTitle: malItem.title,
            malUrl: malItem.url,
            malScore: malItem.score,
            malEpisodes: malItem.episodes,
            airingDay: getCurrentDayOfWeek()

          };
        } else {
          // Fallback to MAL data structure
          return {
            id: malItem.mal_id,
            title: {
              romaji: malItem.title,
              english: malItem.title_english || malItem.title,
              native: malItem.title_japanese || malItem.title
            },
            coverImage: {
              large: malItem.images?.jpg?.large_image_url || malItem.images?.jpg?.image_url,
              medium: malItem.images?.jpg?.image_url,
              extraLarge: malItem.images?.jpg?.large_image_url
            },
            bannerImage: null,
            description: malItem.synopsis || 'No description available.',
            genres: malItem.genres?.map(g => g.name) || [],
            averageScore: malItem.score ? malItem.score * 10 : null,
            episodes: malItem.episodes,
            status: malItem.status,
            studios: {
              nodes: malItem.studios?.map(s => ({ name: s.name })) || []
            },
            malTitle: malItem.title,
            malUrl: malItem.url,
            malScore: malItem.score,
            malEpisodes: malItem.episodes,
            airingDay: getCurrentDayOfWeek()
          };
        }
      })
    );
    
    return enrichedAnime;
  } catch (error) {
    console.error('Error fetching airing anime:', error);
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


/**
 * Search for relevant images using Unsplash API based on keywords
 * @param {string} title - Article title to extract keywords from
 * @returns {Promise<Array>} Array of image URLs
 */
export const searchRelevantImages = async (title) => {
  try {
    // Extract anime ID from title if it's from our news format
    const animeIdMatch = title.match(/anime-(\d+)/);
    if (animeIdMatch) {
      // This is already from our anime data, return empty to avoid duplicate images
      return [];
    }
    
    // For other titles, fetch related anime from AniList
    const keywords = extractKeywords(title);
    if (keywords.length === 0) return [];
    
    const query = `
      query ($search: String) {
        Page(page: 1, perPage: 6) {
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            coverImage {
              large
              extraLarge
            }
            bannerImage
          }
        }
      }
    `;
    
    const response = await axios.post(ANILIST_API_URL, {
      query,
      variables: { search: keywords[0] }
    });
    
    if (response.data?.data?.Page?.media) {
      return response.data.data.Page.media
        .map(anime => anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large)
        .filter(Boolean);
    }
    
    return [];
  } catch (error) {
    console.error('Error searching images:', error);
    return [];
  }
};

function extractKeywords(title) {
  const animeKeywords = ['anime', 'manga', 'one piece', 'naruto', 'bleach', 'attack on titan', 'dragon ball', 'pokemon', 'studio ghibli', 'demon slayer', 'jujutsu kaisen', 'my hero academia'];
  const words = title.toLowerCase().split(/\s+/);
  
  return words.filter(word => 
    animeKeywords.some(keyword => word.includes(keyword) || keyword.includes(word)) ||
    word.length > 3
  ).slice(0, 3);
}

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
    
    // Fetch currently airing anime (increase to 15)
    const airingAnime = await fetchAiringAnime();
    const airingNews = airingAnime.map(anime => convertAnimeToNews(anime, 'Now Airing'));
    allNews.push(...airingNews.slice(0, 15));
    
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
 * Fetch seasonal anime banners from AniList API for current season
 * @returns {Promise<Array>} Array of banner image URLs from current season anime
 */
export const fetchSeasonalBanners = async () => {
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
