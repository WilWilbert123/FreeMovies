import Billboard from "@/components/Billboard";
import MovieRow from "@/components/MovieRow";
import Navbar from "@/components/Navbar";
import { fetchMovies, requests } from "@/lib/tmdb";

export const revalidate = 3600; // Revalidate every hour

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TVShows(props: Props) {
  const searchParams = await props.searchParams;
  const region = typeof searchParams?.region === 'string' ? searchParams.region : 'ALL';

  const [
    trending,
    topRated,
    netflixOriginals,
    comedy,
    anime,
    kDramas
  ] = await Promise.all([
    fetchMovies(requests.fetchTrendingTV, 1, region),
    fetchMovies(requests.fetchTopRatedTV, 1, region),
    fetchMovies(requests.fetchNetflixOriginals, 1, region),
    fetchMovies(requests.fetchComedyTV, 1, region),
    fetchMovies(requests.fetchAnime, 1, region),
    fetchMovies(requests.fetchKDramas, 1, region),
  ]);

  const allTrending = trending.results;
  // Select a random TV show for the billboard
  const billboardMovie = allTrending[Math.floor(Math.random() * allTrending.length)];

  return (
    <main className="relative min-h-screen bg-netflix-dark pb-20">
      <Navbar />
      <Billboard movie={billboardMovie} />
      
      <div className="relative z-10 md:mt-[-2rem] lg:mt-[-4rem] pb-20">
        <MovieRow title="Trending TV Shows" movies={allTrending} />
        <MovieRow title="Top Rated TV" movies={topRated.results} />
        <MovieRow title="Netflix Originals" movies={netflixOriginals.results} />
        <MovieRow title="Comedy TV Shows" movies={comedy.results} />
        <MovieRow title="Anime" movies={anime.results} />
        <MovieRow title="K-Dramas" movies={kDramas.results} />
      </div>
    </main>
  );
}
