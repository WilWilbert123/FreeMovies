"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "@/lib/tmdb";
import { MovieDetails } from "@/types";
import { use } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Check if user is logged in before allowing them to watch
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return; // Don't fetch if not logged in

    const getDetails = async () => {
      try {
        const data = await fetchMovieDetails(id, type as 'movie' | 'tv');
        setDetails(data);
      } catch (error) {
        console.error("Failed to fetch details", error);
      }
    };
    getDetails();
  }, [id, type, isAuthenticated]);

  if (isAuthenticated === null) {
    return <div className="h-screen w-screen bg-black flex items-center justify-center text-white">Checking authentication...</div>;
  }

  // We are using vidsrc.to because it has the content and is not blocked.
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
        ></iframe>
      </div>
    </div>
  );
}
