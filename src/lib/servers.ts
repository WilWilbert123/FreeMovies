export type Server = {
  id: string;
  name: string;
  url: (type: string, id: string) => string;
};

export const SERVERS: Server[] = [
  { id: "vidlink", name: "VidLink (Primary)", url: (type: string, id: string) => `https://vidlink.pro/${type}/${id}${type === 'tv' ? '/1/1' : ''}?autoplay=1` },
  { id: "embedsu", name: "Embed.su (Fast, less ads)", url: (type: string, id: string) => `https://embed.su/embed/${type}/${id}${type === 'tv' ? '/1/1' : ''}?autoplay=1` },
  { id: "vidsrc", name: "VidSrc.to", url: (type: string, id: string) => `https://vidsrc.to/embed/${type}/${id}${type === 'tv' ? '/1/1' : ''}?autoplay=1` },
  { id: "vidsrccc", name: "VidSrc.cc", url: (type: string, id: string) => `https://vidsrc.cc/v2/embed/${type}/${id}${type === 'tv' ? '/1/1' : ''}?autoplay=1` },
];
