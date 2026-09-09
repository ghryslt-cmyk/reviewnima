import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAL_API_URL = 'https://api.myanimelist.net/v2';

// Days used by the News page schedule bar (Sunday first, matching MAL's season/schedule page)
const SCHEDULE_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Ordered list of seasons (+ how to step to the previous one)
const SEASONS = ['winter', 'spring', 'summer', 'fall'];

const getSeasonIndex = (name) => SEASONS.indexOf(name);

const getCurrentSeason = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  let season;
  if (month >= 3 && month <= 5) season = 'spring';
  else if (month >= 6 && month <= 8) season = 'summer';
  else if (month >= 9 && month <= 11) season = 'fall';
  else season = 'winter';

  if (season === 'winter' && month <= 2) return { season, year: year - 1 };
  return { season, year };
};

const getPreviousSeason = ({ season, year }) => {
  const index = getSeasonIndex(season);
  if (index === 0) {
    return { season: SEASONS[3], year: year - 1 }; // winter -> fall (previous year)
  }
  return { season: SEASONS[index - 1], year };
};

/**
 * Fetch seasonal anime from the OFFICIAL MAL API.
 * NOTE: The MAL v2 API does NOT expose an /anime/schedule endpoint. The only
 * official endpoint that returns `broadcast` (day_of_the_week + start_time)
 * per anime is GET /anime/season/{year}/{season}. We fetch the current season
 * plus the previous season (to catch continuing titles still airing), then
 * group by broadcast day — replicating myanimelist.net/anime/season/schedule.
 */
const fetchSeasonalAnime = async (clientId, season, year) => {
  const headers = {
    'X-MAL-CLIENT-ID': clientId,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  const fields = 'id,title,main_picture,broadcast,synopsis,studios,genres,status,media_type';
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  const pageLimit = 100;
  const maxPages = 5;

  const collected = [];
  const seenIds = new Set();

  for (let page = 0; page < maxPages; page++) {
    const offset = page * pageLimit;
    let response = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await axios.get(`${MAL_API_URL}/anime/season/${year}/${season}`, {
          params: { limit: pageLimit, offset, fields },
          headers,
          timeout: 15000
        });
        break;
      } catch (error) {
        console.error(`${season} ${year} offset=${offset} attempt ${attempt}/${maxRetries} failed:`, error.message);
        if (error.response?.status === 403 || error.response?.status === 429) {
          console.log('Rate limited or blocked, waiting before retry...');
        }
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }

    if (!response) {
      console.error(`Max retries reached for ${season} ${year}, continuing with data fetched so far...`);
      break;
    }

    const entries = response.data?.data || [];
    for (const entry of entries) {
      const node = entry?.node || entry;
      if (!node?.id || seenIds.has(node.id)) continue;
      seenIds.add(node.id);
      collected.push(node);
    }

    // Pagination: stop if there is no next page or fewer items than the limit
    const paging = response.data?.paging;
    const fetched = entries.length;
    if (!paging?.next || fetched < pageLimit) break;
  }

  console.log(`Fetched ${collected.length} anime for ${season} ${year}`);
  return collected;
};

const groupAnimeByAiringDay = (animeList) => {
  const allByDay = Object.fromEntries(SCHEDULE_DAYS.map(day => [day, []]));

  for (const anime of animeList) {
    // Only include currently-airing titles (these are what MAL's schedule page shows)
    if (anime.status && anime.status !== 'currently_airing') continue;

    const broadcastDay = (anime.broadcast?.day_of_the_week || '').toLowerCase();
    if (SCHEDULE_DAYS.includes(broadcastDay)) {
      allByDay[broadcastDay].push(anime);
    }
  }

  // De-duplicate then sort each day by broadcast start time
  for (const day of SCHEDULE_DAYS) {
    const seen = new Set();
    allByDay[day] = allByDay[day].filter(anime => {
      if (seen.has(anime.id)) return false;
      seen.add(anime.id);
      return true;
    });

    allByDay[day].sort((a, b) => {
      const timeA = a.broadcast?.start_time || '99:99';
      const timeB = b.broadcast?.start_time || '99:99';
      return timeA.localeCompare(timeB);
    });
  }

  return allByDay;
};

const saveScheduleData = (scheduleData) => {
  const filePath = path.join(__dirname, '..', 'public', 'data', 'daily', 'anime_schedule.json');
  const totalAnime = Object.values(scheduleData).reduce((sum, arr) => sum + arr.length, 0);

  fs.writeFileSync(filePath, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    schedule: scheduleData
  }, null, 2));

  console.log(`Saved schedule data to ${filePath}`);
  console.log(`Total anime: ${totalAnime}`);
};

const main = async () => {
  const clientId = process.env.MAL_CLIENT_ID;
  if (!clientId) {
    console.error('MAL_CLIENT_ID environment variable is required!');
    process.exit(1);
  }

  const current = getCurrentSeason();
  const previous = getPreviousSeason(current);
  console.log(`Fetching ${current.season} ${current.year} (current) and ${previous.season} ${previous.year} (prev) from official MAL seasonal API...`);

  const currentAnime = await fetchSeasonalAnime(clientId, current.season, current.year);

  // Fetch previous season to catch continuing titles; failure here is not fatal
  let previousAnime = [];
  try {
    previousAnime = await fetchSeasonalAnime(clientId, previous.season, previous.year);
  } catch (error) {
    console.error('Failed fetching previous season (continuing from it anyway):', error.message);
  }

  const allAnime = [...currentAnime, ...previousAnime];
  const scheduleData = groupAnimeByAiringDay(allAnime);

  const totalAnime = Object.values(scheduleData).reduce((sum, arr) => sum + arr.length, 0);
  if (totalAnime === 0) {
    console.error('No anime schedule data fetched!');
    process.exit(1);
  }

  saveScheduleData(scheduleData);
  console.log(`Successfully fetched and saved daily schedule for ${totalAnime} anime!`);
};

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
