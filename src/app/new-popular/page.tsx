import Billboard from "@/components/Billboard";
import MovieRow from "@/components/MovieRow";
import Navbar from "@/components/Navbar";
import { fetchMovies, requests } from "@/lib/tmdb";

export const revalidate = 3600;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function NewAndPopular(props: Props) {
  const searchParams = await props.searchParams;
  const region = typeof searchParams?.region === 'string' ? searchParams.region : 'ALL';

  const [
    trending,
    trendingMovies,
    trendingTV,
    upcomingMovies
  ] = await Promise.all([
    fetchMovies(requests.fetchTrending, 1, region),
    fetchMovies(requests.fetchTrendingMovies, 1, region),
    fetchMovies(requests.fetchTrendingTV, 1, region),
    fetchMovies(requests.fetchUpcomingMovies, 1, region),
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
