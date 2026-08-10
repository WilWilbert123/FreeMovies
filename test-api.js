import { config } from 'dotenv';
config({ path: '.env.local' });
import axios from 'axios';

async function test() {
  const tmdb = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
    },
  });
  const { data } = await tmdb.get('/tv/95479');
  console.log('Language:', data.original_language);
  console.log('Genres:', data.genres.map(g => g.name).join(', '));
}
test();
