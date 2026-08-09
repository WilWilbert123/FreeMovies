import Billboard from "@/components/Billboard";
import MovieRow from "@/components/MovieRow";
import Navbar from "@/components/Navbar";
import { fetchMovies, requests } from "@/lib/tmdb";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const [
    trending,
    netflixOriginals,
    topRated,
    actionMovies,
    comedyMovies,
    horrorMovies,
    romanceMovies,
    documentaries,
    sciFi,
    animation,
    classics,
    anime,
    kDramas,
    mystery,
    family
  ] = await Promise.all([
    fetchMovies(requests.fetchTrending),
    fetchMovies(requests.fetchNetflixOriginals),
    fetchMovies(requests.fetchTopRated),
    fetchMovies(requests.fetchActionMovies),
    fetchMovies(requests.fetchComedyMovies),
    fetchMovies(requests.fetchHorrorMovies),
    fetchMovies(requests.fetchRomanceMovies),
    fetchMovies(requests.fetchDocumentaries),
    fetchMovies(requests.fetchSciFi),
    fetchMovies(requests.fetchAnimation),
    fetchMovies(requests.fetchClassics),
    fetchMovies(requests.fetchAnime),
    fetchMovies(requests.fetchKDramas),
    fetchMovies(requests.fetchMystery),
    fetchMovies(requests.fetchFamily),
  ]);

  const allTrending = trending.results;
  // Feature the #1 trending movie on the billboard (feels more premium/curated than random)
  const billboardMovie = allTrending[0];

  return (
    <main className="relative min-h-screen bg-netflix-dark pb-20">
      <Navbar />
      <Billboard movie={billboardMovie} />

      <div className="relative z-10 md:mt-[-2rem] lg:mt-[-4rem] pb-20">
        <MovieRow title="Trending Now" movies={allTrending} featuredFirst={true} />
        <MovieRow title="Netflix Originals" movies={netflixOriginals.results} />
        <MovieRow title="Top Rated" movies={topRated.results} featuredFirst={true} />
        <MovieRow title="Action Thrillers" movies={actionMovies.results} />
        <MovieRow title="Comedies" movies={comedyMovies.results} featuredFirst={true} />
        <MovieRow title="Scary Movies" movies={horrorMovies.results} />
        <MovieRow title="Romance" movies={romanceMovies.results} featuredFirst={true} />
        <MovieRow title="Sci-Fi & Fantasy" movies={sciFi.results} />
        <MovieRow title="Animation" movies={animation.results} />
        <MovieRow title="Anime" movies={anime.results} featuredFirst={true} />
        <MovieRow title="K-Dramas" movies={kDramas.results} />
        <MovieRow title="Mystery" movies={mystery.results} featuredFirst={true} />
        <MovieRow title="Family" movies={family.results} />
        <MovieRow title="Classics" movies={classics.results} />
        <MovieRow title="Documentaries" movies={documentaries.results} />
      </div>
    </main>
  );
}
