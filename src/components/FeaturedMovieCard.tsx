"use client";

import { Movie } from "@/types";
import { getImageUrl } from "@/lib/tmdb";
import { Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import MovieModal from "./MovieModal";

interface FeaturedMovieCardProps {
  movie: Movie;
}

export default function FeaturedMovieCard({ movie }: FeaturedMovieCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive genres or fallback
  const year = (movie.release_date || movie.first_air_date)?.split('-')[0] || "N/A";
  
  return (
    <>
      <div
        className="relative group shrink-0 cursor-pointer transition-transform duration-200 hover:scale-[1.02] flex flex-col rounded-md overflow-hidden bg-[#181818] border border-white/10 shadow-lg 
        w-[180px] sm:w-[320px] md:w-[456px] lg:w-[536px]
        h-[150px] sm:h-[240px] md:h-[330px] lg:h-[390px]"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Top Image Section */}
        <div className="relative w-full h-[55%] md:h-[65%] shrink-0 bg-black">
          <img
            src={getImageUrl(movie.backdrop_path || movie.poster_path, 'w500')}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover"
          />
          {/* Subtle gradient overlay to make title pop if we render it on the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
          
          <div className="absolute bottom-2 left-3 md:bottom-3 md:left-4 right-3">
            <h3 className="text-white font-bold text-lg md:text-2xl lg:text-3xl line-clamp-1 drop-shadow-md">
              {movie.title || movie.name}
            </h3>
          </div>
        </div>

        {/* Bottom Text Section */}
        <div className="w-full h-[45%] md:h-[35%] flex flex-col justify-center p-1.5 sm:p-3 md:p-4 bg-[#181818]">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 md:mb-2 text-[9px] sm:text-[10px] md:text-xs text-gray-400 font-semibold">
            <span className="text-green-400 font-bold">{Math.round((movie.vote_average || 0) * 10)}% Match</span>
            <span>•</span>
            <span>{year}</span>
            <span>•</span>
            <span className="border border-gray-600 px-1 py-0.5 rounded text-[7px] sm:text-[8px] md:text-[10px]">HD</span>
          </div>
          
          <p className="text-gray-300 text-[9px] sm:text-[10px] md:text-xs lg:text-sm line-clamp-2 leading-tight md:leading-snug">
            {movie.overview}
          </p>
        </div>
        
        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
           <div className="w-10 h-10 md:w-14 md:h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110 shadow-xl">
             <Play className="w-5 h-5 md:w-6 md:h-6 text-black ml-1" fill="currentColor" />
           </div>
        </div>
      </div>

      {isModalOpen && (
        <MovieModal movie={movie} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
