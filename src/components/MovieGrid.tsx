"use client";

import { useState } from "react";
import MovieCard from "./MovieCard";
import { Movie } from "@/types";
import { fetchMovies } from "@/lib/tmdb";

interface MovieGridProps {
  initialMovies: Movie[];
  endpoint: string;
}

export default function MovieGrid({ initialMovies, endpoint }: MovieGridProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    
    try {
      const data = await fetchMovies(endpoint, nextPage);
      if (data.results && data.results.length > 0) {
        setMovies((prev) => [...prev, ...data.results]);
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

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie, index) => (
          <MovieCard key={`${movie.id}-${index}`} movie={movie} layout="grid" />
        ))}
      </div>
      
      {hasMore && (
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
