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

- **Schedule**: Runs on the 1st of January, April, July, and October at 00:00 UTC (the standard seasonal change of Japanese anime)
- **Trigger**: Can also be triggered manually via workflow_dispatch
- **Action**: Fetches the full airing schedule from the **official MAL API** (`GET /anime/schedule`, the same data as https://myanimelist.net/anime/season/schedule) and commits to `public/data/daily/anime_schedule.json`
- **Note**: This workflow only uses the official MAL API. The MAL schedule is intentionally **NOT** part of the daily/hourly fetch — it only updates at each Japanese anime season, mirroring MAL's own season/schedule page.

### Daily Data Workflow (`.github/workflows/fetch-daily-data.yml`)

- **Schedule**: Runs every 15 minutes
- **Trigger**: Can also be triggered manually via workflow_dispatch
- **Action**: Fetches trending anime (AniList) and trending news only. Commits to `public/data/daily/`. Does **not** touch the MAL schedule.

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

- The MAL schedule is fetched from the official MAL API (`/anime/schedule`) on each season change (Jan 1, Apr 1, Jul 1, Oct 1) and mirrors https://myanimelist.net/anime/season/schedule
- The MAL schedule is **not** included in the daily/hourly fetch — it updates at the standard Japanese anime season
- The schedule fetch requires the `MAL_CLIENT_ID` GitHub secret (set once; no key is hardcoded in the repo)
- All data is committed to the repository automatically by GitHub Actions
- The frontend reads from the committed JSON files, avoiding API rate limits
- If local data is missing, the frontend falls back to direct API calls
