"use client";

import { Movie } from "@/types";
import { getImageUrl } from "@/lib/tmdb";
import { Play, Plus, Check, ChevronDown, Star } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MovieModal from "./MovieModal";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  layout?: 'row' | 'grid';
}

export default function MovieCard({ movie, layout = 'row' }: MovieCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          "relative group shrink-0 cursor-pointer transition-transform duration-200 hover:scale-[1.03]",
          layout === 'row' 
            ? "w-[100px] sm:w-[160px] md:w-[220px] lg:w-[260px] aspect-[2/3]" 
            : "w-full aspect-[2/3]"
        )}
        onClick={openModal}
      >
        <img
          src={getImageUrl(movie.poster_path || movie.backdrop_path, 'w500')}
          alt={movie.title || movie.name}
          className="w-full h-full object-cover rounded-md"
        />

          {/* Top Left Year Badge */}
          {(movie.release_date || movie.first_air_date) && (
            <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 bg-netflix-red/90 backdrop-blur-md px-1.5 py-0.5 md:px-2 md:py-1 rounded flex items-center pointer-events-none border border-red-500/50 shadow-lg">
              <span className="text-white text-[9px] md:text-[11px] font-bold tracking-wider">
                {(movie.release_date || movie.first_air_date)?.split('-')[0]}
              </span>
            </div>
          )}

        {/* Top Right Rating Badge */}
        <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 bg-black/50 backdrop-blur-md px-1.5 py-0.5 md:px-2 md:py-1 rounded-md flex items-center gap-1 pointer-events-none border border-white/10 shadow-lg">
          <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" />
          <span className="text-white text-[9px] md:text-[11px] font-bold tracking-wider">
            {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
          </span>
        </div>

      </div>

      {isModalOpen && (
        <MovieModal movie={movie} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
