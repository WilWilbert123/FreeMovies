import fetch from 'node-fetch';
const TMDB_API_KEY = '5a4409edf1dbff100df874bbbdc9085d';
async function test() {
  const res = await fetch(`https://api.themoviedb.org/3/tv/215803?api_key=${TMDB_API_KEY}&append_to_response=videos`);
  const data = await res.json();
  console.log(data.videos.results);
}
test();
