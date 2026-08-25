import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAL_API_URL = 'https://api.myanimelist.net/v2';

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

const fetchMALSeasonalAnime = async (season, year, clientId) => {
  try {
    const fields = 'id,title,main_picture,broadcast';
    const response = await axios.get(`${MAL_API_URL}/anime/season/${year}/${season}`, {
      params: { limit: 50, fields },
      headers: { 'X-MAL-CLIENT-ID': clientId }
    });
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching MAL seasonal anime:`, error.message);
    return [];
  }
};

const groupAnimeByAiringDay = (animeData) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const scheduleData = Object.fromEntries(days.map(day => [day, []]));
  
  for (const item of animeData) {
    const anime = item.node || item;
    if (anime.broadcast?.day_of_the_week) {
      const dayOfWeek = anime.broadcast.day_of_the_week.toLowerCase();
      if (scheduleData[dayOfWeek]) {
        scheduleData[dayOfWeek].push(anime);
      }
    }
  }
  
  return scheduleData;
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
  console.log(`Fetching ${season} ${year} anime from MAL API...`);
  
  const animeData = await fetchMALSeasonalAnime(season, year, clientId);
  if (animeData.length === 0) {
    console.error('No anime data fetched!');
    process.exit(1);
  }
  
  const scheduleData = groupAnimeByAiringDay(animeData);
  saveScheduleData(scheduleData);
  console.log(`Successfully fetched and saved schedule for ${animeData.length} anime!`);
};

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
