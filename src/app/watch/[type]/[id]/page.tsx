"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "@/lib/tmdb";
import { MovieDetails } from "@/types";
import { use } from "react";

interface WatchPageProps {
  params: Promise<{
    type: string;
    id: string;
  }>;
}

export default function WatchPage(props: WatchPageProps) {
  const router = useRouter();
  const params = use(props.params);
  const { type, id } = params;
  
  const [details, setDetails] = useState<MovieDetails | null>(null);

  useEffect(() => {
    const getDetails = async () => {
      try {
        const data = await fetchMovieDetails(id, type as 'movie' | 'tv');
        setDetails(data);
      } catch (error) {
        console.error("Failed to fetch details", error);
      }
    };
    getDetails();
  }, [id, type]);

  // We are going back to vidsrc.to because it has the content and is not blocked.
  // HOWEVER, we are adding a 'sandbox' attribute to the iframe below to block popups!
  const videoUrl = `https://vidsrc.to/embed/${type}/${id}`;

  return (
    <div className="h-screen w-screen bg-black">
      <nav className="fixed w-full p-4 z-10 flex flex-row items-center gap-8 bg-black/40 hover:bg-black/80 transition-colors duration-300">
        <ArrowLeft
          onClick={() => router.back()}
          className="text-white cursor-pointer w-8 h-8 hover:opacity-80 transition"
        />
        <p className="text-white text-1xl md:text-3xl font-bold">
          <span className="font-light text-gray-300 mr-2">Watching:</span>
          {details?.title || details?.name || "Loading..."}
        </p>
      </nav>

      <div className="w-full h-full pt-16 md:pt-0">
        <iframe
          src={videoUrl}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-forms"
        ></iframe>
      </div>
    </div>
  );
}
