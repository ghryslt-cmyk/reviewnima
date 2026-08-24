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

/**
 * Fetch anime news from RSS feeds
 * @returns {Promise<Array>} Array of news items
 */
export const fetchAnimeNews = async () => {
  try {
    const allNews = [];
    
    for (const source of NEWS_SOURCES) {
      try {
        const response = await axios.get(RSS_TO_JSON_API, {
          params: {
            rss_url: source.url
          }
        });
        
        if (response.data && response.data.items) {
          const newsItems = response.data.items.map(item => ({
            id: generateId(item.guid || item.link),
            title: item.title,
            description: stripHtml(item.description),
            content: item.content || item.description,
            link: item.link,
            pubDate: item.pubDate,
            source: source.name,
            sourceIcon: source.icon,
            thumbnail: extractThumbnail(item) || getDefaultThumbnail(),
            category: extractCategory(item.title) || 'General'
          }));
          
          allNews.push(...newsItems);
        }
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
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
      }
    });
    
    if (response.data && response.data.items) {
      return response.data.items.map(item => ({
        id: generateId(item.guid || item.link),
        title: item.title,
        description: stripHtml(item.description),
        content: item.content || item.description,
        link: item.link,
        pubDate: item.pubDate,
        source: source.name,
        sourceIcon: source.icon,
        thumbnail: extractThumbnail(item) || getDefaultThumbnail(),
        category: extractCategory(item.title) || 'General'
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching from ${sourceName}:`, error);
    return [];
  }
};

/**
 * Get a single news item by ID (simulated - in real app would fetch from API)
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
  return match ? match[1] : null;
}

function getDefaultThumbnail() {
  return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop';
}

function extractCategory(title) {
  const categories = {
    'anime': /anime/i,
    'manga': /manga/i,
    'movie': /movie|film/i,
    'game': /game/i,
    'release': /release|announce/i,
    'review': /review/i
  };
  
  for (const [category, regex] of Object.entries(categories)) {
    if (regex.test(title)) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }
  
  return 'General';
}
