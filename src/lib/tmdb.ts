import axios from 'axios';
import { MovieDetails, TMDBResponse } from '@/types';

const BASE_URL = 'https://api.themoviedb.org/3';
// It's a demo, if the user doesn't provide an API key, we might have issues.
// But we will use the environment variable.
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

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
};

export const fetchMovies = async (endpoint: string): Promise<TMDBResponse> => {
  const { data } = await tmdb.get(endpoint);
  return data;
};

export const fetchMovieDetails = async (id: number | string, type: 'movie' | 'tv' = 'movie'): Promise<MovieDetails> => {
  const { data } = await tmdb.get(`/${type}/${id}`, {
    params: {
      append_to_response: 'videos,credits,similar',
    },
  });
  return data;
};

export const searchMovies = async (query: string): Promise<TMDBResponse> => {
  const { data } = await tmdb.get(`/search/multi`, {
    params: {
      query,
      include_adult: false,
    },
  });
  return data;
};

export function getImageUrl(path: string | null | undefined, size: 'w500' | 'original' = 'w500') {
  if (!path) return '/placeholder.png'; // Fallback image if needed
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
