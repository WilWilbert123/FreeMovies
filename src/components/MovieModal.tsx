"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Plus, Check, ThumbsUp } from "lucide-react";
import { Movie, MovieDetails } from "@/types";
import { fetchMovieDetails, getImageUrl } from "@/lib/tmdb";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const { addToList, removeFromList, isInList } = useUserStore();
  
  const isSaved = isInList(movie.id);

  useEffect(() => {
    const getDetails = async () => {
      try {
        const data = await fetchMovieDetails(movie.id, (movie.media_type as any) || 'movie');
        setDetails(data);
      } catch (error) {
        console.error("Error fetching details", error);
      }
    };
    getDetails();

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [movie.id, movie.media_type]);

  const toggleList = () => {
    if (isSaved) {
      removeFromList(movie.id);
    } else {
      addToList(movie);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-[#181818] rounded-xl overflow-hidden shadow-2xl z-10 flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-[#181818]/70 hover:bg-[#181818] rounded-full transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Header Image / Trailer Fallback */}
          <div className="relative w-full h-[40vh] sm:h-[50vh] shrink-0">
            <img
              src={getImageUrl(movie.backdrop_path || movie.poster_path, 'original')}
              alt={movie.title || movie.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3">
              <Link
                href={`/watch/${movie.media_type || 'movie'}/${movie.id}`}
                className="bg-white text-black px-6 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-white/80 transition"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Play
              </Link>
              
              <button 
                onClick={toggleList}
                className="w-10 h-10 border-2 border-gray-400 rounded-full flex items-center justify-center bg-black/50 hover:border-white hover:bg-black/80 transition group"
                title={isSaved ? "Remove from My List" : "Add to My List"}
              >
                {isSaved ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Plus className="w-5 h-5 text-white" />
                )}
              </button>
              
              <button className="w-10 h-10 border-2 border-gray-400 rounded-full flex items-center justify-center bg-black/50 hover:border-white hover:bg-black/80 transition">
                <ThumbsUp className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 overflow-y-auto scrollbar-hide text-white text-sm md:text-base grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-3 font-semibold">
                <span className="text-green-400">
                  {Math.round((movie.vote_average || 0) * 10)}% Match
                </span>
                <span>
                  {movie.release_date 
                    ? new Date(movie.release_date).getFullYear() 
                    : movie.first_air_date 
                      ? new Date(movie.first_air_date).getFullYear() 
                      : ''}
                </span>
                {details?.runtime && (
                  <span>
                    {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                  </span>
                )}
                <span className="border border-gray-500 px-1.5 py-0.5 rounded text-xs">HD</span>
              </div>
              
              <p className="text-gray-200 leading-relaxed text-sm md:text-base">
                {movie.overview}
              </p>
            </div>
            
            <div className="col-span-1 space-y-4 text-sm">
              {details?.credits?.cast && details.credits.cast.length > 0 && (
                <div>
                  <span className="text-gray-400">Cast: </span>
                  <span className="text-gray-200">
                    {details.credits.cast.slice(0, 4).map(c => c.name).join(', ')}
                  </span>
                </div>
              )}
              
              {details?.genres && details.genres.length > 0 && (
                <div>
                  <span className="text-gray-400">Genres: </span>
                  <span className="text-gray-200">
                    {details.genres.map(g => g.name).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
