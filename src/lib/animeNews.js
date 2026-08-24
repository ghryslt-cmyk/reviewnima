import axios from 'axios';

// Reddit subreddits for trending anime content
const ANIME_SUBREDDITS = [
  { name: 'r/anime', icon: '🎌' },
  { name: 'r/OnePiece', icon: '��‍☠️' },
  { name: 'r/Bleach', icon: '⚔️' },
  { name: 'r/Naruto', icon: '🍥' },
  { name: 'r/AnimeNews', icon: '📺' },
  { name: 'r/animecirclejerk', icon: '😂' },
  { name: 'r/animefigures', icon: '�' }
];

/**
 * Fetch trending anime news from Reddit
 * @returns {Promise<Array>} Array of news items
 */
export const fetchAnimeNews = async () => {
  try {
    const allNews = [];
    
    // Fetch hot posts from each subreddit (trending content)
    for (const subreddit of ANIME_SUBREDDITS) {
      try {
        const response = await axios.get(`https://www.reddit.com/${subreddit.name}/hot.json`, {
          params: {
            limit: 10
          }
        });
        
        if (response.data && response.data.data && response.data.data.children) {
          const posts = response.data.data.children
            .filter(child => child.kind === 't3')
            .map(child => {
              const data = child.data;
              return {
                id: data.id,
                title: data.title,
                description: data.selftext || data.url_overridden_by_dest || '',
                content: data.selftext || '',
                link: `https://www.reddit.com${data.permalink}`,
                pubDate: new Date(data.created_utc * 1000).toISOString(),
                source: subreddit.name,
                sourceIcon: subreddit.icon,
                thumbnail: getRedditImage(data),
                category: extractCategory(data.title, subreddit.name) || 'Trending',
                upvotes: data.ups,
                comments: data.num_comments,
                author: data.author
              };
            });
          
          allNews.push(...posts);
        }
      } catch (error) {
        console.error(`Error fetching from ${subreddit.name}:`, error);
      }
    }
    
    // Sort by upvotes (most popular first) and limit to 50 items
    const sortedNews = allNews
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 50);
    
    return sortedNews;
  } catch (error) {
    console.error('Error fetching anime news:', error);
    return [];
  }
};

/**
 * Fetch news from a specific subreddit
 * @param {string} subredditName - Name of the subreddit (e.g., 'anime')
 * @returns {Promise<Array>} Array of news items from the subreddit
 */
export const fetchNewsBySource = async (sourceName) => {
  const subreddit = ANIME_SUBREDDITS.find(s => s.name === sourceName);
  if (!subreddit) return [];
  
  try {
    const response = await axios.get(`https://www.reddit.com/${subreddit.name}/hot.json`, {
      params: {
        limit: 25
      }
    });
    
    if (response.data && response.data.data && response.data.data.children) {
      return response.data.data.children
        .filter(child => child.kind === 't3')
        .map(child => {
          const data = child.data;
          return {
            id: data.id,
            title: data.title,
            description: data.selftext || data.url_overridden_by_dest || '',
            content: data.selftext || '',
            link: `https://www.reddit.com${data.permalink}`,
            pubDate: new Date(data.created_utc * 1000).toISOString(),
            source: subreddit.name,
            sourceIcon: subreddit.icon,
            thumbnail: getRedditImage(data),
            category: extractCategory(data.title, subreddit.name) || 'Trending',
            upvotes: data.ups,
            comments: data.num_comments,
            author: data.author
          };
        });
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching from ${subreddit.name}:`, error);
    return [];
  }
};

/**
 * Get a single news item by ID
 * @param {string} id - News item ID
 * @returns {Promise<Object>} News item
 */
export const getNewsById = async (id) => {
  const allNews = await fetchAnimeNews();
  return allNews.find(item => item.id === id) || null;
};

// Helper functions
function getRedditImage(data) {
  // Try to get the image from the post
  if (data.url && (data.url.endsWith('.jpg') || data.url.endsWith('.png') || data.url.endsWith('.jpeg') || data.url.endsWith('.gif') || data.url.includes('imgur.com'))) {
    return data.url;
  }
  
  // Try to get preview image
  if (data.preview && data.preview.images && data.preview.images.length > 0) {
    const source = data.preview.images[0].source;
    if (source && source.url) {
      return source.url.replace(/&amp;/g, '&');
    }
  }
  
  // Default thumbnail
  return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=400&fit=crop';
}

function extractCategory(title, subreddit) {
  const categories = {
    'Discussion': /discussion|thoughts|opinion|what do you think/i,
    'Episode': /episode|ep\.|s\d+e\d+|season \d+/i,
    'Manga': /manga|chapter|ch\.|spoilers/i,
    'Movie': /movie|film|theater/i,
    'News': /news|announcement|official|trailer|pv/i,
    'Fan Art': /fanart|fan art|art|drawing|sketch/i,
    'Meme': /meme|shitpost|funny|lol/i,
    'Question': /question|help|looking for|recommend/i
  };
  
  // Check subreddit-specific categories
  if (subreddit === 'r/OnePiece') return 'One Piece';
  if (subreddit === 'r/Bleach') return 'Bleach';
  if (subreddit === 'r/Naruto') return 'Naruto';
  
  // Check title patterns
  for (const [category, regex] of Object.entries(categories)) {
    if (regex.test(title)) {
      return category;
    }
  }
  
  return 'Trending';
}
