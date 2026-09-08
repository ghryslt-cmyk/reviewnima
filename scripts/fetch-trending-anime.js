import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANILIST_API_URL = 'https://graphql.anilist.co';

/**
 * Fetch trending anime from AniList API with retry logic
 * @returns {Promise<Array>} Array of trending anime data
 */
const fetchTrendingAnime = async () => {
  const query = `
    query {
      Page(page: 1, perPage: 15) {
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

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(ANILIST_API_URL, { query }, { 
        headers,
        timeout: 10000
      });
      return response.data.data.Page.media;
    } catch (error) {
      console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (error.response?.status === 403) {
        console.log('Rate limited or blocked, waiting before retry...');
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      } else {
        console.error('Max retries reached for AniList API');
        return [];
      }
    }
  }
};

/**
 * Save trending anime data to JSON file
 * @param {Array} animeData - Array of anime data
 */
const saveTrendingData = (animeData) => {
  const dataDir = path.join(__dirname, '..', 'public', 'data', 'daily');
  const fileName = `trending_anime.json`;
  const filePath = path.join(dataDir, fileName);
  
  const version = Date.now();
  const dataToSave = {
    version: version,
    fetchedAt: new Date().toISOString(),
    anime: animeData
  };
  
  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
  console.log(`Saved trending data to ${filePath}`);
  console.log(`Total anime: ${animeData.length}`);
  console.log(`Version: ${version}`);
  
  // Update version file for cache busting
  const versionFilePath = path.join(dataDir, 'version.json');
  let versionData = {};
  try {
    if (fs.existsSync(versionFilePath)) {
      versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
    }
  } catch (e) {
    // File doesn't exist or is invalid, start fresh
  }
  
  versionData.trending_anime = version;
  versionData.updated_at = new Date().toISOString();
  fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));
};

/**
 * Main function
 */
const main = async () => {
  console.log('Fetching trending anime from AniList...');
  
  const animeData = await fetchTrendingAnime();
  
  if (animeData.length > 0) {
    saveTrendingData(animeData);
    console.log('Successfully fetched and saved trending anime data!');
  } else {
    console.error('No anime data fetched!');
    process.exit(1);
  }
};

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
