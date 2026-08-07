"use client";

import Navbar from "@/components/Navbar";
import { useUserStore } from "@/store/useUserStore";
import MovieCard from "@/components/MovieCard";
import { useEffect, useState } from "react";

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
        <h1 className="text-2xl md:text-3xl font-bold mb-8">My List</h1>
        
        {myList.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <h3 className="text-xl">Your list is empty.</h3>
            <p className="mt-2">Add movies and TV shows to your list to keep track of what you want to watch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {myList.map((movie) => (
              <div key={movie.id} className="relative w-full aspect-video">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
