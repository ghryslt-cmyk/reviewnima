import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: ''
});

// Rate limiting for MAL to avoid hitting limits
let lastMALFetch = 0;
const MAL_RATE_LIMIT = 2000; // 2 seconds between MAL requests

/**
 * Scrape article page to extract image URL
 * @param {string} url - Article URL
 * @param {string} source - Source name
 * @returns {Promise<string|null>} Image URL or null
 */
const scrapeArticleImage = async (url, source) => {
  try {
    // Rate limiting for MAL
    if (source === 'MyAnimeList') {
      const now = Date.now();
      const timeSinceLastFetch = now - lastMALFetch;
      if (timeSinceLastFetch < MAL_RATE_LIMIT) {
        const waitTime = MAL_RATE_LIMIT - timeSinceLastFetch;
        console.log(`Rate limiting MAL: waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      lastMALFetch = Date.now();
    }

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;
    
    // Extract image based on source
    if (source === 'Anime News Network') {
      // ANN images are in figure elements
      const figureMatch = html.match(/<figure[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp))["']/i);
      if (figureMatch && figureMatch[1]) {
        return figureMatch[1];
      }
    } else if (source === 'MyAnimeList') {
      // MAL images are in various places
      const imgMatch = html.match(/<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png))["']/i);
      if (imgMatch && imgMatch[1]) {
        return imgMatch[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error scraping ${source} article:`, error.message);
    return null;
  }
};

/**
 * RSS URLs for different sources
 * Try direct RSS feeds first, fallback to rss2json API
 */
const RSS_SOURCES = {
  myanimelist: 'https://myanimelist.net/rss/news.xml',
  animeHerald: 'https://www.animeherald.com/feed/',
  animeNewsNetwork: 'https://animenewsnetwork.com/news/rss.xml'
};

/**
 * Fetch news from a single RSS source
 * @param {string} sourceName - Name of the source
 * @param {string} rssUrl - RSS URL
 * @returns {Promise<Array>} Array of news items
 */
const fetchFromSource = async (sourceName, rssUrl) => {
  try {
    console.log(`Fetching from ${sourceName}...`);
    
    const response = await axios.get(rssUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Parse raw XML RSS feed directly
    const parsedData = xmlParser.parse(response.data);
    
    // Extract items from RSS feed
    const rssItems = parsedData.rss?.channel?.item || parsedData.feed?.entry || [];
    
    if (!rssItems || rssItems.length === 0) {
      console.log(`No items found in ${sourceName} feed`);
      return [];
    }
    
    // Debug: log first item's structure (only in development)
    if (process.env.DEBUG) {
      const firstItem = Array.isArray(rssItems) ? rssItems[0] : rssItems;
      const description = firstItem.description || firstItem.content || firstItem['content:encoded'] || '';
      console.log(`Sample description from ${sourceName}:`, description?.substring(0, 500));
      console.log(`First item keys:`, Object.keys(firstItem));
    }
    
    const itemsPromises = (Array.isArray(rssItems) ? rssItems : [rssItems]).map(async (item) => {
        // Extract thumbnail from various sources with multiple patterns
        let thumbnail = item.thumbnail || null;
        
        // Helper function to extract image from HTML content
        const extractImageFromHTML = (html) => {
          if (!html) return null;
          
          // Try multiple regex patterns for different HTML structures
          const patterns = [
            /<img[^>]+src=["']([^"']+)["']/i,           // Standard img tag
            /<img[^>]+src=([^"'\s>]+)/i,                // img without quotes
            /<img[^>]+srcset=["']([^"']+)["']/i,         // srcset attribute
            /<img[^>]+data-src=["']([^"']+)["']/i,       // lazy loading
            /<img[^>]+data-original=["']([^"']+)["']/i,  // another lazy loading
            /background-image:\s*url\(["']?([^"')]+)["']?\)/i, // CSS background
          ];
          
          for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
              // Clean up the URL
              let url = match[1].trim();
              // Handle srcset (take first image)
              if (url.includes(',')) {
                url = url.split(',')[0].trim();
              }
              // Handle query parameters in srcset
              if (url.includes(' ')) {
                url = url.split(' ')[0].trim();
              }
              return url;
            }
          }
          return null;
        };
        
        // Try to extract from description
        if (!thumbnail && item.description) {
          thumbnail = extractImageFromHTML(item.description);
        }
        
        // Try to extract from content:encoded
        if (!thumbnail && item['content:encoded']) {
          thumbnail = extractImageFromHTML(item['content:encoded']);
        }
        
        // Try to extract from enclosure (could be object or string)
        if (!thumbnail && item.enclosure) {
          if (typeof item.enclosure === 'string') {
            thumbnail = item.enclosure;
          } else if (item.enclosure.url) {
            thumbnail = item.enclosure.url;
          } else if (item.enclosure.link) {
            thumbnail = item.enclosure.link;
          }
        }
        
        // Try to extract from media:thumbnail
        if (!thumbnail && item['media:thumbnail']) {
          if (typeof item['media:thumbnail'] === 'string') {
            thumbnail = item['media:thumbnail'];
          } else if (item['media:thumbnail'].url) {
            thumbnail = item['media:thumbnail'].url;
          } else if (item['media:thumbnail'].$ && item['media:thumbnail'].$.url) {
            thumbnail = item['media:thumbnail'].$.url;
          }
        }
        
        // Web scraping fallback for ANN and MAL if no thumbnail found
        if (!thumbnail && item.link && (sourceName === 'Anime News Network' || sourceName === 'MyAnimeList')) {
          console.log(`Scraping ${sourceName} article for image: ${item.title}`);
          thumbnail = await scrapeArticleImage(item.link, sourceName);
        }
        
        // Clean description (remove HTML tags for preview)
        let cleanDescription = item.description || '';
        cleanDescription = cleanDescription.replace(/<[^>]*>/g, '').trim();
        cleanDescription = cleanDescription.substring(0, 300) + (cleanDescription.length > 300 ? '...' : '');
        
        return {
          title: item.title,
          description: cleanDescription,
          fullDescription: item.description || '', // Keep full description for detail view
          link: item.link,
          pubDate: item.pubDate,
          source: sourceName,
          category: 'Newspaper',
          thumbnail: thumbnail,
          guid: typeof item.guid === 'string' ? item.guid : (item.guid?.['#text'] || item.link)
        };
      });
      
      // Wait for all async operations to complete
      const items = await Promise.all(itemsPromises);
      
      // Log thumbnail extraction stats
      const withThumbnails = items.filter(item => item.thumbnail !== null).length;
      console.log(`✓ Fetched ${items.length} items from ${sourceName} (${withThumbnails} with thumbnails)`);
      return items;
  } catch (error) {
    console.error(`✗ Error fetching from ${sourceName}:`, error.message);
    return [];
  }
};

/**
 * Extract thumbnail from RSS item
 * @param {Object} item - RSS item
 * @returns {string|null} Thumbnail URL
 */
const extractThumbnail = (item) => {
  // Try to extract image from description
  if (item.description) {
    const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }
  
  // Try to extract from enclosure
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  // Try to extract from thumbnail
  if (item.thumbnail) {
    return item.thumbnail;
  }
  
  return null;
};

/**
 * Interleave news items from multiple sources
 * @param {Object} newsBySource - Object with source names as keys and news arrays as values
 * @returns {Array} Interleaved news array
 */
const interleaveNews = (newsBySource) => {
  const sources = Object.keys(newsBySource);
  const maxLength = Math.max(...sources.map(s => newsBySource[s].length));
  const interleaved = [];
  
  for (let i = 0; i < maxLength; i++) {
    sources.forEach(source => {
      if (newsBySource[source][i]) {
        interleaved.push(newsBySource[source][i]);
      }
    });
  }
  
  return interleaved;
};

/**
 * Save trending news data to JSON file
 * @param {Array} newsData - Array of news data
 */
const saveTrendingNews = (newsData) => {
  const dataDir = path.join(__dirname, '..', 'public', 'data', 'daily');
  const fileName = `trending_news.json`;
  const filePath = path.join(dataDir, fileName);
  
  // Limit to 15 items
  const limitedData = newsData.slice(0, 15);
  
  const dataToSave = {
    fetchedAt: new Date().toISOString(),
    news: limitedData,
    total: limitedData.length
  };
  
  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
  console.log(`Saved trending news to ${filePath}`);
  console.log(`Total news items: ${limitedData.length}`);
};

/**
 * Main function
 */
const main = async () => {
  console.log('Fetching trending news from RSS sources...');
  console.log('Sources: MyAnimeList, Anime Herald, Anime News Network');
  console.log('---');
  
  // Fetch from all sources
  const newsBySource = {};
  
  const malNews = await fetchFromSource('MyAnimeList', RSS_SOURCES.myanimelist);
  const heraldNews = await fetchFromSource('Anime Herald', RSS_SOURCES.animeHerald);
  const annNews = await fetchFromSource('Anime News Network', RSS_SOURCES.animeNewsNetwork);
  
  newsBySource['MyAnimeList'] = malNews;
  newsBySource['Anime Herald'] = heraldNews;
  newsBySource['Anime News Network'] = annNews;
  
  console.log('---');
  
  // Interleave news from all sources
  const interleavedNews = interleaveNews(newsBySource);
  
  // Sort by publication date (newest first)
  interleavedNews.sort((a, b) => {
    const dateA = new Date(a.pubDate);
    const dateB = new Date(b.pubDate);
    return dateB - dateA;
  });
  
  if (interleavedNews.length > 0) {
    saveTrendingNews(interleavedNews);
    console.log('✓ Successfully fetched and saved trending news!');
  } else {
    console.error('✗ No news data fetched!');
    process.exit(1);
  }
};

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
