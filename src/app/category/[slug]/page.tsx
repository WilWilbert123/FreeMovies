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
