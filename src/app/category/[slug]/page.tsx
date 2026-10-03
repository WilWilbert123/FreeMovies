import Navbar from "@/components/Navbar";
import { fetchMovies, requests } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const region = typeof resolvedSearchParams?.region === 'string' ? resolvedSearchParams.region : 'ALL';
  
  let endpoint = "";
  let title = "";

  switch (slug) {
    case 'netflix':
      endpoint = requests.fetchNetflixOriginals;
      title = 'Netflix Originals & Hits';
      break;
    case 'disney':
      endpoint = requests.fetchDisneyOriginals;
      title = 'Disney+ Originals & Favorites';
      break;
    case 'vivamax':
      endpoint = requests.fetchVivaMax;
      title = 'VivaMax & Pinoy Movies';
      break;
    case 'hbo':
      endpoint = requests.fetchHBOOriginals;
      title = 'HBO Max & HBO Originals';
      break;
    case 'apple':
      endpoint = requests.fetchAppleTV;
      title = 'Apple TV+ Originals';
      break;
    case 'prime':
      endpoint = requests.fetchPrimeVideo;
      title = 'Prime Video Originals & Movies';
      break;
    case 'paramount':
      endpoint = requests.fetchParamount;
      title = 'Paramount+ Movies & Shows';
      break;
    case 'hulu':
      endpoint = requests.fetchHulu;
      title = 'Hulu Originals & Hits';
      break;
    case 'viu':
      endpoint = requests.fetchViu;
      title = 'Viu Asian Hits & Dramas';
      break;
    case 'marvel':
      endpoint = requests.fetchMarvel;
      title = 'Marvel Cinematic Universe';
      break;
    case 'starwars':
      endpoint = requests.fetchStarWars;
      title = 'Star Wars Collection';
      break;
    case 'dc':
      endpoint = requests.fetchDC;
      title = 'DC Universe';
      break;
    case 'horror':
      endpoint = requests.fetchHorrorMovies;
      title = 'Horror & Suspense';
      break;
    case 'anime':
      endpoint = requests.fetchAnime;
      title = 'Anime';
      break;
    case 'k-dramas':
      endpoint = requests.fetchKDramas;
      title = 'K-Dramas';
      break;
    case 'mystery':
      endpoint = requests.fetchMystery;
      title = 'Mystery';
      break;
    case 'family':
      endpoint = requests.fetchFamily;
      title = 'Family';
      break;
    case 'action':
      endpoint = requests.fetchActionMovies;
      title = 'Action';
      break;
    case 'comedy':
      endpoint = requests.fetchComedyMovies;
      title = 'Comedy';
      break;
    case 'scifi':
      endpoint = requests.fetchSciFi;
      title = 'Sci-Fi & Fantasy';
      break;
    case 'documentaries':
      endpoint = requests.fetchDocumentaries;
      title = 'Documentaries';
      break;
    default:
      endpoint = requests.fetchTrending;
      title = 'Trending';
  }

  const data = await fetchMovies(endpoint, 1, region);
  const movies = data.results || [];

  return (
    <main className="min-h-screen bg-netflix-dark text-white pb-20">
      <Navbar />
      <div className="pt-24 px-4 md:px-12">
        <MovieGrid initialMovies={movies} endpoint={endpoint} title={title} region={region} />
      </div>
    </main>
  );
}
