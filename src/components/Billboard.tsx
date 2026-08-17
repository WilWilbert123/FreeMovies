"use client";

import { Movie } from "@/types";
import { getImageUrl } from "@/lib/tmdb";
import { Play, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import MovieModal from "./MovieModal";

interface BillboardProps {
  movie: Movie;
}

export default function Billboard({ movie }: BillboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!movie) return <div className="h-[56.25vw] bg-netflix-dark w-full"></div>;

  return (
    <>
      <div className="relative h-[56.25vw] max-h-[85vh] w-full">
        <div className="absolute w-full h-full">
          <img
            src={getImageUrl(movie.backdrop_path, 'original', movie.title || movie.name)}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover brightness-[60%]"
          />
          {/* Gradient Overlay for seamless transition to rows */}
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-transparent to-transparent bottom-0" />
        </div>
        
        <div className="absolute top-[30%] md:top-[40%] ml-4 md:ml-12 max-w-xl">
          <h1 className="text-white text-2xl md:text-5xl lg:text-6xl font-bold mb-4 text-shadow-md">
            {movie.title || movie.name || movie.original_name}
          </h1>
          <p className="text-white text-[10px] md:text-lg w-[90%] md:w-[80%] lg:w-[100%] mb-8 text-shadow drop-shadow-xl line-clamp-3 md:line-clamp-4">
            {movie.overview}
          </p>
          
          <div className="flex flex-row items-center gap-3">
            <Link 
              href={`/watch/${movie.media_type || 'movie'}/${movie.id}`}
              className="bg-white text-black bg-opacity-100 rounded-md py-1 md:py-2 px-2 md:px-4 w-auto text-xs lg:text-lg font-semibold flex flex-row items-center hover:bg-opacity-80 transition"
            >
              <Play className="w-4 h-4 md:w-6 md:h-6 mr-1" fill="currentColor" />
              Play
            </Link>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gray-500 text-white bg-opacity-70 rounded-md py-1 md:py-2 px-2 md:px-4 w-auto text-xs lg:text-lg font-semibold flex flex-row items-center hover:bg-opacity-50 transition"
            >
              <Info className="w-4 h-4 md:w-6 md:h-6 mr-1" />
              More Info
            </button>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <MovieModal 
          movie={movie} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
