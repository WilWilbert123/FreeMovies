import { fetchMovies, requests } from './src/lib/tmdb';
async function test() {
  const result = await fetchMovies(requests.fetchAnime, 1, 'PH');
  console.log("Anime endpoint: ", requests.fetchAnime);
  console.log("Results count:", result.results?.length);
  if (result.results?.length > 0) {
    console.log("First item media_type:", result.results[0].media_type);
  }
}
test();
