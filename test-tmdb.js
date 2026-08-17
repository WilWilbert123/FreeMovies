import axios from 'axios';
const API_KEY = '5db77a72d377038baef6874457e5d836';
async function test() {
  const { data } = await axios.get(`https://api.themoviedb.org/3/discover/tv?with_genres=16&with_original_language=ja&with_origin_country=PH&api_key=${API_KEY}`);
  console.log('Results length:', data.results.length);
  console.log('First result media_type:', data.results[0]?.media_type);
}
test();
