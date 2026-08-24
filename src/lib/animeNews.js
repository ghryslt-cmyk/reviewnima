import axios from 'axios';

// Jikan API (MyAnimeList unofficial API) - Free and reliable
const JIKAN_API_BASE = 'https://api.jikan.moe/v4';

/**
 * Fetch anime news from Jikan API
 * @returns {Promise<Array>} Array of news items
 */
export const fetchAnimeNews = async () => {
  try {
    const allNews = [];
    
    // Fetch news from multiple endpoints
    const endpoints = [
      '/news/anime',
      '/news/manga'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${JIKAN_API_BASE}${endpoint}`, {
          params: {
            limit: 25
          }
        });
        
        if (response.data && response.data.data) {
          const newsItems = response.data.data.map(item => ({
            id: item.mal_id?.toString() || generateId(item.title),
            title: item.title,
            description: item.excerpt || item.title,
            content: item.excerpt || '',
            link: item.url || '#',
            pubDate: item.date || new Date().toISOString(),
            source: extractSource(item.url) || 'MyAnimeList',
            sourceIcon: '🎌',
            thumbnail: item.images?.jpg?.image_url || item.main_picture?.medium || getDefaultThumbnail(),
            category: extractCategory(item.title, item.author_username) || 'News',
            author: item.author_username || 'MyAnimeList'
          }));
          
          allNews.push(...newsItems);
        }
      } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
      }
    }
    
    // Sort by date (newest first) and limit to 50 items
    const sortedNews = allNews
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 50);
    
    return sortedNews;
  } catch (error) {
    console.error('Error fetching anime news:', error);
    return [];
  }
};

/**
 * Fetch news from a specific category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of news items
 */
export const fetchNewsBySource = async (sourceName) => {
  try {
    const endpoint = sourceName === 'Manga' ? '/news/manga' : '/news/anime';
    const response = await axios.get(`${JIKAN_API_BASE}${endpoint}`, {
      params: {
        limit: 25
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data.map(item => ({
        id: item.mal_id?.toString() || generateId(item.title),
        title: item.title,
        description: item.excerpt || item.title,
        content: item.excerpt || '',
        link: item.url || '#',
        pubDate: item.date || new Date().toISOString(),
        source: extractSource(item.url) || 'MyAnimeList',
        sourceIcon: '🎌',
        thumbnail: item.images?.jpg?.image_url || item.main_picture?.medium || getDefaultThumbnail(),
        category: extractCategory(item.title, item.author_username) || 'News',
        author: item.author_username || 'MyAnimeList'
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching from ${sourceName}:`, error);
    return [];
  }
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

// Helper functions
function generateId(str) {
  return btoa(str).replace(/[/+=]/g, '').substring(0, 12);
}

function getDefaultThumbnail() {
  return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop';
}

function extractSource(url) {
  if (!url) return 'MyAnimeList';
  if (url.includes('myanimelist.net')) return 'MyAnimeList';
  if (url.includes('crunchyroll.com')) return 'Crunchyroll';
  if (url.includes('animenewsnetwork.com')) return 'Anime News Network';
  return 'Anime News';
}

function extractCategory(title, author) {
  const categories = {
    'One Piece': /one piece|op|luffy|zoro|sanji/i,
    'Bleach': /bleach|ichigo|rukia|aizen/i,
    'Naruto': /naruto|sasuke|sakura|konoha/i,
    'Movie': /movie|film|theater|cinema/i,
    'Episode': /episode|ep\.|season \d+/i,
    'Manga': /manga|chapter|ch\.|volume/i,
    'Announcement': /announce|reveal|trailer|pv|teaser/i,
    'Review': /review|rating|score/i
  };
  
  for (const [category, regex] of Object.entries(categories)) {
    if (regex.test(title)) {
      return category;
    }
  }
  
  return 'News';
}
