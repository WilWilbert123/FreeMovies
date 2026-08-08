import Navbar from "@/components/Navbar";
import { fetchMovies, requests } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

  const data = await fetchMovies(endpoint);
  const movies = data.results || [];

  return (
    <main className="min-h-screen bg-netflix-dark text-white pb-20">
      <Navbar />
      <div className="pt-24 px-4 md:px-12">
        <MovieGrid initialMovies={movies} endpoint={endpoint} title={title} />
      </div>
    </main>
  );
}
