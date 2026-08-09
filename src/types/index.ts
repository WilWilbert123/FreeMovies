export interface Movie {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  original_language?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type?: string;
  genre_ids: number[];
  popularity: number;
  release_date?: string;
  first_air_date?: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface TMDBResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  status: string;
  tagline: string;
  videos?: {
    results: {
      id: string;
      iso_639_1: string;
      iso_3166_1: string;
      key: string;
      name: string;
      site: string;
      size: number;
      type: string;
    }[];
  };
  credits?: {
    cast: {
      id: number;
      name: string;
      profile_path: string | null;
      character: string;
    }[];
    crew?: {
      id: number;
      name: string;
      job: string;
      department: string;
    }[];
  };
  similar?: TMDBResponse;
  seasons?: {
    id: number;
    season_number: number;
    name: string;
    episode_count: number;
    poster_path: string | null;
  }[];
}

export interface TVEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  runtime: number;
  air_date: string;
}

export interface TVSeason {
  id: number;
  name: string;
  season_number: number;
  episodes: TVEpisode[];
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string;
  created_at?: string;
}
