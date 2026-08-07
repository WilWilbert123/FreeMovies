"use client";

import { Movie } from "@/types";
import { getImageUrl } from "@/lib/tmdb";
import { Play, Plus, Check, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MovieModal from "./MovieModal";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { addToList, removeFromList, isInList } = useUserStore();
  const isSaved = isInList(movie.id);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300); // 300ms delay before hover expansion
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  const toggleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      removeFromList(movie.id);
    } else {
      addToList(movie);
    }
  };

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHovered(false);
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        className="relative group w-[140px] sm:w-[180px] md:w-[220px] lg:w-[260px] h-[80px] sm:h-[100px] md:h-[120px] lg:h-[145px] shrink-0 cursor-pointer transition-transform duration-200"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w500')}
          alt={movie.title || movie.name}
          className="w-full h-full object-cover rounded-md"
        />

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[-10%] md:top-[-25%] left-[-5%] md:left-[-15%] w-[110%] md:w-[130%] z-50 bg-[#141414] rounded-md shadow-xl overflow-hidden shadow-black/50 origin-center"
            >
              <img
                src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w500')}
                alt={movie.title || movie.name}
                className="w-full aspect-video object-cover cursor-pointer"
                onClick={openModal}
              />

              <div className="p-2 md:p-4 flex flex-col gap-1 md:gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 md:gap-2">
                    <Link
                      href={`/watch/${movie.media_type || 'movie'}/${movie.id}`}
                      className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center hover:bg-neutral-300 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Play className="w-3 h-3 md:w-4 md:h-4 text-black ml-0.5 md:ml-1" fill="currentColor" />
                    </Link>
                    <button
                      onClick={toggleList}
                      className="w-6 h-6 md:w-8 md:h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition"
                    >
                      {isSaved ? (
                        <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      ) : (
                        <Plus className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={openModal}
                    className="w-6 h-6 md:w-8 md:h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition group"
                  >
                    <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-white group-hover:text-white" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-1 hidden md:flex">
                  <span className="text-green-400 font-semibold text-[10px] md:text-xs">
                    {Math.round((movie.vote_average || 0) * 10)}% Match
                  </span>
                  <span className="border border-gray-500 px-1 py-0.5 rounded text-[8px] md:text-[10px] text-white">
                    HD
                  </span>
                </div>

                <div className="text-white text-xs font-semibold truncate">
                  {movie.title || movie.name}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <MovieModal movie={movie} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
