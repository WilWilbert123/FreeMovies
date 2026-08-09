"use client";

import { ArrowLeft, Server } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { fetchMovieDetails } from "@/lib/tmdb";
import { MovieDetails } from "@/types";
import { createClient } from "@/lib/supabase/client";

import { useUserStore } from "@/store/useUserStore";

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
  const activeServer = useUserStore((state) => state.activeServer);
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
    if (!isAuthenticated) return;

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

  return (
    <div className="h-screen w-screen bg-black flex flex-col">
      <nav className="w-full p-4 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141414] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <ArrowLeft
            onClick={() => router.back()}
            className="text-white cursor-pointer w-6 h-6 hover:opacity-80 transition"
          />
          <p className="text-white text-lg md:text-xl font-bold truncate max-w-[200px] md:max-w-[400px]">
            <span className="font-light text-gray-400 mr-2">Watching:</span>
            {details?.title || details?.name || "Loading..."}
          </p>
        </div>
      </nav>

      <div className="w-full flex-1 bg-black">
        <iframe
          src={activeServer?.url ? activeServer.url(type, id) : `https://vidlink.pro/${type}/${id}`}
          className="w-full h-full border-none"
          allowFullScreen
          allow="autoplay; fullscreen"
        ></iframe>
      </div>
    </div>
  );
}
