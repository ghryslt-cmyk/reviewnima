import axios from 'axios';

const ANILIST_API_URL = 'https://graphql.anilist.co';

export const searchAnime = async (searchTerm) => {
  const query = `
    query ($search: String) {
      Page(page: 1, perPage: 10) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            medium
          }
          bannerImage
          description
          genres
          averageScore
          episodes
          status
          season
          seasonYear
          studios {
            nodes {
              name
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API_URL, {
      query,
      variables: { search: searchTerm }
    });
    return response.data.data.Page.media;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
};

export const getPopularAnime = async (page = 1, perPage = 10) => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            medium
          }
          bannerImage
          description
          genres
          averageScore
          episodes
          status
          season
          seasonYear
          studios {
            nodes {
              name
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API_URL, {
      query,
      variables: { page, perPage }
    });
    return response.data.data.Page.media;
  } catch (error) {
    console.error('Error getting popular anime:', error);
    throw error;
  }
};

export const getAnimeById = async (id) => {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
          extraLarge
        }
        bannerImage
        description
        genres
        averageScore
        episodes
        status
        season
        seasonYear
        studios {
          nodes {
            name
          }
        }
        source
        duration
        airingSchedule {
          nodes {
            airingAt
            episode
          }
        }
        characters {
          edges {
            node {
              name {
                full
              }
              image {
                large
              }
            }
            role
          }
        }
        relations {
          edges {
            node {
              id
              title {
                romaji
                english
              }
              coverImage {
                medium
              }
              type
            }
            relationType
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API_URL, {
      query,
      variables: { id }
    });
    return response.data.data.Media;
  } catch (error) {
    console.error('Error getting anime by ID:', error);
    throw error;
  }
};
