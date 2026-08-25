import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANILIST_API_URL = 'https://graphql.anilist.co';

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
 * Fetch seasonal anime from AniList API
 * @param {string} season - Season name (WINTER, SPRING, SUMMER, FALL)
 * @param {number} year - Year
 * @returns {Promise<Array>} Array of anime data
 */
const fetchSeasonalAnime = async (season, year) => {
  const query = `
    query ($season: MediaSeason, $year: Int) {
      Page(page: 1, perPage: 30) {
        media(type: ANIME, sort: POPULARITY_DESC, season: $season, seasonYear: $year) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
            large
            medium
          }
          bannerImage
          season
          seasonYear
          genres
          averageScore
          episodes
          status
          studios {
            nodes {
              name
            }
          }
          description
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API_URL, {
      query,
      variables: { season, year }
    });
    return response.data.data.Page.media;
  } catch (error) {
    console.error('Error fetching seasonal anime:', error);
    return [];
  }
};

/**
 * Save seasonal anime data to JSON file
 * @param {Array} animeData - Array of anime data
 * @param {string} season - Season name
 * @param {number} year - Year
 */
const saveSeasonalData = (animeData, season, year) => {
  const dataDir = path.join(__dirname, '..', 'public', 'data', 'seasonal');
  const fileName = `${season.toLowerCase()}_${year}.json`;
  const filePath = path.join(dataDir, fileName);
  
  // Extract banner images and cover images for sidebar
  const banners = animeData
    .map(anime => anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large)
    .filter(Boolean);
  
  const dataToSave = {
    season,
    year,
    fetchedAt: new Date().toISOString(),
    anime: animeData,
    banners: banners
  };
  
  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
  console.log(`Saved seasonal data to ${filePath}`);
  console.log(`Total anime: ${animeData.length}`);
  console.log(`Total banners: ${banners.length}`);
};

/**
 * Main function
 */
const main = async () => {
  const { season, year } = getCurrentSeason();
  console.log(`Fetching ${season} ${year} anime from AniList...`);
  
  const animeData = await fetchSeasonalAnime(season, year);
  
  if (animeData.length > 0) {
    saveSeasonalData(animeData, season, year);
    console.log('Successfully fetched and saved seasonal anime data!');
  } else {
    console.error('No anime data fetched!');
    process.exit(1);
  }
};

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
