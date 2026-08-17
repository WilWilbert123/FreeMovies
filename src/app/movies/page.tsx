import Billboard from "@/components/Billboard";
import MovieRow from "@/components/MovieRow";
import Navbar from "@/components/Navbar";
import { fetchMovies, requests } from "@/lib/tmdb";

export const revalidate = 3600;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Movies(props: Props) {
  const searchParams = await props.searchParams;
  const region = typeof searchParams?.region === 'string' ? searchParams.region : 'ALL';

  const [
    trending,
    topRated,
    actionMovies,
    comedyMovies,
    horrorMovies,
    romanceMovies,
    documentaries,
    sciFi,
    animation,
    classics,
    mystery,
    family
  ] = await Promise.all([
    fetchMovies(requests.fetchTrendingMovies, 1, region),
    fetchMovies(requests.fetchTopRated, 1, region),
    fetchMovies(requests.fetchActionMovies, 1, region),
    fetchMovies(requests.fetchComedyMovies, 1, region),
    fetchMovies(requests.fetchHorrorMovies, 1, region),
    fetchMovies(requests.fetchRomanceMovies, 1, region),
    fetchMovies(requests.fetchDocumentaries, 1, region),
    fetchMovies(requests.fetchSciFi, 1, region),
    fetchMovies(requests.fetchAnimation, 1, region),
    fetchMovies(requests.fetchClassics, 1, region),
    fetchMovies(requests.fetchMystery, 1, region),
    fetchMovies(requests.fetchFamily, 1, region),
  ]);

  const allTrending = trending.results;
  const billboardMovie = allTrending[Math.floor(Math.random() * allTrending.length)];

  return (
    <main className="relative min-h-screen bg-netflix-dark pb-20">
      <Navbar />
      <Billboard movie={billboardMovie} />
      
      <div className="relative z-10 md:mt-[-2rem] lg:mt-[-4rem] pb-20">
        <MovieRow title="Trending Movies" movies={allTrending} />
        <MovieRow title="Top Rated" movies={topRated.results} />
        <MovieRow title="Action Thrillers" movies={actionMovies.results} />
        <MovieRow title="Comedies" movies={comedyMovies.results} />
        <MovieRow title="Scary Movies" movies={horrorMovies.results} />
        <MovieRow title="Romance" movies={romanceMovies.results} />
        <MovieRow title="Sci-Fi & Fantasy" movies={sciFi.results} />
        <MovieRow title="Animation" movies={animation.results} />
        <MovieRow title="Mystery" movies={mystery.results} />
        <MovieRow title="Family" movies={family.results} />
        <MovieRow title="Classics" movies={classics.results} />
        <MovieRow title="Documentaries" movies={documentaries.results} />
      </div>
    </main>
  );
}
