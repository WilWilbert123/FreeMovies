import Billboard from "@/components/Billboard";
import MovieRow from "@/components/MovieRow";
import Navbar from "@/components/Navbar";
import { fetchMovies, requests } from "@/lib/tmdb";

export const revalidate = 3600;

export default async function NewAndPopular() {
  const [
    trending,
    trendingMovies,
    trendingTV,
    upcomingMovies
  ] = await Promise.all([
    fetchMovies(requests.fetchTrending),
    fetchMovies(requests.fetchTrendingMovies),
    fetchMovies(requests.fetchTrendingTV),
    fetchMovies(requests.fetchUpcomingMovies),
  ]);

  const allTrending = trending.results;
  const billboardMovie = allTrending[0]; // the most trending item

  return (
    <main className="relative min-h-screen bg-netflix-dark pb-20">
      <Navbar />
      <Billboard movie={billboardMovie} />
      
      <div className="relative z-10 md:mt-[-2rem] lg:mt-[-4rem] pb-20">
        <MovieRow title="Top 10 Today" movies={allTrending.slice(0, 10)} />
        <MovieRow title="Upcoming Movies" movies={upcomingMovies.results} />
        <MovieRow title="Trending Movies" movies={trendingMovies.results} />
        <MovieRow title="Trending TV Shows" movies={trendingTV.results} />
      </div>
    </main>
  );
}
