"use client";

import { Play, ArrowLeft, ListVideo, X, ChevronDown, Server as ServerIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { fetchMovieDetails, fetchTVSeason, getImageUrl } from "@/lib/tmdb";
import { MovieDetails, TVEpisode } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { SERVERS, Server } from "@/lib/servers";

import { useUserStore } from "@/store/useUserStore";

interface WatchPageProps {
  params: Promise<{
    type: string;
    id: string;
  }>;
}

export default function WatchPage(props: WatchPageProps) {
  const router = useRouter();
  const params = use(props.params);
  const { type, id } = params;

  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const globalActiveServer = useUserStore((state) => state.activeServer);
  const setGlobalActiveServer = useUserStore((state) => state.setActiveServer);
  
  // Safely map the stored server back to the actual SERVER object with the url function, or fallback to default
  const mappedServer = SERVERS.find(s => s.id === globalActiveServer?.id) || SERVERS[0];
  const [activeServer, setActiveServer] = useState<Server>(mappedServer);
  
  const supabase = createClient();

  // TV Show State
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [episodes, setEpisodes] = useState<TVEpisode[]>([]);
  const [hasSelectedEpisode, setHasSelectedEpisode] = useState<boolean>(type === 'movie');
  const [showEpisodeSidebar, setShowEpisodeSidebar] = useState(false);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in before allowing them to watch
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const getDetails = async () => {
      try {
        const data = await fetchMovieDetails(id, type as 'movie' | 'tv');
        
        // If the URL has the wrong type, redirect to the correct one
        if (data && data.media_type && data.media_type !== type) {
          router.replace(`/watch/${data.media_type}/${id}`);
          return;
        }

        setDetails(data);
      } catch (error) {
        console.error("Failed to fetch details", error);
      }
    };
    getDetails();
  }, [id, type, isAuthenticated, router]);

  // Keep activeServer in sync if global server changes or if anime/filipino content is detected
  useEffect(() => {
    if (!details) return;
    const isAnime = 
      details.original_language === 'ja' && 
      details.genres?.some(g => g.name === 'Animation' || g.id === 16);
      
    const isFilipino = 
      details.original_language === 'tl' || 
      (details as any).origin_country?.includes('PH');

    let currentMapped = SERVERS.find(s => s.id === globalActiveServer?.id) || SERVERS[0];
    
    // Auto-switch based on content type if they are using a conflicting server
    if (isAnime && currentMapped.id === 'vidlink') {
      // Use FiliAnime for Anime
      currentMapped = SERVERS.find(s => s.id === 'multiembed') || SERVERS[0];
    } else if (isFilipino && currentMapped.id === 'multiembed') {
      // Use FiliFilipo Server for Filipino movies
      currentMapped = SERVERS.find(s => s.id === 'vidlink') || SERVERS[0];
    }
    
    setActiveServer(currentMapped);
  }, [globalActiveServer, details]);

  // Fetch episodes when selectedSeason changes
  useEffect(() => {
    if (type !== 'tv' || !details) return;

    const fetchEpisodes = async () => {
      const seasonData = await fetchTVSeason(id, selectedSeason);
      if (seasonData && seasonData.episodes) {
        setEpisodes(seasonData.episodes);
      } else {
        setEpisodes([]);
      }
    };

    fetchEpisodes();
  }, [id, type, selectedSeason, details]);

  if (isAuthenticated === null) {
    return <div className="h-screen w-screen bg-black flex items-center justify-center text-white">Checking authentication...</div>;
  }

  const handleEpisodeSelect = (episodeNumber: number) => {
    setSelectedEpisode(episodeNumber);
    setHasSelectedEpisode(true);
    setShowEpisodeSidebar(false);
  };

  const tvSeasons = details?.seasons?.filter(s => s.season_number > 0) || [];

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      <nav className="w-full p-3 sm:p-4 z-20 flex flex-row items-center justify-between gap-2 sm:gap-4 bg-[#141414] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <ArrowLeft
            onClick={() => router.back()}
            className="text-white cursor-pointer w-5 h-5 sm:w-6 sm:h-6 shrink-0 hover:opacity-80 transition"
          />
          <div className="flex flex-col overflow-hidden">
            <p className="text-white text-sm sm:text-lg md:text-xl font-bold truncate">
              <span className="hidden sm:inline font-light text-gray-400 mr-2">Watching:</span>
              {details?.title || details?.name || "Loading..."}
            </p>
            {type === 'tv' && hasSelectedEpisode && (
              <p className="text-xs sm:text-sm text-gray-400 truncate">S{selectedSeason} • Ep {selectedEpisode}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Server Selector */}
          <div className="relative">
            <button
              onClick={() => SERVERS.length > 1 && setIsServerDropdownOpen(!isServerDropdownOpen)}
              className={`flex items-center gap-1 sm:gap-2 bg-gray-800 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md transition border border-gray-700 ${SERVERS.length > 1 ? 'hover:bg-gray-700 cursor-pointer' : 'cursor-default'}`}
            >
              <ServerIcon className="w-5 h-5 text-gray-400" />
              <span className="hidden sm:inline text-sm font-bold max-w-[150px] truncate">{activeServer?.name?.replace('Server', '').trim() || "Server"}</span>
              {SERVERS.length > 1 && <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {isServerDropdownOpen && SERVERS.length > 1 && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-md shadow-2xl overflow-hidden z-50">
                <div className="p-2 border-b border-gray-800 bg-black">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Change Server</p>
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {SERVERS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveServer(s);
                        setGlobalActiveServer(s);
                        setIsServerDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition border-b border-gray-800/50 last:border-0 ${activeServer?.id === s.id ? 'text-white font-bold bg-gray-800/80 border-l-2 border-l-red-600' : 'text-gray-400'}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {type === 'tv' && (
            <button
              onClick={() => setShowEpisodeSidebar(!showEpisodeSidebar)}
              className="flex items-center gap-1 sm:gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md transition border border-gray-700"
            >
              <ListVideo className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-bold">Episodes</span>
            </button>
          )}
        </div>
      </nav>

      <div className="w-full flex-1 bg-black relative flex">
        {/* Main Video Area */}
        <div className={`flex-1 relative transition-all duration-300 ${showEpisodeSidebar && hasSelectedEpisode ? 'mr-80 md:mr-[400px]' : ''}`}>
          {!hasSelectedEpisode ? (
            <div className="absolute inset-0 flex flex-col bg-[#141414] overflow-y-auto custom-scrollbar">
              {/* Background Image Overlay */}
              {details?.backdrop_path && (
                <div className="absolute top-0 left-0 w-full h-[70vh] md:h-[90vh] z-0">
                  <img
                    src={getImageUrl(details.backdrop_path, 'original')}
                    alt="Background"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Gradients to blend image into background and text */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent w-[90%]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
                </div>
              )}

              <div className="p-4 md:p-8 max-w-6xl mx-auto w-full relative z-10 mt-32 md:mt-48">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg max-w-4xl tracking-tight">{details?.name}</h1>
                <p className="text-gray-200 mb-8 max-w-2xl md:text-lg font-medium drop-shadow-md line-clamp-4 leading-relaxed">{details?.overview}</p>

                <div className="relative mb-8 z-10">
                  <button
                    onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                    className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md text-sm sm:text-lg font-bold hover:bg-gray-700 transition"
                  >
                    Season {selectedSeason} <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {isSeasonDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                      {tvSeasons.map((season) => (
                        <button
                          key={season.id}
                          onClick={() => {
                            setSelectedSeason(season.season_number);
                            setIsSeasonDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition ${selectedSeason === season.season_number ? 'text-white font-bold bg-gray-800' : 'text-gray-300'}`}
                        >
                          Season {season.season_number}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-20">
                  {episodes.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => handleEpisodeSelect(ep.episode_number)}
                      className="group cursor-pointer bg-gray-900 md:bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800 hover:border-white/40 hover:scale-[1.02] transition-all flex flex-row md:flex-col items-stretch"
                    >
                      <div className="relative w-32 sm:w-40 md:w-full shrink-0 aspect-video bg-gray-800">
                        {ep.still_path ? (
                          <img
                            src={getImageUrl(ep.still_path, 'w500')}
                            alt={ep.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Play className="w-8 h-8 md:w-12 md:h-12 text-white" fill="white" />
                        </div>
                      </div>
                      <div className="p-2 md:p-4 flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-1 md:mb-2">
                          <h3 className="text-white font-bold text-sm md:text-lg line-clamp-1">{ep.episode_number}. {ep.name}</h3>
                          {ep.runtime > 0 && <span className="text-[10px] md:text-xs text-gray-400 shrink-0 ml-2">{ep.runtime}m</span>}
                        </div>
                        <p className="text-[10px] md:text-sm text-gray-400 line-clamp-2 md:line-clamp-3">{ep.overview || "No description available."}</p>
                      </div>
                    </div>
                  ))}
                  {episodes.length === 0 && (
                    <div className="text-gray-400 col-span-full py-10">Loading episodes...</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <iframe
              src={activeServer?.url ? activeServer.url(type, id, selectedSeason, selectedEpisode, details?.title || details?.name) : SERVERS[0].url(type, id, selectedSeason, selectedEpisode, details?.title || details?.name)}
              className="absolute inset-0 w-full h-full border-0 rounded-lg shadow-2xl"
              allowFullScreen
              allow="autoplay; encrypted-media"
            ></iframe>
          )}
        </div>

        {/* Sidebar Overlay for Episodes (When playing) */}
        {hasSelectedEpisode && showEpisodeSidebar && (
          <div className="absolute inset-y-0 right-0 w-80 md:w-[400px] bg-[#141414] border-l border-gray-800 flex flex-col z-10 shadow-2xl transform transition-transform duration-300">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black">
              <h2 className="text-lg font-bold text-white">Episodes</h2>
              <button onClick={() => setShowEpisodeSidebar(false)} className="p-1 hover:bg-gray-800 rounded-full transition">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-800 bg-black/50">
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="w-full appearance-none bg-gray-900 border border-gray-700 text-white py-2 pl-4 pr-10 rounded-md focus:outline-none focus:border-red-600 font-bold"
                >
                  {tvSeasons.map(s => (
                    <option key={s.id} value={s.season_number}>Season {s.season_number}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-[50%] -translate-y-[50%] w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {episodes.map(ep => {
                const isActive = selectedEpisode === ep.episode_number;
                return (
                  <div
                    key={ep.id}
                    onClick={() => handleEpisodeSelect(ep.episode_number)}
                    className={`flex gap-3 p-2 rounded-md cursor-pointer transition ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
                  >
                    <div className="w-32 shrink-0 aspect-video bg-gray-900 relative rounded overflow-hidden">
                      {ep.still_path ? (
                        <img src={getImageUrl(ep.still_path, 'w500')} alt={ep.name} className="w-full h-full object-cover" />
                      ) : null}
                      {isActive && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-red-500 font-bold text-xs bg-black/50 px-2 py-1 rounded">PLAYING</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {ep.episode_number}. {ep.name}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 line-clamp-2">{ep.overview}</span>
                    </div>
                  </div>
                )
              })}
              {episodes.length === 0 && <div className="p-4 text-center text-gray-500">Loading episodes...</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
