import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAL_API_URL = 'https://api.myanimelist.net/v2';

/**
 * Get current day of week in lowercase for MAL API
 * @returns {string} Day name (monday, tuesday, etc.)
 */
const getCurrentDayOfWeek = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

/**
 * Get next day of week in lowercase for MAL API
 * @returns {string} Next day name (monday, tuesday, etc.)
 */
const getNextDayOfWeek = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = new Date().getDay();
  const nextDay = (currentDay + 1) % 7;
  return days[nextDay];
};

/**
 * Fetch anime schedule from MAL API for a specific day
 * @param {string} day - Day name (monday, tuesday, etc.)
 * @param {string} clientId - MAL API Client ID
 * @returns {Promise<Array>} Array of anime from MAL
 */
const fetchMALSchedule = async (day, clientId) => {
  try {
    const response = await axios.get(`${MAL_API_URL}/anime/schedule?filter=${day}&limit=25`, {
      headers: {
        'X-MAL-CLIENT-ID': clientId
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching MAL schedule for ${day}:`, error.message);
    return [];
  }
};

/**
 * Save anime schedule data to JSON file
 * @param {Object} scheduleData - Object with anime grouped by day
 * @param {string} targetDay - The target day for which data was fetched
 */
const saveScheduleData = (scheduleData, targetDay) => {
  const dataDir = path.join(__dirname, '..', 'public', 'data', 'daily');
  const fileName = `anime_schedule.json`;
  const filePath = path.join(dataDir, fileName);
  
  const dataToSave = {
    fetchedAt: new Date().toISOString(),
    targetDay: targetDay,
    schedule: scheduleData
  };
  
  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
  console.log(`Saved schedule data to ${filePath}`);
  
  // Log total anime count
  let totalAnime = 0;
  Object.keys(scheduleData).forEach(day => {
    totalAnime += scheduleData[day].length;
  });
  console.log(`Total anime: ${totalAnime}`);
};

/**
 * Main function
 */
const main = async () => {
  const clientId = process.env.MAL_CLIENT_ID;
  
  if (!clientId) {
    console.error('MAL_CLIENT_ID environment variable is required!');
    console.error('Please set it in GitHub Secrets or .env file');
    process.exit(1);
  }
  
  // Get next day (fetching at 23:00 for the next day's schedule)
  const targetDay = getNextDayOfWeek();
  console.log(`Fetching anime schedule for ${targetDay} from MAL API...`);
  
  const animeData = await fetchMALSchedule(targetDay, clientId);
  
  if (animeData.length > 0) {
    // Group by day (for now, just the target day)
    const scheduleData = {
      [targetDay]: animeData
    };
    
    saveScheduleData(scheduleData, targetDay);
    console.log(`Successfully fetched and saved ${animeData.length} anime for ${targetDay}!`);
  } else {
    console.error('No anime data fetched!');
    process.exit(1);
  }
};

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
