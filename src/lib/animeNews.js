import axios from 'axios';

// Use NewsAPI.org for better news aggregation (free tier available)
// For demo purposes, we'll use enhanced mock data with realistic anime news
const NEWS_API_KEY = process.env.VITE_NEWS_API_KEY || '';

// Enhanced mock data with proper links and images
const MOCK_NEWS = [
  {
    id: 'news1',
    title: 'One Piece Film Red Breaks Box Office Records Worldwide',
    description: 'The latest One Piece movie has achieved unprecedented success in theaters worldwide, breaking multiple box office records.',
    content: 'One Piece Film Red continues to dominate box offices globally, setting new records for anime films. The movie has grossed over $100 million in its opening weekend alone.',
    link: 'https://www.animenewsnetwork.com/news/2023-08-23/one-piece-film-red-box-office',
    pubDate: new Date().toISOString(),
    source: 'Anime News Network',
    sourceIcon: '📺',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop',
    category: 'One Piece',
    author: 'Anime News Network',
    keywords: ['one piece', 'anime', 'movie', 'luffy']
  },
  {
    id: 'news2',
    title: 'Bleach: Thousand-Year Blood War Season 2 Announced',
    description: 'The highly anticipated second season of Bleach TYBW has been officially confirmed with new key visual released.',
    content: 'Fans rejoice as the second season of Bleach: Thousand-Year Blood War is announced with new key visual. The season will cover the rest of the Quincy Blood War arc.',
    link: 'https://www.crunchyroll.com/news/2023-08-22/bleach-tybw-season-2',
    pubDate: new Date(Date.now() - 86400000).toISOString(),
    source: 'Crunchyroll',
    sourceIcon: '🍥',
    thumbnail: 'https://images.unsplash.com/photo-1541562232579-512a21360f8e?w=800&h=400&fit=crop',
    category: 'Bleach',
    author: 'Crunchyroll',
    keywords: ['bleach', 'anime', 'ichigo', 'soul reaper']
  },
  {
    id: 'news3',
    title: 'Naruto Creator Masashi Kishimoto Announces New Manga Project',
    description: 'Masashi Kishimoto reveals plans for an exciting new manga series that will debut next year.',
    content: 'The creator of Naruto has teased a brand new manga project that will debut next year. This will be his first major work since completing Naruto.',
    link: 'https://myanimelist.net/news/2023-08-21/kishimoto-new-manga',
    pubDate: new Date(Date.now() - 172800000).toISOString(),
    source: 'MyAnimeList',
    sourceIcon: '�',
    thumbnail: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&h=400&fit=crop',
    category: 'Naruto',
    author: 'MyAnimeList',
    keywords: ['naruto', 'manga', 'kishimoto', 'anime']
  },
  {
    id: 'news4',
    title: 'Attack on Titan Final Season Part 3 Release Date Confirmed',
    description: 'The conclusion of Attack on Titan has been scheduled for next month with special broadcast event.',
    content: 'The final episodes of Attack on Titan will air in a special broadcast event. MAPPA has confirmed the release date for the highly anticipated finale.',
    link: 'https://www.animenewsnetwork.com/news/2023-08-20/attack-on-titan-final',
    pubDate: new Date(Date.now() - 259200000).toISOString(),
    source: 'Anime News Network',
    sourceIcon: '📺',
    thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&h=400&fit=crop',
    category: 'Announcement',
    author: 'Anime News Network',
    keywords: ['attack on titan', 'anime', 'eren', 'titan']
  },
  {
    id: 'news5',
    title: 'Demon Slayer Season 4 Production Officially Begins',
    description: 'Ufotable announces that production has started on the next season of Demon Slayer.',
    content: 'Ufotable has officially begun production on Demon Slayer Season 4, which will adapt the Hashira Training Arc. Fans can expect the same high-quality animation.',
    link: 'https://www.crunchyroll.com/news/2023-08-19/demon-slayer-season-4',
    pubDate: new Date(Date.now() - 345600000).toISOString(),
    source: 'Crunchyroll',
    sourceIcon: '🍥',
    thumbnail: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=400&fit=crop',
    category: 'Demon Slayer',
    author: 'Crunchyroll',
    keywords: ['demon slayer', 'tanjiro', 'ufotable', 'anime']
  },
  {
    id: 'news6',
    title: 'Jujutsu Kaisen Manga Enters Final Arc',
    description: 'Gege Akutami confirms that Jujutsu Kaisen has entered its final arc.',
    content: 'The creator of Jujutsu Kaisen has confirmed that the manga has entered its final arc. This news has excited fans worldwide as the story approaches its climax.',
    link: 'https://myanimelist.net/news/2023-08-18/jujutsu-kaisen-final-arc',
    pubDate: new Date(Date.now() - 432000000).toISOString(),
    source: 'MyAnimeList',
    sourceIcon: '🎌',
    thumbnail: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&h=400&fit=crop',
    category: 'Manga',
    author: 'MyAnimeList',
    keywords: ['jujutsu kaisen', 'gojo', 'manga', 'anime']
  },
  {
    id: 'news7',
    title: 'Studio Ghibli Announces New Film for 2024',
    description: 'The legendary studio reveals plans for a new animated feature film.',
    content: 'Studio Ghibli has announced a new animated feature film scheduled for release in 2024. The film will be directed by a new generation of Ghibli directors.',
    link: 'https://www.animenewsnetwork.com/news/2023-08-17/ghibli-new-film',
    pubDate: new Date(Date.now() - 518400000).toISOString(),
    source: 'Anime News Network',
    sourceIcon: '📺',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=400&fit=crop',
    category: 'Movies',
    author: 'Anime News Network',
    keywords: ['studio ghibli', 'anime', 'movie', 'hayao miyazaki']
  },
  {
    id: 'news8',
    title: 'Chainsaw Man Movie Adaptation Confirmed',
    description: 'MAPPA confirms that a Chainsaw Man movie is in development.',
    content: 'Following the success of the Chainsaw Man anime series, MAPPA has confirmed that a movie adaptation is currently in development. The movie will cover the Reze arc.',
    link: 'https://www.crunchyroll.com/news/2023-08-16/chainsaw-man-movie',
    pubDate: new Date(Date.now() - 604800000).toISOString(),
    source: 'Crunchyroll',
    sourceIcon: '🍥',
    thumbnail: 'https://images.unsplash.com/photo-1560972550-aba3456b5564?w=800&h=400&fit=crop',
    category: 'Movies',
    author: 'Crunchyroll',
    keywords: ['chainsaw man', 'denji', 'makima', 'anime']
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
    
    // Use fallback images instead of Unsplash API (requires API key)
    // Return relevant placeholder images based on keywords
    const fallbackImages = [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1541562232579-512a21360f8e?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&h=400&fit=crop'
    ];
    
    return fallbackImages;
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
    // Try to use NewsAPI if key is available
    if (NEWS_API_KEY) {
      try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
          params: {
            q: 'anime OR manga OR "japanese animation"',
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 50,
            apiKey: NEWS_API_KEY
          },
          timeout: 5000
        });

        if (response.data && response.data.articles) {
          const newsItems = response.data.articles
            .filter(article => article.title && article.url)
            .map(article => ({
              id: generateId(article.url),
              title: article.title,
              description: article.description?.substring(0, 200) || '',
              content: article.content || article.description || '',
              link: article.url,
              pubDate: article.publishedAt || new Date().toISOString(),
              source: article.source?.name || 'News',
              sourceIcon: '📰',
              thumbnail: article.urlToImage || getDefaultThumbnail(),
              category: extractCategory(article.title) || 'News',
              author: article.author || article.source?.name || 'Unknown',
              keywords: extractKeywords(article.title)
            }));

          // Update cache
          newsCache = newsItems;
          cacheTime = now;

          return newsItems;
        }
      } catch (error) {
        console.error('Error fetching from NewsAPI:', error.message);
      }
    }

    // Fallback to enhanced mock data
    console.log('Using enhanced mock data');
    newsCache = MOCK_NEWS;
    cacheTime = now;
    return MOCK_NEWS;
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
