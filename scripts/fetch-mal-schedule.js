import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAL_API_URL = 'https://api.myanimelist.net/v2';

// Days used by the News page schedule bar (Sunday first, matching MAL's season/schedule page)
const SCHEDULE_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

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

/**
 * Fetch the full anime airing schedule from the OFFICIAL MAL API.
 * Endpoint: GET /anime/schedule  ->  same data as https://myanimelist.net/anime/season/schedule
 * (all currently airing anime grouped by day of the week), paginated with `offset`.
 */
const fetchMALSchedule = async (clientId) => {
  const headers = {
    'X-MAL-CLIENT-ID': clientId,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  // Fields needed by the News page schedule card and by animeNews.js conversion
  const fields = 'id,title,main_picture,broadcast,synopsis,studios,genres,status,media_type';

  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  const pageLimit = 100;
  const maxPages = 5; // ~500 anime max (matches MAL schedule page capacity)

  // Keyed by day name -> array of flattened anime nodes
  const allByDay = Object.fromEntries(SCHEDULE_DAYS.map(day => [day, []]));

  for (let page = 0; page < maxPages; page++) {
    const offset = page * pageLimit;
    let response = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await axios.get(`${MAL_API_URL}/anime/schedule`, {
          params: { limit: pageLimit, offset, fields },
          headers,
          timeout: 15000
        });
        break;
      } catch (error) {
        console.error(`Page offset=${offset} attempt ${attempt}/${maxRetries} failed:`, error.message);
        if (error.response?.status === 403 || error.response?.status === 429) {
          console.log('Rate limited or blocked, waiting before retry...');
        }
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }

    if (!response) {
      console.error('Max retries reached for MAL schedule API, continuing with data fetched so far...');
      break;
    }

    // /anime/schedule returns data as an object: { other: [...], sunday: [...], ... }
    const data = response.data?.data || {};
    let pageFetched = 0;

    for (const [dayKey, entries] of Object.entries(data)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        const node = entry?.node || entry;
        // Use the anime's own broadcast day, falling back to the endpoint's day key
        const broadcastDay = (node.broadcast?.day_of_the_week || '').toLowerCase();
        const targetDay = SCHEDULE_DAYS.includes(broadcastDay)
          ? broadcastDay
          : (SCHEDULE_DAYS.includes(dayKey) ? dayKey : null);

        if (targetDay) {
          allByDay[targetDay].push(node);
          pageFetched++;
        }
      }
    }

    if (pageFetched < pageLimit) break; // no more pages
  }

  // De-duplicate (some anime can appear in multiple day keys / pages)
  for (const day of SCHEDULE_DAYS) {
    const seen = new Set();
    allByDay[day] = allByDay[day].filter(anime => {
      if (!anime.id || seen.has(anime.id)) return false;
      seen.add(anime.id);
      return true;
    });
  }

  // Sort anime by broadcast start time within each day
  for (const day of SCHEDULE_DAYS) {
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

  const { season, year } = getCurrentSeason();
  console.log(`Fetching ${season} ${year} daily schedule from official MAL API...`);

  const scheduleData = await fetchMALSchedule(clientId);
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
