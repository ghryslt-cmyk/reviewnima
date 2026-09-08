import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runScript = (scriptName) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    const process = spawn('node', [scriptPath], { stdio: 'inherit' });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${scriptName} exited with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
};

const main = async () => {
  console.log('Starting hourly fetch for news and trending anime...');
  console.log('---');

  let newsSuccess = false;
  let animeSuccess = false;

  // Fetch trending news
  try {
    console.log('Fetching trending news...');
    await runScript('fetch-trending-news.js');
    console.log('✓ Trending news fetched successfully');
    newsSuccess = true;
  } catch (error) {
    console.error('✗ Error fetching trending news:', error.message);
  }

  // Fetch trending anime
  try {
    console.log('---');
    console.log('Fetching trending anime...');
    await runScript('fetch-trending-anime.js');
    console.log('✓ Trending anime fetched successfully');
    animeSuccess = true;
  } catch (error) {
    console.error('✗ Error fetching trending anime:', error.message);
  }

  console.log('---');
  if (newsSuccess && animeSuccess) {
    console.log('✓ All hourly fetches completed successfully!');
  } else if (newsSuccess || animeSuccess) {
    console.log('⚠ Partial success: Some fetches completed, others failed');
  } else {
    console.error('✗ All hourly fetches failed');
    process.exit(1);
  }
};

main();
