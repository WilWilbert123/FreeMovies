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
    }, 500); // 500ms delay before hover expansion
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
              animate={{ opacity: 1, scale: 1.15 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 left-0 w-full z-50 bg-[#141414] rounded-md shadow-xl overflow-hidden shadow-black/50 origin-center"
              style={{ width: '115%', left: '-7.5%', top: '-25%' }}
            >
              <img
                src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w500')}
                alt={movie.title || movie.name}
                className="w-full h-[140px] object-cover cursor-pointer"
                onClick={openModal}
              />
              
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Link
                      href={`/watch/${movie.media_type || 'movie'}/${movie.id}`}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-neutral-300 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Play className="w-4 h-4 text-black ml-1" fill="currentColor" />
                    </Link>
                    <button 
                      onClick={toggleList}
                      className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition"
                    >
                      {isSaved ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Plus className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  
                  <button 
                    onClick={openModal}
                    className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition group"
                  >
                    <ChevronDown className="w-4 h-4 text-white group-hover:text-white" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-green-400 font-semibold text-xs">
                    {Math.round((movie.vote_average || 0) * 10)}% Match
                  </span>
                  <span className="border border-gray-500 px-1 py-0.5 rounded text-[10px] text-white">
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
