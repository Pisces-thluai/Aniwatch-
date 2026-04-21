import { Anime } from '../types';

const BASE_URL = 'https://api.jikan.moe/v4';

let requestQueue = Promise.resolve();

const fetchJikan = async (url: string, retries = 3, delay = 1000): Promise<any> => {
  return new Promise((resolve, reject) => {
    requestQueue = requestQueue.then(async () => {
      try {
        const res = await fetch(url);
        if (res.status === 429 && retries > 0) {
          console.warn(`Rate limited (429) fetching ${url}. Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          // Re-queue the recursive call to not block the main queue completely
          // or just resolve from the recursive call.
          const data = await fetchJikan(url, retries - 1, delay * 1.5);
          return resolve(data);
        }
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        resolve(data);
      } catch (err) {
        reject(err);
      } finally {
        await new Promise(r => setTimeout(r, 400));
      }
    });
  });
};

// Helper to map Jikan Anime object to our Anime interface
const mapJikanToAnime = (jikanData: any): Anime => {
  return {
    id: String(jikanData?.mal_id || ''),
    title: jikanData?.title_english || jikanData?.title || 'Unknown Title',
    japaneseTitle: jikanData?.title_japanese,
    image: jikanData?.images?.webp?.large_image_url || jikanData?.images?.jpg?.large_image_url || '',
    banner: jikanData?.trailer?.images?.maximum_image_url || null,
    description: jikanData?.synopsis || 'No synopsis available.',
    type: jikanData?.type || 'TV',
    duration: jikanData?.duration === 'Unknown' ? '24m' : (jikanData?.duration?.split(' ')[0] + 'm' || '24m'),
    releaseDate: jikanData?.aired?.string || 'Unknown',
    quality: 'HD',
    sub: jikanData?.episodes || 0,
    dub: jikanData?.episodes ? Math.floor(jikanData.episodes * 0.8) : 0, 
    episodes: jikanData?.episodes || 0,
    rating: jikanData?.rating ? jikanData.rating.split(' ')[0] : 'TV-14',
  };
};

const getUniqueAnime = (animeList: Anime[]): Anime[] => {
  const seen = new Set();
  return animeList.filter(anime => {
    if (seen.has(anime.id)) return false;
    seen.add(anime.id);
    return true;
  });
};

export const fetchHeroAnime = async (): Promise<Anime[]> => {
  try {
    const data = await fetchJikan(`${BASE_URL}/seasons/now?limit=4`);
    return data?.data && Array.isArray(data.data) ? getUniqueAnime(data.data.map(mapJikanToAnime)) : [];
  } catch (error) {
    console.error('Failed to fetch hero anime:', error);
    return [];
  }
};

export const fetchTrendingAnime = async (): Promise<Anime[]> => {
  try {
    const data = await fetchJikan(`${BASE_URL}/top/anime?filter=airing&limit=10`);
    return data?.data && Array.isArray(data.data) ? getUniqueAnime(data.data.map(mapJikanToAnime)) : [];
  } catch (error) {
    console.error('Failed to fetch trending anime:', error);
    return [];
  }
};

export const fetchRecentlyUpdated = async (): Promise<Anime[]> => {
  try {
    const data = await fetchJikan(`${BASE_URL}/schedules?limit=15`);
    return data?.data && Array.isArray(data.data) ? getUniqueAnime(data.data.map(mapJikanToAnime)) : [];
  } catch (error) {
    console.error('Failed to fetch recently updated anime:', error);
    return [];
  }
};

export const fetchTopTenAnime = async (): Promise<Anime[]> => {
  try {
    const data = await fetchJikan(`${BASE_URL}/top/anime?limit=10`);
    return data?.data && Array.isArray(data.data) ? getUniqueAnime(data.data.map(mapJikanToAnime)) : [];
  } catch (error) {
    console.error('Failed to fetch top ten anime:', error);
    return [];
  }
};

export const fetchAnimeById = async (id: string): Promise<Anime | null> => {
  try {
    const data = await fetchJikan(`${BASE_URL}/anime/${id}/full`);
    return data?.data ? mapJikanToAnime(data.data) : null;
  } catch (error) {
    console.error(`Failed to fetch anime with id ${id}:`, error);
    return null;
  }
};

export const searchAnime = async (query: string): Promise<Anime[]> => {
  try {
    const data = await fetchJikan(`${BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=5`);
    return data?.data && Array.isArray(data.data) ? getUniqueAnime(data.data.map(mapJikanToAnime)) : [];
  } catch (error) {
    console.error('Failed to search anime:', error);
    return [];
  }
};

export const fetchRecommendations = async (id: string): Promise<Anime[]> => {
  try {
    const data = await fetchJikan(`${BASE_URL}/anime/${id}/recommendations`);
    const mapped = data?.data && Array.isArray(data.data) ? data.data.slice(0, 10).map((item: any) => ({
      id: String(item?.entry?.mal_id || ''),
      title: item?.entry?.title || 'Unknown Title',
      image: item?.entry?.images?.webp?.large_image_url || item?.entry?.images?.jpg?.large_image_url || '',
      description: 'Recommended for you',
      type: 'TV',
      duration: '24m',
      releaseDate: 'Unknown',
      quality: 'HD',
      sub: 0,
      dub: 0,
      episodes: 0,
      rating: 'TV-14'
    })) : [];
    return getUniqueAnime(mapped);
  } catch (error) {
    console.error(`Failed to fetch recommendations for ${id}:`, error);
    return [];
  }
};
