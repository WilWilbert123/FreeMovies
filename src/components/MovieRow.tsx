"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/types";
import MovieCard from "./MovieCard";
import { cn } from "@/lib/utils";

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

export default function MovieRow({ title, movies }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);

  const handleScroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
          
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
      
      if (direction === "right") setIsMoved(true);
      if (direction === "left" && scrollTo <= 0) setIsMoved(false);
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="space-y-0.5 md:space-y-2 py-4">
      <h2 className="cursor-pointer text-sm font-semibold text-[#e5e5e5] transition duration-200 hover:text-white md:text-2xl px-4 md:px-12">
        {title}
      </h2>
      <div className="group relative md:-ml-2">
        <ChevronLeft
          className={cn(
            "absolute top-0 bottom-0 left-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 bg-black/50 rounded-full text-white",
            !isMoved && "hidden"
          )}
          onClick={() => handleScroll("left")}
        />
        
        <div
          ref={rowRef}
          className="flex items-center space-x-2 md:space-x-4 overflow-x-scroll scrollbar-hide px-4 md:px-12 pb-24 pt-12"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
        
        <ChevronRight
          className="absolute top-0 bottom-0 right-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 bg-black/50 rounded-full text-white"
          onClick={() => handleScroll("right")}
        />
      </div>
    </div>
  );
}
