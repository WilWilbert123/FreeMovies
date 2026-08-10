import { fetchMovies, requests } from './src/lib/tmdb';
async function run() {
  const data = await fetchMovies(requests.fetchAnime, 1, 'PH');
  console.log(data.results[0]);
}
run();
