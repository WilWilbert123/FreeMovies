import { NextRequest, NextResponse } from 'next/server';
import ytSearch from 'yt-search';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const title = searchParams.get('title');
  const type = searchParams.get('type');
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');

  if (!title) {
    return new NextResponse('Missing title', { status: 400 });
  }

  try {
    let query = title;
    if (type === 'tv' && episode) {
      query = `${title} episode ${episode} full`;
    } else if (type === 'movie') {
      query = `${title} full movie`;
    }

    const r = await ytSearch(query);
    const video = r.videos[0];

    if (video && video.videoId) {
      // Redirect to the YouTube embed URL
      return NextResponse.redirect(`https://www.youtube.com/embed/${video.videoId}?autoplay=1`);
    } else {
      return new NextResponse('No video found', { status: 404 });
    }
  } catch (error) {
    console.error('YouTube search error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
