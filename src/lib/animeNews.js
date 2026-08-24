import axios from 'axios';

const ANILIST_API_URL = 'https://graphql.anilist.co';

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

// Fetch currently airing anime from AniList
const fetchAiringAnime = async () => {
  const query = `
    query {
      Page(page: 1, perPage: 10) {
        media(type: ANIME, sort: POPULARITY_DESC, status: RELEASING) {
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
          nextAiringEpisode {
            airingAt
            episode
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API_URL, { query });
    return response.data.data.Page.media;
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
  
  return {
    id: `anime-${anime.id}`,
    title: `${title} - ${category}`,
    description: anime.description?.substring(0, 200) || `Popular ${genres.join(', ')} anime from ${studio}.`,
    content: anime.description || `No description available for ${title}.`,
    link: `https://anilist.co/anime/${anime.id}`,
    pubDate: anime.startDate ? new Date(anime.startDate.year, anime.startDate.month - 1, anime.startDate.day).toISOString() : new Date().toISOString(),
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

// Cache for news data (5 minutes)
let newsCache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
    
    // Fetch trending anime
    const trendingAnime = await fetchTrendingAnime();
    const trendingNews = trendingAnime.map(anime => convertAnimeToNews(anime, 'Trending'));
    allNews.push(...trendingNews.slice(0, 5));
    
    // Fetch currently airing anime
    const airingAnime = await fetchAiringAnime();
    const airingNews = airingAnime.map(anime => convertAnimeToNews(anime, 'Now Airing'));
    allNews.push(...airingNews.slice(0, 5));
    
    // Sort by date (newest first) and limit to 10 items
    const sortedNews = allNews
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 10);
    
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
