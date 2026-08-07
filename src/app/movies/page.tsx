import Billboard from "@/components/Billboard";
import MovieRow from "@/components/MovieRow";
import Navbar from "@/components/Navbar";
import { fetchMovies, requests } from "@/lib/tmdb";

export const revalidate = 3600;

export default async function Movies() {
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
    fetchMovies(requests.fetchTrendingMovies),
    fetchMovies(requests.fetchTopRated),
    fetchMovies(requests.fetchActionMovies),
    fetchMovies(requests.fetchComedyMovies),
    fetchMovies(requests.fetchHorrorMovies),
    fetchMovies(requests.fetchRomanceMovies),
    fetchMovies(requests.fetchDocumentaries),
    fetchMovies(requests.fetchSciFi),
    fetchMovies(requests.fetchAnimation),
    fetchMovies(requests.fetchClassics),
    fetchMovies(requests.fetchMystery),
    fetchMovies(requests.fetchFamily),
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
