async function test() {
  const mirrors = ['yts.mx', 'yts.rs', 'yts.do', 'yts.pm', 'yts.am', 'yts.ag', 'yify.is', 'yts.unblockit.cat'];
  for (const host of mirrors) {
    try {
      const res = await fetch(`https://${host}/api/v2/movie_details.json?imdb_id=tt1375666`, {
        signal: AbortSignal.timeout(3000),
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const text = await res.text();
      if (text.includes('"status": "ok"')) {
        console.log(`SUCCESS: ${host}`);
      } else {
        console.log(`FAILED JSON/HTML: ${host}`);
      }
    } catch(e) {
      console.log(`ERROR: ${host} - ${e.message}`);
    }
  }
}
test();
