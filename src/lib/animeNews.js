import axios from 'axios';

// RSS to JSON converter service
const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json';

// Trusted anime news RSS feeds
const NEWS_SOURCES = [
  {
    name: 'Anime News Network',
    url: 'https://www.animenewsnetwork.com/news/rss.xml',
    icon: '📺'
  },
  {
    name: 'Crunchyroll News',
    url: 'https://www.crunchyroll.com/news/rss.xml',
    icon: '🍥'
  },
  {
    name: 'MyAnimeList News',
    url: 'https://myanimelist.net/news/rss.xml',
    icon: '🎌'
  }
];

// Fallback mock data when APIs fail
const MOCK_NEWS = [
  {
    id: 'mock1',
    title: 'One Piece Film Red Breaks Box Office Records',
    description: 'The latest One Piece movie has achieved unprecedented success in theaters worldwide.',
    content: 'One Piece Film Red continues to dominate box offices globally, setting new records for anime films.',
    link: 'https://myanimelist.net/news',
    pubDate: new Date().toISOString(),
    source: 'MyAnimeList',
    sourceIcon: '🎌',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop',
    category: 'One Piece',
    author: 'MyAnimeList',
    keywords: ['one piece', 'anime', 'movie', 'luffy']
  },
  {
    id: 'mock2',
    title: 'Bleach: Thousand-Year Blood War Season 2 Announced',
    description: 'The highly anticipated second season of Bleach TYBW has been officially confirmed.',
    content: 'Fans rejoice as the second season of Bleach: Thousand-Year Blood War is announced with new key visual.',
    link: 'https://myanimelist.net/news',
    pubDate: new Date(Date.now() - 86400000).toISOString(),
    source: 'Anime News Network',
    sourceIcon: '📺',
    thumbnail: 'https://images.unsplash.com/photo-1541562232579-512a21360f8e?w=800&h=400&fit=crop',
    category: 'Bleach',
    author: 'Anime News Network',
    keywords: ['bleach', 'anime', 'ichigo', 'soul reaper']
  },
  {
    id: 'mock3',
    title: 'Naruto Creator Announces New Manga Project',
    description: 'Masashi Kishimoto reveals plans for an exciting new manga series.',
    content: 'The creator of Naruto has teased a brand new manga project that will debut next year.',
    link: 'https://crunchyroll.com/news',
    pubDate: new Date(Date.now() - 172800000).toISOString(),
    source: 'Crunchyroll',
    sourceIcon: '🍥',
    thumbnail: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&h=400&fit=crop',
    category: 'Naruto',
    author: 'Crunchyroll',
    keywords: ['naruto', 'manga', 'kishimoto', 'anime']
  },
  {
    id: 'mock4',
    title: 'Attack on Titan Final Season Part 3 Release Date',
    description: 'The conclusion of Attack on Titan has been scheduled for next month.',
    content: 'The final episodes of Attack on Titan will air in a special broadcast event.',
    link: 'https://myanimelist.net/news',
    pubDate: new Date(Date.now() - 259200000).toISOString(),
    source: 'MyAnimeList',
    sourceIcon: '🎌',
    thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&h=400&fit=crop',
    category: 'Announcement',
    author: 'MyAnimeList',
    keywords: ['attack on titan', 'anime', 'eren', 'titan']
  }
];

/**
 * Search for relevant images using Unsplash API based on keywords
 * @param {string} title - Article title to extract keywords from
 * @returns {Promise<Array>} Array of image URLs
 */
export const searchRelevantImages = async (title) => {
  try {
    // Extract keywords from title
    const keywords = extractKeywords(title);
    
    if (keywords.length === 0) return [];
    
    // Search Unsplash for relevant images
    const searchQuery = keywords.slice(0, 2).join(' '); // Use top 2 keywords
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: searchQuery,
        per_page: 6,
        orientation: 'landscape'
      },
      headers: {
        // Note: In production, you should use environment variables for API keys
        // For demo purposes, we'll use a public endpoint or fallback
      }
    });
    
    if (response.data && response.data.results) {
      return response.data.results.map(photo => photo.urls.regular);
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
    
    // Fetch from RSS feeds with timeout
    for (const source of NEWS_SOURCES) {
      try {
        const response = await axios.get(RSS_TO_JSON_API, {
          params: {
            rss_url: source.url
          },
          timeout: 5000 // 5 second timeout
        });
        
        if (response.data && response.data.items) {
          const newsItems = response.data.items.slice(0, 10).map(item => ({
            id: generateId(item.guid || item.link),
            title: item.title,
            description: stripHtml(item.description).substring(0, 200),
            content: stripHtml(item.description),
            link: item.link,
            pubDate: item.pubDate,
            source: source.name,
            sourceIcon: source.icon,
            thumbnail: extractThumbnail(item) || getDefaultThumbnail(),
            category: extractCategory(item.title) || 'News',
            author: source.name,
            keywords: extractKeywords(item.title)
          }));
          
          allNews.push(...newsItems);
        }
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error.message);
      }
    }
    
    // If no news from RSS, use fallback
    if (allNews.length === 0) {
      console.log('Using fallback mock data');
      return MOCK_NEWS;
    }
    
    // Sort by date (newest first) and limit to 50 items
    const sortedNews = allNews
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 50);
    
    // Update cache
    newsCache = sortedNews;
    cacheTime = now;
    
    return sortedNews;
  } catch (error) {
    console.error('Error fetching anime news:', error);
    return MOCK_NEWS;
  }
};

/**
 * Fetch news from a specific source
 * @param {string} sourceName - Name of the news source
 * @returns {Promise<Array>} Array of news items from the source
 */
export const fetchNewsBySource = async (sourceName) => {
  const source = NEWS_SOURCES.find(s => s.name === sourceName);
  if (!source) return [];
  
  try {
    const response = await axios.get(RSS_TO_JSON_API, {
      params: {
        rss_url: source.url
      },
      timeout: 5000
    });
    
    if (response.data && response.data.items) {
      return response.data.items.slice(0, 25).map(item => ({
        id: generateId(item.guid || item.link),
        title: item.title,
        description: stripHtml(item.description).substring(0, 200),
        content: stripHtml(item.description),
        link: item.link,
        pubDate: item.pubDate,
        source: source.name,
        sourceIcon: source.icon,
        thumbnail: extractThumbnail(item) || getDefaultThumbnail(),
        category: extractCategory(item.title) || 'News',
        author: source.name
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

function stripHtml(html) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function extractThumbnail(item) {
  // Try to extract image from description or content
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = item.description?.match(imgRegex) || item.content?.match(imgRegex);
  if (match) return match[1];
  
  // Try to extract from enclosure (RSS media)
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  // Try to extract from thumbnail field
  if (item.thumbnail) {
    return item.thumbnail;
  }
  
  return null;
}

function getDefaultThumbnail() {
  return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop';
}

function extractCategory(title) {
  const categories = {
    'One Piece': /one piece|op|luffy|zoro|sanji/i,
    'Bleach': /bleach|ichigo|rukia|aizen/i,
    'Naruto': /naruto|sasuke|sakura|konoha/i,
    'Movie': /movie|film|theater|cinema/i,
    'Episode': /episode|ep\.|s\d+e\d+|season \d+/i,
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
