export type Server = {
  id: string;
  name: string;
  url: (type: string, id: string, season?: number, episode?: number, title?: string) => string;
};

export const SERVERS: Server[] = [
  { id: "filiflix", name: "FiliFlix Fast Server", url: (type: string, id: string, s?: number, e?: number) => type === 'tv' ? `https://autoembed.co/tv/tmdb/${id}-${s || 1}-${e || 1}` : `https://autoembed.co/movie/tmdb/${id}` },
  { id: "vidsrc", name: "FiliFlix Subtitles Server", url: (type: string, id: string, s?: number, e?: number) => type === 'tv' ? `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s || 1}&episode=${e || 1}` : `https://vidsrc.me/embed/movie?tmdb=${id}` },
  { id: "vidlink", name: "FiliFilipino Server (Auto Subtitles)", url: (type: string, id: string, s?: number, e?: number) => `https://vidlink.pro/${type}/${id}${type === 'tv' ? `/${s || 1}/${e || 1}` : ''}?autoplay=1` },
  { id: "multiembed", name: "FiliAnime Server", url: (type: string, id: string, s?: number, e?: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1${type === 'tv' ? `&s=${s || 1}&e=${e || 1}` : ''}` },
  { id: "youtube", name: "FiliYouTube Server", url: (type: string, id: string, s?: number, e?: number, title?: string) => `/api/youtube?title=${encodeURIComponent(title || '')}&type=${type}${type === 'tv' ? `&season=${s || 1}&episode=${e || 1}` : ''}` }
];
