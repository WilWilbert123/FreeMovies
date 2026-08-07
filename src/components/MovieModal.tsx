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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Prevent scrolling on body when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 sm:p-6">
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
          className="relative w-full h-full md:h-auto max-w-3xl md:max-h-[90vh] bg-[#181818] md:rounded-xl overflow-y-auto scrollbar-hide shadow-2xl z-10 flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-[#181818]/70 hover:bg-[#181818] rounded-full transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Header Image / Trailer Fallback */}
          <div className="relative w-full h-[40vh] sm:h-[50vh] shrink-0">
            {details?.videos?.results && details.videos.results.length > 0 ? (
              <iframe
                className="w-full h-full pointer-events-none"
                src={`https://www.youtube.com/embed/${details.videos.results[0].key}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${details.videos.results[0].key}`}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <img
                src={getImageUrl(movie.backdrop_path || movie.poster_path, 'original')}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover"
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
            
            {/* Play Button & Controls */}
            <div className="absolute bottom-6 left-6 flex items-center gap-4">
              <Link
                href={`/watch/${movie.media_type || 'movie'}/${movie.id}`}
                className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-md font-bold hover:bg-neutral-300 transition"
              >
                <Play className="w-6 h-6" fill="currentColor" />
                Play
              </Link>
              <button 
                onClick={toggleList}
                className="w-10 h-10 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white bg-[#181818]/50 transition"
              >
                {isSaved ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Plus className="w-5 h-5 text-white" />
                )}
              </button>
              <button className="w-10 h-10 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white bg-[#181818]/50 transition">
                <ThumbsUp className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Movie Details */}
          <div className="p-6 md:p-12 flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-green-400 font-semibold">
                  {Math.round((movie.vote_average || 0) * 10)}% Match
                </span>
                <span className="text-gray-300">
                  {new Date(movie.release_date || movie.first_air_date || '').getFullYear()}
                </span>
                {details?.runtime && (
                  <span className="text-gray-300">
                    {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                  </span>
                )}
                <span className="border border-gray-500 px-1.5 py-0.5 rounded text-xs text-white">
                  HD
                </span>
              </div>
              
              <p className="text-white text-base md:text-lg leading-relaxed">
                {movie.overview}
              </p>
            </div>
            
            <div className="w-full md:w-1/3 flex flex-col gap-4 text-sm">
              <div>
                <span className="text-gray-500">Cast: </span>
                <span className="text-gray-300">
                  {details?.credits?.cast?.slice(0, 4).map(c => c.name).join(', ') || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Genres: </span>
                <span className="text-gray-300">
                  {details?.genres?.map(g => g.name).join(', ') || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  if (!mounted) return null;

  const { createPortal } = require('react-dom');
  return createPortal(modalContent, document.body);
}
