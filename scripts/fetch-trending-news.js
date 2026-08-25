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

/**
 * RSS URLs for different sources
 * Using reliable RSS feeds with rss2json API
 */
const RSS_SOURCES = {
  myanimelist: 'https://api.rss2json.com/v1/api.json?rss_url=https://myanimelist.net/rss/news.xml',
  animeHerald: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.animeherald.com/feed/',
  animeNewsNetwork: 'https://api.rss2json.com/v1/api.json?rss_url=https://animenewsnetwork.com/news/rss.xml'
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

    // Handle rss2json API response
    if (response.data.status === 'ok') {
      const items = response.data.items.map(item => {
        // Extract thumbnail from various sources
        let thumbnail = item.thumbnail || null;
        
        // Try to extract from description if no thumbnail
        if (!thumbnail && item.description) {
          const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/);
          if (imgMatch && imgMatch[1]) {
            thumbnail = imgMatch[1];
          }
        }
        
        // Try to extract from enclosure
        if (!thumbnail && item.enclosure && item.enclosure.url) {
          thumbnail = item.enclosure.url;
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
          category: 'Trending on Internet',
          thumbnail: thumbnail,
          guid: item.guid || item.link
        };
      });
      
      console.log(`✓ Fetched ${items.length} items from ${sourceName}`);
      return items;
    } else {
      console.error(`✗ Failed to fetch from ${sourceName}: Invalid RSS status`);
      return [];
    }
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
