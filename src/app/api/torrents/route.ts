import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const tmdbId = searchParams.get('tmdbId');
  const title = searchParams.get('title');
  const type = searchParams.get('type');
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');

  if (!tmdbId && !title) {
    return NextResponse.json({ error: 'Missing tmdbId or title' }, { status: 400 });
  }

  try {
    let imdbId = null;
    let movieTitle = null;

    if (tmdbId) {
      const TMDB_API_KEY = "623dda0cc4da081a282aa7705c4994cb";
      const tmdbRes = await fetch(`https://api.tmdb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
      
      if (tmdbRes.ok) {
        const tmdbData = await tmdbRes.json();
        imdbId = tmdbData.imdb_id;
        movieTitle = tmdbData.title || tmdbData.original_title;
      }
    }

    // Try multiple YTS mirrors in case the primary is blocked by ISP
    if (imdbId) {
      const mirrors = [
        `https://yts.mx/api/v2/movie_details.json?imdb_id=${imdbId}`,
        `https://yts.rs/api/v2/movie_details.json?imdb_id=${imdbId}`,
        `https://yts.do/api/v2/movie_details.json?imdb_id=${imdbId}`
      ];

      let ytsData = null;

      for (const mirror of mirrors) {
        try {
          const ytsRes = await fetch(mirror, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          if (ytsRes.ok) {
            const data = await ytsRes.json();
            if (data.status === 'ok') {
              ytsData = data;
              break; // Found a working mirror
            }
          }
        } catch (err) {
          // Ignore and try next mirror
          continue;
        }
      }

      if (ytsData && ytsData.status === 'ok' && ytsData.data.movie && ytsData.data.movie.torrents && ytsData.data.movie.torrents.length > 0) {
        return NextResponse.json({ torrents: ytsData.data.movie.torrents });
      }
    }

    // FALLBACK: If YTS is completely blocked, down, or missing movie, fallback to APIBay (The Pirate Bay)
    const baseTitle = title || movieTitle;
    const cleanTitle = baseTitle ? baseTitle.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim() : null;
    
    const queriesToTry: string[] = [];
    
    if (type === 'tv' || type === 'episode') {
      const s = season ? season.toString().padStart(2, '0') : '01';
      const e = episode ? episode.toString().padStart(2, '0') : '01';
      if (cleanTitle) {
        queriesToTry.push(`${cleanTitle} S${s}E${e}`);
        queriesToTry.push(`${cleanTitle} S${s}`);
        queriesToTry.push(cleanTitle);
      }
    } else {
      if (imdbId) queriesToTry.push(imdbId);
      if (cleanTitle) queriesToTry.push(cleanTitle);
    }

    for (const q of queriesToTry) {
      if (!q) continue;
      
      const apibayQuery = encodeURIComponent(q);
      try {
        const apibayRes = await fetch(`https://apibay.org/q.php?q=${apibayQuery}`);
        if (apibayRes.ok) {
          const apibayData = await apibayRes.json();
          
          if (Array.isArray(apibayData) && apibayData[0].id !== "0") {
            let mappedTorrents = apibayData
              .map((t: any) => {
                let quality = "SD";
                if (t.name.toLowerCase().includes('2160p') || t.name.toLowerCase().includes('4k')) quality = "2160p";
                else if (t.name.toLowerCase().includes('1080p')) quality = "1080p";
                else if (t.name.toLowerCase().includes('720p')) quality = "720p";
                else if (t.name.toLowerCase().includes('hdtv') || t.name.toLowerCase().includes('web')) quality = "HD";

                const bytes = parseInt(t.size);
                const sizeStr = bytes > 1024 * 1024 * 1024 
                  ? (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB" 
                  : (bytes / (1024 * 1024)).toFixed(2) + " MB";
                
                return {
                  url: `magnet:?xt=urn:btih:${t.info_hash}&dn=${encodeURIComponent(t.name)}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce`,
                  hash: t.info_hash,
                  quality: quality,
                  type: "magnet",
                  seeds: parseInt(t.seeders),
                  peers: parseInt(t.leechers),
                  size: sizeStr
                };
              });

            mappedTorrents.sort((a, b) => b.seeds - a.seeds);

            if (mappedTorrents.length > 0) {
              const uniqueQualities: string[] = [];
              const finalTorrents = [];
              for (const t of mappedTorrents) {
                if (!uniqueQualities.includes(t.quality)) {
                  uniqueQualities.push(t.quality);
                  finalTorrents.push(t);
                }
              }
              return NextResponse.json({ torrents: finalTorrents });
            }
          }
        }
      } catch (err) {
        console.error(`APIBay fallback failed for query ${q}:`, err);
      }
    }

    return NextResponse.json({ error: "Movie not found in torrent index." }, { status: 404 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
