import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANILIST_API_URL = 'https://graphql.anilist.co';

/**
 * Fetch trending anime from AniList API
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

  try {
    const response = await axios.post(ANILIST_API_URL, { query });
    return response.data.data.Page.media;
  } catch (error) {
    console.error('Error fetching trending anime:', error);
    return [];
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
  
  const dataToSave = {
    fetchedAt: new Date().toISOString(),
    anime: animeData
  };
  
  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
  console.log(`Saved trending data to ${filePath}`);
  console.log(`Total anime: ${animeData.length}`);
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
