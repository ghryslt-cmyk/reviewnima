import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Force push local data files to GitHub
 * Use this only when you need to override GitHub data with local data
 * to fix errors or issues
 */
const forcePushData = () => {
  console.log('⚠️  WARNING: This will force push local data to GitHub');
  console.log('This will overwrite GitHub data with your local data files');
  console.log('');
  
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  const dailyDir = path.join(dataDir, 'daily');
  const seasonalDir = path.join(dataDir, 'seasonal');
  
  // Check if data files exist
  const dailyFiles = fs.readdirSync(dailyDir).filter(f => f.endsWith('.json'));
  const seasonalFiles = fs.existsSync(seasonalDir) 
    ? fs.readdirSync(seasonalDir).filter(f => f.endsWith('.json'))
    : [];
  
  console.log('Files to be pushed:');
  dailyFiles.forEach(f => console.log(`  - public/data/daily/${f}`));
  seasonalFiles.forEach(f => console.log(`  - public/data/seasonal/${f}`));
  console.log('');
  
  // Force add the files (even if they're in .gitignore)
  try {
    console.log('Force adding data files to git...');
    execSync('git add -f public/data/daily/*.json', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    if (seasonalFiles.length > 0) {
      execSync('git add -f public/data/seasonal/*.json', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    }
    
    console.log('Committing changes...');
    execSync('git commit -m "Force push data: manual override [MANUAL OVERRIDE]"', { 
      cwd: path.join(__dirname, '..'), 
      stdio: 'inherit' 
    });
    
    console.log('Pushing to GitHub...');
    execSync('git push', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    
    console.log('');
    console.log('✅ Data force pushed to GitHub successfully!');
    console.log('⚠️  Remember to remove data files from git tracking after this if needed:');
    console.log('   git rm --cached public/data/daily/*.json');
    console.log('   git rm --cached public/data/seasonal/*.json');
    
  } catch (error) {
    console.error('❌ Error during force push:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  forcePushData();
}

export default forcePushData;
