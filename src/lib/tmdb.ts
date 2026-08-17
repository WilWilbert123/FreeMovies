import axios from 'axios';
import { MovieDetails, TMDBResponse } from '@/types';

const BASE_URL = 'https://api.tmdb.org/3';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const tmdb = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  params: {
    api_key: API_KEY,
  },
});

// Retry helper for handling transient socket disconnects (ECONNRESET, ENOTFOUND, ETIMEDOUT)
const getWithRetry = async (url: string, config: any = {}, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await tmdb.get(url, config);
    } catch (err: any) {
      const isNetworkError =
        err.code === 'ECONNRESET' ||
        err.code === 'ENOTFOUND' ||
        err.code === 'ETIMEDOUT' ||
        !err.response;

      if (isNetworkError && i < retries - 1) {
        await new Promise((res) => setTimeout(res, 300 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
};

export const requests = {
  fetchTrending: '/trending/all/week',
  fetchTrendingTV: '/trending/tv/week',
  fetchTrendingMovies: '/trending/movie/week',
  fetchNetflixOriginals: '/discover/tv?with_networks=213',
  fetchTopRated: '/movie/top_rated',
  fetchTopRatedTV: '/tv/top_rated',
  fetchActionMovies: '/discover/movie?with_genres=28',
  fetchComedyMovies: '/discover/movie?with_genres=35',
  fetchComedyTV: '/discover/tv?with_genres=35',
  fetchHorrorMovies: '/discover/movie?with_genres=27',
  fetchRomanceMovies: '/discover/movie?with_genres=10749',
  fetchDocumentaries: '/discover/movie?with_genres=99',
  fetchSciFi: '/discover/movie?with_genres=878',
  fetchAnimation: '/discover/movie?with_genres=16',
  fetchClassics: '/discover/movie?primary_release_date.lte=1990-01-01',
  fetchUpcomingMovies: '/movie/upcoming',
  fetchAnime: '/discover/tv?with_genres=16&with_original_language=ja',
  fetchKDramas: '/discover/tv?with_original_language=ko',
  fetchMystery: '/discover/movie?with_genres=9648',
  fetchFamily: '/discover/movie?with_genres=10751',
};

export const fetchMovies = async (endpoint: string, page: number = 1, region: string = 'ALL'): Promise<TMDBResponse> => {
  try {
    let finalEndpoint = endpoint;
    const params: any = { page };

    if (region && region !== 'ALL') {
      if (endpoint.includes('/trending/movie')) {
        finalEndpoint = '/discover/movie';
        params.sort_by = 'popularity.desc';
      } else if (endpoint.includes('/trending/tv') || endpoint.includes('/trending/all')) {
        finalEndpoint = '/discover/tv';
        params.sort_by = 'popularity.desc';
      } else if (endpoint.includes('/movie/top_rated')) {
        finalEndpoint = '/discover/movie';
        params.sort_by = 'vote_average.desc';
        params.without_genres = '99,10755';
        params['vote_count.gte'] = 200;
      } else if (endpoint.includes('/tv/top_rated')) {
        finalEndpoint = '/discover/tv';
        params.sort_by = 'vote_average.desc';
        params['vote_count.gte'] = 200;
      }
      params.with_origin_country = region;
    }

    const { data } = await getWithRetry(finalEndpoint, { params });
    const isTV = finalEndpoint.includes('/tv');
    const isMovie = finalEndpoint.includes('/movie');

    if (data && data.results) {
      data.results = data.results.map((item: any) => ({
        ...item,
        media_type: item.media_type || (isTV ? 'tv' : isMovie ? 'movie' : 'movie')
      }));
    }

    return data;
  } catch (error) {
    console.error(`Failed to fetch movies from ${endpoint}:`, error);
    return { page, results: [], total_pages: 0, total_results: 0 };
  }
};

export const fetchMovieDetails = async (id: number | string, type: 'movie' | 'tv' = 'movie'): Promise<MovieDetails> => {
  try {
    const { data } = await getWithRetry(`/${type}/${id}`, {
      params: {
        append_to_response: 'videos,credits,similar',
      },
    });
    return { ...data, media_type: type };
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      const otherType = type === 'movie' ? 'tv' : 'movie';
      try {
        const { data: fallbackData } = await getWithRetry(`/${otherType}/${id}`, {
          params: {
            append_to_response: 'videos,credits,similar',
          },
        });
        return { ...fallbackData, media_type: otherType };
      } catch (fallbackError) {
        console.error(`Failed to fetch details for both types for id ${id}`);
      }
    } else {
      console.error(`Failed to fetch details for ${type} ${id}:`, error);
    }
    return { id: Number(id), title: 'Not Found', overview: 'Data could not be loaded.' } as unknown as MovieDetails;
  }
};

export const fetchTVSeason = async (tvId: string | number, seasonNumber: number): Promise<any> => {
  try {
    const { data } = await getWithRetry(`/tv/${tvId}/season/${seasonNumber}`);
    return data;
  } catch (error) {
    console.error(`Failed to fetch season ${seasonNumber} for tv ${tvId}:`, error);
    return null;
  }
};

export const searchMovies = async (query: string): Promise<TMDBResponse> => {
  try {
    const { data } = await getWithRetry(`/search/multi`, {
      params: {
        query,
        include_adult: false,
      },
    });
    return data;
  } catch (error) {
    console.error(`Failed to search movies for query "${query}":`, error);
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
};

export function getImageUrl(path: string | null | undefined, size: 'w500' | 'original' = 'w500', fallbackText: string = 'NO POSTER') {
  if (!path) {
    const shortText = fallbackText.length > 25 ? fallbackText.substring(0, 22) + '...' : fallbackText;
    const escapedText = shortText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='500' height='750' viewBox='0 0 500 750'>
      <defs>
        <linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stop-color='#0f172a'/>
          <stop offset='100%' stop-color='#1e1b4b'/>
        </linearGradient>
        <linearGradient id='ic' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stop-color='#334155'/>
          <stop offset='100%' stop-color='#1e293b'/>
        </linearGradient>
        <linearGradient id='textGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stop-color='#94a3b8'/>
          <stop offset='100%' stop-color='#64748b'/>
        </linearGradient>
      </defs>
      <rect width='500' height='750' fill='url(#bg)'/>
      <g transform='translate(250, 320) scale(3)'>
        <rect x='-24' y='-24' width='48' height='48' rx='12' fill='url(#ic)'/>
        <circle cx='-6' cy='-8' r='3' fill='#64748b'/>
        <path d='M-16 14 L-4 -2 L4 8 L10 0 L16 14 Z' fill='#64748b'/>
      </g>
      <text x='250' y='460' font-family='system-ui, -apple-system, sans-serif' font-size='22' font-weight='500' fill='url(#textGrad)' text-anchor='middle' letter-spacing='1'>${escapedText.toUpperCase()}</text>
      <text x='250' y='490' font-family='system-ui, -apple-system, sans-serif' font-size='14' font-weight='400' fill='#475569' text-anchor='middle'>Image unavailable</text>
    </svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
