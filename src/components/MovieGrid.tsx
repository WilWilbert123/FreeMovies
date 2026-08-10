"use client";

import { useState, useEffect } from "react";
import MovieCard from "./MovieCard";
import { Movie } from "@/types";
import { fetchMovies } from "@/lib/tmdb";
import { Search } from "lucide-react";

interface MovieGridProps {
  initialMovies: Movie[];
  endpoint: string;
  title?: string;
  region?: string;
}

export default function MovieGrid({ initialMovies, endpoint, title, region = 'ALL' }: MovieGridProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    
    try {
      const data = await fetchMovies(endpoint, nextPage, region);
      if (data.results && data.results.length > 0) {
        setMovies((prev) => {
          // Prevent duplicates just in case
          const existingIds = new Set(prev.map(m => m.id));
          const newMovies = data.results.filter((m: Movie) => !existingIds.has(m.id));
          return [...prev, ...newMovies];
        });
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more movies", error);
    } finally {
      setLoading(false);
    }
  };

  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { searchMovies } = await import("@/lib/tmdb");
        const data = await searchMovies(searchQuery.trim());
        
        const urlParams = new URLSearchParams(endpoint.split('?')[1] || "");
        const genreId = urlParams.get('with_genres');
        const lang = urlParams.get('with_original_language');
        const isTv = endpoint.includes('/tv');
        const isMovie = endpoint.includes('/movie');

        const filtered = (data.results || []).filter((m: Movie) => {
          if (isTv && m.media_type !== 'tv' && m.media_type) return false;
          if (isMovie && m.media_type !== 'movie' && m.media_type) return false;
          
          if (genreId) {
            const genres = genreId.split(',').map(Number);
            if (!m.genre_ids || !genres.some(g => m.genre_ids.includes(g))) {
              return false;
            }
          }
          if (lang && m.original_language !== lang) {
            return false;
          }
          return true;
        });

        setSearchResults(filtered);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, endpoint]);

  const displayMovies = searchQuery.trim() ? searchResults : movies;

  return (
    <>
      {title && (
        <div className="flex flex-row justify-between items-center mb-6 gap-2">
          <h2 className="text-xl md:text-3xl font-semibold truncate">{title}</h2>
          <div className="relative w-40 md:w-auto flex-shrink-0">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 md:pl-3 pointer-events-none">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#141414] border border-gray-600 text-white rounded-md pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 text-sm md:text-base w-full md:w-64 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
            />
          </div>
        </div>
      )}

      {isSearching && (
        <div className="text-center py-10 text-gray-400">
          Searching for "{searchQuery}"...
        </div>
      )}

      {!isSearching && displayMovies.length === 0 && searchQuery && (
        <div className="text-center py-10 text-gray-400">
          No results found for "{searchQuery}".
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {!isSearching && displayMovies.map((movie, index) => (
          <MovieCard key={`${movie.id}-${index}`} movie={movie} layout="grid" />
        ))}
      </div>
      
      {hasMore && !searchQuery && (
        <div className="flex justify-center mt-12 mb-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-[#333] hover:bg-gray-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}
