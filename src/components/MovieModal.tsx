"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Plus, Check, ThumbsUp, Star } from "lucide-react";
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
          className="relative w-full h-full md:h-auto max-w-3xl md:max-h-[90vh] bg-[#181818] md:rounded-xl overflow-hidden shadow-2xl z-10 flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[60] p-2 bg-black/50 hover:bg-black/80 rounded-full transition text-white border border-white/20 shadow-lg backdrop-blur-md"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Scrollable Content */}
          <div className="overflow-y-auto scrollbar-hide w-full h-full">
            {/* Header Image / Trailer Fallback */}
            <div className="relative w-full h-[40vh] sm:h-[50vh] shrink-0">
              <img
                src={getImageUrl(movie.backdrop_path || movie.poster_path, 'original')}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />
              
              {/* Title, Rating & Controls */}
              <div className="absolute bottom-6 left-6 flex flex-col gap-4 w-[90%] md:w-[70%]">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2 line-clamp-2">
                    {movie.title || movie.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                    <span className="text-white text-sm md:text-base font-bold tracking-wider drop-shadow-md">
                      {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
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
            </div>

            {/* Movie Details */}
            <div className="p-6 md:p-12 flex flex-col gap-10">
              {/* Top Details (Overview & Genres) */}
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-green-400 font-bold text-lg">
                      {Math.round((movie.vote_average || 0) * 10)}% Match
                    </span>
                    <span className="text-gray-300 font-semibold">
                      {new Date(movie.release_date || movie.first_air_date || '').getFullYear()}
                    </span>
                    {details?.runtime && (
                      <span className="text-gray-300 font-semibold">
                        {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                      </span>
                    )}
                    <span className="border border-gray-500 px-1.5 py-0.5 rounded text-xs text-white font-bold">
                      HD
                    </span>
                  </div>
                  
                  <p className="text-white text-base md:text-lg leading-relaxed">
                    {movie.overview}
                  </p>
                </div>
                
                <div className="w-full md:w-1/3 flex flex-col gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Genres: </span>
                    <span className="text-white">
                      {details?.genres?.map(g => g.name).join(', ') || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Director: </span>
                    <span className="text-white">
                      {details?.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cast Slider */}
              {details?.credits?.cast && details.credits.cast.length > 0 && (
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Cast</h3>
                  <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6 md:-mx-12 md:px-12 snap-x">
                    {details.credits.cast.slice(0, 15).map((actor) => (
                      <div key={actor.id} className="flex flex-col items-center flex-shrink-0 w-20 md:w-24 snap-start">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 bg-[#222] shadow-lg border-2 border-transparent hover:border-white transition-all duration-300">
                          <img 
                            src={getImageUrl(actor.profile_path, 'w500')} 
                            alt={actor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-white text-xs md:text-sm font-bold text-center line-clamp-1 w-full">{actor.name}</span>
                        <span className="text-gray-400 text-[10px] md:text-xs text-center line-clamp-1 w-full">{actor.character}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Movies */}
              {details?.similar?.results && details.similar.results.length > 0 && (
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-6">More Like This</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {details.similar.results.slice(0, 9).map((simMovie) => (
                      <Link href={`/watch/${movie.media_type || 'movie'}/${simMovie.id}`} key={simMovie.id}>
                        <div className="bg-[#2f2f2f] rounded-lg overflow-hidden hover:scale-[1.02] transition duration-300 cursor-pointer h-full flex flex-col shadow-lg">
                          <div className="relative aspect-square">
                            <img 
                              src={getImageUrl(simMovie.backdrop_path || simMovie.poster_path, 'w500')}
                              alt={simMovie.title || simMovie.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-white text-[10px] font-bold">
                                {simMovie.vote_average ? simMovie.vote_average.toFixed(1) : "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div className="mb-2">
                              <h4 className="text-white text-sm md:text-base font-bold line-clamp-2">{simMovie.title || simMovie.name}</h4>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-green-400 text-xs font-bold">{Math.round((simMovie.vote_average || 0) * 10)}% Match</span>
                              <span className="text-gray-300 text-[10px] border border-gray-500 px-1.5 py-0.5 rounded">HD</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
