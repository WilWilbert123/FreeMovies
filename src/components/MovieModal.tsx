"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Plus, Check, ThumbsUp, Star } from "lucide-react";
import { DownloadButton } from "./DownloadButton";
import { TorrentDownloadModal } from "./TorrentDownloadModal";
import { Movie, MovieDetails } from "@/types";
import { fetchMovieDetails, fetchTVSeason, getImageUrl } from "@/lib/tmdb";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const { addToList, removeFromList, isInList } = useUserStore();
  
  // TV Show specific state
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [downloadEpisode, setDownloadEpisode] = useState<{season: number, episode: number} | null>(null);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);

  const isSaved = isInList(movie.id);

  useEffect(() => {
    const getDetails = async () => {
      try {
        const data = await fetchMovieDetails(movie.id, (movie.media_type as any) || 'movie');
        setDetails(data);
        if (movie.media_type === 'tv' && data.seasons && data.seasons.length > 0) {
          const validSeasons = data.seasons.filter((s: any) => s.season_number > 0);
          if (validSeasons.length > 0) {
            setSelectedSeason(validSeasons[0].season_number);
          }
        }
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

  useEffect(() => {
    if (movie.media_type !== 'tv' || !selectedSeason) return;
    
    const getEpisodes = async () => {
      setEpisodesLoading(true);
      try {
        const seasonData = await fetchTVSeason(movie.id, selectedSeason);
        setEpisodes(seasonData.episodes || []);
      } catch (error) {
        console.error("Error fetching season episodes", error);
      } finally {
        setEpisodesLoading(false);
      }
    };

    getEpisodes();
  }, [movie.id, selectedSeason, movie.media_type]);

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
                  <DownloadButton
                    title={movie.title || movie.name || 'Movie'}
                    type={movie.media_type === 'tv' ? 'episode' : 'movie'}
                    id={movie.id.toString()}
                    onClick={() => {
                      setDownloadEpisode(null);
                      setIsDownloadModalOpen(true);
                    }}
                  />
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

              {/* TV Show Episodes Section */}
              {movie.media_type === 'tv' && details?.seasons && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl md:text-2xl font-bold text-white">Episodes</h3>
                    <select
                      className="bg-[#222] text-white border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-green-500 transition cursor-pointer"
                      value={selectedSeason}
                      onChange={(e) => {
                        setSelectedSeason(Number(e.target.value));
                        setShowAllEpisodes(false); // Reset to 3 episodes on season change
                      }}
                    >
                      {details.seasons.filter((s: any) => s.season_number > 0).map((s: any) => (
                        <option key={s.season_number} value={s.season_number}>
                          Season {s.season_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {episodesLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    ) : episodes.length > 0 ? (
                      <>
                        {(showAllEpisodes ? episodes : episodes.slice(0, 3)).map((ep: any) => (
                          <div key={ep.id} className="flex gap-4 p-4 bg-[#222] rounded-lg border border-gray-800 hover:bg-[#2a2a2a] transition relative group">
                            {/* Top right download button */}
                            <div className="absolute top-4 right-4 z-10 md:opacity-0 md:group-hover:opacity-100 transition duration-200">
                              <DownloadButton
                                title={ep.name}
                                type="episode"
                                id={ep.id.toString()}
                                onClick={() => {
                                  setDownloadEpisode({ season: selectedSeason, episode: ep.episode_number });
                                  setIsDownloadModalOpen(true);
                                }}
                              />
                            </div>

                            <div className="w-32 md:w-40 shrink-0 aspect-video rounded overflow-hidden bg-black flex-shrink-0 relative">
                              {ep.still_path ? (
                                <img src={getImageUrl(ep.still_path, 'w500')} alt={ep.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                              )}
                              <div className="absolute bottom-1 left-1 bg-black/80 px-1 rounded text-[10px] text-white font-bold">
                                E{ep.episode_number}
                              </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-center pr-12 md:pr-16">
                              <h4 className="text-white font-bold text-sm md:text-base line-clamp-1">{ep.name}</h4>
                              <p className="text-gray-400 text-xs md:text-sm mt-1 line-clamp-2 md:line-clamp-3">
                                {ep.overview || "No description available."}
                              </p>
                              <span className="text-gray-500 text-xs mt-2">{ep.runtime ? `${ep.runtime}m` : ''}</span>
                            </div>
                          </div>
                        ))}
                        {episodes.length > 3 && (
                          <button
                            onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                            className="w-full py-3 mt-2 rounded-lg border border-gray-700 bg-[#222] hover:bg-[#2a2a2a] text-white font-semibold transition shadow-md"
                          >
                            {showAllEpisodes ? "Show Less" : "Show All"}
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 py-4">No episodes found for this season.</p>
                    )}
                  </div>
                </div>
              )}

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
        <TorrentDownloadModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          tmdbId={movie.id}
          title={movie.title || movie.name || 'Movie'}
          type={movie.media_type === 'tv' ? 'episode' : 'movie'}
          year={new Date(movie.release_date || movie.first_air_date || '').getFullYear().toString()}
          defaultSeason={downloadEpisode?.season}
          defaultEpisode={downloadEpisode?.episode}
          hideSelectors={!!downloadEpisode}
        />
      </div>
    </AnimatePresence>
  );

  if (!mounted) return null;

  const { createPortal } = require('react-dom');
  return createPortal(modalContent, document.body);
}
