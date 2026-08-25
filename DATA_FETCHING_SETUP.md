# Data Fetching Setup

This project uses automated data fetching to avoid API rate limits from AniList and MAL APIs. Data is fetched by GitHub Actions and stored in JSON files that the frontend reads from.

## Overview

- **Seasonal Anime**: Fetched on season change (Jan 1, Apr 1, Jul 1, Oct 1) from AniList
- **Trending Anime**: Fetched daily from AniList
- **Anime Schedule**: Fetched daily at 23:00 UTC for the next day's schedule from MAL API

## Setup Instructions

### 1. Get MAL API Client ID

1. Go to [MyAnimeList API](https://myanimelist.net/apiconfig)
2. Create an application to get your Client ID
3. Copy the Client ID

### 2. Add MAL_CLIENT_ID to GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `MAL_CLIENT_ID`
5. Value: Your MAL API Client ID
6. Click "Add secret"

### 3. Enable GitHub Actions

1. Go to your repository on GitHub
2. Navigate to Actions tab
3. Enable GitHub Actions if not already enabled
4. The workflows will run automatically based on their schedules

## Manual Data Fetching

You can manually fetch data using npm scripts:

```bash
# Fetch seasonal anime data
npm run fetch:seasonal

# Fetch trending anime data
npm run fetch:trending

# Fetch anime schedule data (requires MAL_CLIENT_ID in .env)
npm run fetch:schedule

# Fetch all data at once
npm run fetch:all
```

## Data Structure

Data is stored in `public/data/`:

```
public/data/
├── seasonal/
│   └── {season}_{year}.json    # e.g., summer_2026.json
└── daily/
    ├── trending_anime.json
    └── anime_schedule.json
```

## GitHub Actions Workflows

### Seasonal Data Workflow (`.github/workflows/fetch-seasonal-data.yml`)

- **Schedule**: Runs on the 1st of January, April, July, and October at 00:00 UTC
- **Trigger**: Can also be triggered manually via workflow_dispatch
- **Action**: Fetches seasonal anime from AniList and commits to `public/data/seasonal/`

### Daily Data Workflow (`.github/workflows/fetch-daily-data.yml`)

- **Schedule**: Runs daily at 23:00 UTC
- **Trigger**: Can also be triggered manually via workflow_dispatch
- **Action**: Fetches trending anime from AniList and anime schedule from MAL API, commits to `public/data/daily/`

## Frontend Integration

The frontend (`src/lib/animeNews.js`) automatically:

1. Tries to read from local JSON files first
2. Falls back to API calls if local data is unavailable
3. Uses cached data to avoid repeated API calls

This ensures the app works even if the automated fetching hasn't run yet.

## Season Schedule

- **Winter**: January - February (previous year)
- **Spring**: April - May
- **Summer**: July - August
- **Fall**: October - November

## Notes

- The MAL schedule fetch runs at 23:00 UTC to get data for the next day
- All data is committed to the repository automatically by GitHub Actions
- The frontend reads from the committed JSON files, avoiding API rate limits
- If local data is missing, the frontend falls back to direct API calls
