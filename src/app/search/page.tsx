"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Search as SearchIcon, X, Clock } from "lucide-react";
import { searchMovies } from "@/lib/tmdb";
import { Movie } from "@/types";
import MovieCard from "@/components/MovieCard";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [history, setHistory] = useState<string[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('searchHistory');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }
  }, []);

  const addToHistory = (term: string) => {
    if (!term.trim()) return;
    
    setHistory(prev => {
      let newHistory = [...prev];
      const existingIndex = newHistory.indexOf(term);
      
      if (existingIndex !== -1) {
        newHistory.splice(existingIndex, 1);
      } else if (newHistory.length > 0) {
        const lastTerm = newHistory[0].toLowerCase();
        const currentTerm = term.toLowerCase();
        // Replace previous partial queries (like "bat" with "batman")
        if (currentTerm.startsWith(lastTerm) || lastTerm.startsWith(currentTerm)) {
          newHistory.shift();
        }
      }
      
      newHistory.unshift(term);
      if (newHistory.length > 50) newHistory.pop(); // keep limit reasonable
      
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const removeFromHistory = (term: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(t => t !== term);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addToHistory(query.trim());
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length > 2) {
        setLoading(true);
        try {
          const data = await searchMovies(query);
          // Filter out people or elements without poster
          const filtered = data.results.filter(
            (item) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
          );
          setResults(filtered);
          if (filtered.length > 0) {
            addToHistory(query.trim());
          }
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    };

    const debounce = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <main className="min-h-screen bg-netflix-dark text-white">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-12">
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mb-8 md:mb-12">
          <SearchIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 md:w-6 md:h-6" />
          <input
            type="text"
            placeholder="Search for movies, TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#333] text-white pl-10 md:pl-14 pr-10 md:pr-12 py-3 md:py-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-lg"
          />
          <button 
            type="button"
            onClick={() => {
              if (query) {
                setQuery('');
              } else {
                router.back();
              }
            }}
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </form>

        {!loading && query.trim().length === 0 && history.length > 0 && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-300">Search History</h2>
              <button 
                type="button"
                onClick={clearHistory}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {(showAllHistory ? history : history.slice(0, 5)).map((term, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-[#333] rounded-md hover:bg-gray-700 transition cursor-pointer" 
                  onClick={() => {
                    setQuery(term);
                    addToHistory(term);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{term}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(term);
                    }}
                    className="p-2 -mr-2 text-gray-400 hover:text-white transition rounded-full hover:bg-gray-600"
                    title="Remove from history"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {history.length > 5 && (
              <div className="mt-4 flex justify-center">
                <button 
                  type="button"
                  onClick={() => setShowAllHistory(!showAllHistory)}
                  className="text-sm text-netflix-red hover:text-red-400 transition font-medium"
                >
                  {showAllHistory ? "Show Less" : "See All Searches"}
                </button>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="flex justify-center mt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-6">Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} layout="grid" />
              ))}
            </div>
          </div>
        )}

        {!loading && query.trim().length > 2 && results.length === 0 && (
          <div className="text-center mt-20 text-gray-400">
            <h3 className="text-xl">No results found for "{query}"</h3>
            <p className="mt-2">Try searching for a different title or keyword.</p>
          </div>
        )}
      </div>
    </main>
  );
}
