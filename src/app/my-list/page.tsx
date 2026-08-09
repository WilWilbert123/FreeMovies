"use client";

import Navbar from "@/components/Navbar";
import { useUserStore } from "@/store/useUserStore";
import MovieCard from "@/components/MovieCard";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function MyListPage() {
  const { myList } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <main className="min-h-screen bg-netflix-dark text-white">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-12 pb-20">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Favorites</h1>
        
        {myList.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <h3 className="text-xl">Your list is empty.</h3>
            <p className="mt-2">Add movies and TV shows to your list to keep track of what you want to watch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
            {myList.map((movie) => (
              <div key={movie.id} className="relative w-full">
                <MovieCard movie={movie} layout="grid" />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    useUserStore.getState().removeFromList(movie.id);
                  }}
                  className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 z-20 bg-black/80 hover:bg-netflix-red p-1.5 md:p-2 rounded-full text-white transition border border-white/20 shadow-xl"
                  title="Remove from list"
                >
                  <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
