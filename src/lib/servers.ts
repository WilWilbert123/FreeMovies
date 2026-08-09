export type Server = {
  id: string;
  name: string;
  url: (type: string, id: string, season?: number, episode?: number) => string;
};

export const SERVERS: Server[] = [
  { id: "vidlink", name: "VidLink (Primary)", url: (type: string, id: string, s?: number, e?: number) => `https://vidlink.pro/${type}/${id}${type === 'tv' ? `/${s || 1}/${e || 1}` : ''}?autoplay=1` },
  { id: "embedsu", name: "Embed.su (Fast, less ads)", url: (type: string, id: string, s?: number, e?: number) => `https://embed.su/embed/${type}/${id}${type === 'tv' ? `/${s || 1}/${e || 1}` : ''}?autoplay=1` },
  { id: "vidsrc", name: "VidSrc.to", url: (type: string, id: string, s?: number, e?: number) => `https://vidsrc.to/embed/${type}/${id}${type === 'tv' ? `/${s || 1}/${e || 1}` : ''}?autoplay=1` },
  { id: "vidsrccc", name: "VidSrc.cc", url: (type: string, id: string, s?: number, e?: number) => `https://vidsrc.cc/v2/embed/${type}/${id}${type === 'tv' ? `/${s || 1}/${e || 1}` : ''}?autoplay=1` },
];
