import fetch from 'node-fetch';
const TMDB_API_KEY = '5a4409edf1dbff100df874bbbdc9085d';
async function test() {
  const res = await fetch(`https://api.themoviedb.org/3/movie/611382?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  console.log('Original Language:', data.original_language);
  console.log('Production Countries:', data.production_countries.map(c => c.iso_3166_1));
}
test();
