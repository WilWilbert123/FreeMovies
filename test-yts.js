import ytSearch from 'yt-search';
async function test() {
  const r = await ytSearch('Batang Quiapo Episode 1 full');
  console.log(r.videos[0].videoId);
}
test();
