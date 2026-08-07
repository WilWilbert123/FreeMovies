import Billboard from "@/components/Billboard";
import MovieRow from "@/components/MovieRow";
import Navbar from "@/components/Navbar";
import { fetchMovies, requests } from "@/lib/tmdb";

export const revalidate = 3600; // Revalidate every hour

export default async function TVShows() {
  const [
    trending,
    topRated,
    netflixOriginals,
    comedy
  ] = await Promise.all([
    fetchMovies(requests.fetchTrendingTV),
    fetchMovies(requests.fetchTopRatedTV),
    fetchMovies(requests.fetchNetflixOriginals),
    fetchMovies(requests.fetchComedyTV),
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
      </div>
    </main>
  );
}
