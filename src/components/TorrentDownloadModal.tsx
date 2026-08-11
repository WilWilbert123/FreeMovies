"use client";

import React, { useEffect, useState } from "react";
import { X, Download, AlertCircle, Loader2 } from "lucide-react";

interface TorrentDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  tmdbId: number;
  title: string;
  type: string; // 'movie' or 'tv' or 'episode'
  year: string;
  defaultSeason?: number;
  defaultEpisode?: number;
  hideSelectors?: boolean;
}

interface YtsTorrent {
  url: string;
  hash: string;
  quality: string;
  type: string;
  seeds: number;
  peers: number;
  size: string;
  size_bytes: number;
  date_uploaded: string;
  date_uploaded_unix: number;
}

export const TorrentDownloadModal: React.FC<TorrentDownloadModalProps> = ({
  isOpen,
  onClose,
  tmdbId,
  title,
  type,
  year,
  defaultSeason,
  defaultEpisode,
  hideSelectors,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torrents, setTorrents] = useState<YtsTorrent[]>([]);
  
  // TV Show State
  const [seasons, setSeasons] = useState<{ season_number: number; episode_count: number }[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(defaultSeason || 1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(defaultEpisode || 1);
  const [fetchingSeasons, setFetchingSeasons] = useState(false);

  // Sync state if default props change while open
  useEffect(() => {
    if (defaultSeason) setSelectedSeason(defaultSeason);
    if (defaultEpisode) setSelectedEpisode(defaultEpisode);
  }, [defaultSeason, defaultEpisode]);

  // Fetch TV seasons when modal opens (only if we need them)
  useEffect(() => {
    if (!isOpen || type !== 'tv' || hideSelectors) return;
    
    const fetchTVDetails = async () => {
      setFetchingSeasons(true);
      try {
        const TMDB_API_KEY = "623dda0cc4da081a282aa7705c4994cb";
        const res = await fetch(`https://api.tmdb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`);
        if (res.ok) {
          const data = await res.json();
          if (data.seasons) {
            // Filter out specials (season 0) if desired, but let's keep it simple
            const validSeasons = data.seasons.filter((s: any) => s.season_number > 0);
            setSeasons(validSeasons);
            if (validSeasons.length > 0 && !defaultSeason) {
              setSelectedSeason(validSeasons[0].season_number);
              setSelectedEpisode(1);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch seasons:", err);
      } finally {
        setFetchingSeasons(false);
      }
    };
    
    fetchTVDetails();
  }, [isOpen, tmdbId, type, hideSelectors, defaultSeason]);

  useEffect(() => {
    if (!isOpen) return;
    if (type === 'tv' && seasons.length === 0 && !hideSelectors) return; // Wait for seasons to load

    // Reset state
    setLoading(true);
    setError(null);
    setTorrents([]);

    const fetchTorrents = async () => {
      try {
        let url = `/api/torrents?tmdbId=${tmdbId}`;
        
        if (type === 'tv' || type === 'episode') {
          // Format query like "Breaking Bad S01E01"
          const query = `${title} S${selectedSeason.toString().padStart(2, '0')}E${selectedEpisode.toString().padStart(2, '0')}`;
          url = `/api/torrents?query=${encodeURIComponent(query)}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch torrents.");
        }

        setTorrents(data.torrents);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchTorrents();
  }, [isOpen, tmdbId, type, title, selectedSeason, selectedEpisode, seasons.length, hideSelectors]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#141414] border border-gray-800 rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Download Options</h2>
          <button
            onClick={onClose}
            className="p-2 bg-[#181818] rounded-full hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-1">
              {title} {type === 'tv' || type === 'episode' ? `- S${selectedSeason.toString().padStart(2, '0')}E${selectedEpisode.toString().padStart(2, '0')}` : ''}
            </h3>
            {year && <p className="text-gray-400 text-sm">{year}</p>}
          </div>

          {type === 'tv' && !hideSelectors && seasons.length > 0 && (
            <div className="flex gap-4 mb-6 bg-[#181818] p-3 rounded-lg border border-gray-800">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Season</label>
                <select
                  className="w-full bg-[#222] text-white border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-green-500 transition cursor-pointer"
                  value={selectedSeason}
                  onChange={(e) => {
                    setSelectedSeason(Number(e.target.value));
                    setSelectedEpisode(1);
                  }}
                  disabled={loading || fetchingSeasons}
                >
                  {seasons.map(s => (
                    <option key={s.season_number} value={s.season_number}>Season {s.season_number}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Episode</label>
                <select
                  className="w-full bg-[#222] text-white border border-gray-700 rounded p-2 text-sm focus:outline-none focus:border-green-500 transition cursor-pointer"
                  value={selectedEpisode}
                  onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                  disabled={loading || fetchingSeasons}
                >
                  {Array.from({ length: seasons.find(s => s.season_number === selectedSeason)?.episode_count || 1 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>Episode {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {loading || fetchingSeasons ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
              <p className="text-gray-400">Searching for high-quality torrents...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex flex-col items-center text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {torrents.map((torrent, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    
                    if (torrent.url.startsWith('magnet:')) {
                      // Open webtor.io in a new tab for seamless browser streaming/downloading
                      const webtorUrl = `https://webtor.io/show?magnet=${encodeURIComponent(torrent.url)}`;
                      window.open(webtorUrl, '_blank');
                    } else {
                      window.location.href = torrent.url;
                    }
                  }}
                  className="w-full flex items-center justify-between p-4 bg-[#181818] border border-gray-700 rounded-lg hover:border-white transition group cursor-pointer text-left"
                >
                  <div className="flex flex-col">
                    <span className="text-white font-semibold group-hover:text-green-400 transition">
                      {torrent.quality} {torrent.type.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-xs mt-1">
                      {torrent.size} • S: {torrent.seeds} / P: {torrent.peers}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-green-500/20 transition shrink-0">
                    <Download className="w-5 h-5 text-white group-hover:text-green-400 transition" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
