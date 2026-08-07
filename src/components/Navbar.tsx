"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchMovies, requests } from "@/lib/tmdb";
import { Movie } from "@/types";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Movie[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch some real movies to use as notifications (e.g., Trending)
    const getNotifications = async () => {
      try {
        const data = await fetchMovies(requests.fetchTrending);
        // Just take the top 3 as notifications
        setNotifications(data.results?.slice(0, 3) || []);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    getNotifications();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "TV Shows", href: "/tv" },
    { name: "Movies", href: "/movies" },
    { name: "New & Popular", href: "/new-popular" },
    { name: "My List", href: "/my-list" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-colors duration-300 ease-in-out",
        isScrolled ? "bg-netflix-dark" : "bg-gradient-to-b from-black/80 to-transparent"
      )}
    >
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        <div className="flex items-center gap-8">
          <Link href="/">
            <h1 className="text-netflix-red text-2xl md:text-3xl font-bold tracking-wider cursor-pointer">
              FREEMOVIES
            </h1>
          </Link>
          <ul className="hidden md:flex gap-5 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={cn(
                    "transition-colors hover:text-gray-300",
                    pathname === link.href ? "text-white font-bold" : "text-gray-200"
                  )}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-6 text-white">
          <Link href="/search">
            <Search className="w-5 h-5 cursor-pointer hover:text-gray-300 transition" />
          </Link>
          <span className="hidden md:inline text-sm">Kids</span>
          <div 
            className="relative hidden sm:block"
            onMouseEnter={() => setShowNotifications(true)}
            onMouseLeave={() => setShowNotifications(false)}
          >
            <div className="relative">
              <Bell className="w-5 h-5 cursor-pointer hover:text-gray-300 transition" />
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-black flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">{notifications.length}</span>
                </div>
              )}
            </div>
            
            {showNotifications && (
              <div className="absolute right-0 top-8 w-80 bg-black/95 border border-gray-800 rounded-md shadow-xl flex flex-col z-50 overflow-hidden">
                <div className="px-4 py-3 text-sm font-bold text-white border-b border-gray-800 flex justify-between items-center">
                  <span>Notifications</span>
                  <span className="text-xs text-gray-400 font-normal cursor-pointer hover:text-white">Mark all as read</span>
                </div>
                
                <div className="max-h-96 overflow-y-auto scrollbar-hide">
                  {notifications.length > 0 ? (
                    notifications.map((movie, idx) => (
                      <Link 
                        href={`/watch/${movie.media_type || 'movie'}/${movie.id}`} 
                        key={movie.id}
                        className="px-4 py-3 hover:bg-gray-800 cursor-pointer transition flex items-start gap-3 border-b border-gray-800/50 last:border-0"
                      >
                        <img 
                          src={`https://image.tmdb.org/t/p/w92${movie.backdrop_path || movie.poster_path}`} 
                          alt={movie.title || movie.name}
                          className="w-20 h-12 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex flex-col justify-center">
                          <p className="text-sm text-gray-200 line-clamp-2 font-medium">
                            New Arrival: {movie.title || movie.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {idx === 0 ? 'Just now' : idx === 1 ? '2 hours ago' : '1 day ago'}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div 
            className="relative flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setShowAccountMenu(true)}
            onMouseLeave={() => setShowAccountMenu(false)}
          >
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center overflow-hidden">
              {user ? (
                <div className="w-full h-full bg-netflix-red text-white flex items-center justify-center font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            
            {showAccountMenu && (
              <div className="absolute right-0 top-10 w-48 bg-black/95 border border-gray-800 rounded-md shadow-xl py-2 flex flex-col z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 truncate text-sm text-gray-300 font-bold border-b border-gray-700">
                      {user.email}
                    </div>
                    <Link href="/my-list" className="px-4 py-2 hover:underline text-sm text-gray-300 transition mt-1">Manage Profiles</Link>
                    <div className="h-px bg-gray-700 my-2"></div>
                    <Link href="#" className="px-4 py-2 hover:underline text-sm font-bold text-gray-300 transition">Account</Link>
                    <Link href="#" className="px-4 py-2 hover:underline text-sm text-gray-300 transition">Help Center</Link>
                    <div className="h-px bg-gray-700 my-2"></div>
                    <div 
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.refresh();
                      }}
                      className="px-4 py-2 hover:underline text-sm text-center text-gray-300 transition cursor-pointer"
                    >
                      Sign out of FreeMovies
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="px-4 py-2 hover:underline text-sm font-bold text-white transition text-center bg-netflix-red rounded mx-2 my-1">
                      Sign In
                    </Link>
                    <Link href="/login" className="px-4 py-2 hover:underline text-sm text-gray-300 transition text-center">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
