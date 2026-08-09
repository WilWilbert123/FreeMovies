import { makeProviders, makeStandardFetcher, targets } from '@movie-web/providers';

async function test() {
  const fetcher = makeStandardFetcher(fetch);
  const providers = makeProviders({ 
    fetcher,
    target: targets.ANY
  });

  const media = {
    type: 'movie',
    title: 'Inception',
    releaseYear: 2010,
    tmdbId: '27205',
  };

  console.log('Searching for streams...');
  try {
    const stream = await providers.runAll({
      media: media,
    });
    console.log('Stream found:', stream);
  } catch (err) {
    console.error('Error fetching stream:', err);
  }
}

test();
