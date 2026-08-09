"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, User, Menu, X, ChevronDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchMovies, requests } from "@/lib/tmdb";
import { Movie } from "@/types";
import { useUserStore } from "@/store/useUserStore";
import ShinyText from "./ShinyText/ShinyText";
import ShinyImage from "./ShinyText/ShinyImage";
import { useIntroStore } from "@/store/useIntroStore";
import { SERVERS } from "@/lib/servers";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAllServers, setShowAllServers] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Movie[]>([]);

  // PWA Install states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  const isIntroPlaying = useIntroStore((state) => state.isIntroPlaying);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent) && !(window.navigator as any).standalone) {
      setIsIOS(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSPrompt(true);
    } else {
      alert("App is already installed or not supported on this browser.");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        useUserStore.getState().fetchProfiles();
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        useUserStore.getState().fetchProfiles();
      } else {
        useUserStore.getState().setActiveProfile(null);
        useUserStore.getState().setList([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const { activeProfile, activeServer, setActiveServer } = useUserStore();

  useEffect(() => {
    // If user is logged in, but no active profile, and not already on the profiles page
    if (user && !activeProfile && pathname !== "/profiles") {
      router.push("/profiles");
    }
  }, [user, activeProfile, pathname, router]);

  useEffect(() => {
    let isMounted = true;

    // Fetch some real movies to use as notifications (e.g., Trending)
    const getNotifications = async () => {
      try {
        const data = await fetchMovies(requests.fetchTrending);
        if (isMounted) {
          // Just take the top 3 as notifications
          setNotifications(data.results?.slice(0, 3) || []);
        }
      } catch (error: any) {
        if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED' || error?.message?.includes('aborted')) {
          // Ignore aborted requests during navigation or React StrictMode unmounts
          return;
        }
        console.error("Failed to fetch notifications", error);
      }
    };
    getNotifications();

    return () => {
      isMounted = false;
    };
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
    { name: "Favorites", href: "/my-list" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-colors duration-300 ease-in-out",
        isScrolled ? "bg-netflix-dark" : "bg-gradient-to-b from-black/80 to-transparent"
      )}
    >
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        <div className="flex items-center gap-2 md:gap-8">
          <button
            className="md:hidden text-white hover:text-gray-300 transition"
            onClick={() => setShowMobileMenu(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="flex items-center gap-1 group">
            <div className="h-10 w-10 relative">
              {!isIntroPlaying && (
                <ShinyImage layoutId="main-logo" transition={{ type: "tween", duration: 1.5, ease: "easeInOut" }} src="/logofm2.png" alt="FreeMovies Logo" className="h-10 w-auto cursor-pointer z-50 relative group-hover:scale-105 absolute inset-0" speed={1.5} delay={1.5} offset={0} direction="left" shineColor="#ffffff" spread={120} />
              )}
            </div>
            <ShinyText
              text="REEMOVIES"
              speed={1.5}
              delay={1.5}
              offset={1.5}
              direction="left"
              className="text-4xl font-bold tracking-wider cursor-pointer z-50 relative font-bebas"
              color="#e50914"
              shineColor="#ffffff"
              spread={120}
            />
          </Link>
          <ul className="hidden md:flex gap-5 text-sm font-medium items-center">
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

            {/* Categories Dropdown */}
            <li className="relative group cursor-pointer">
              <span className="text-gray-200 transition-colors hover:text-gray-300 flex items-center gap-1">
                Categories <ChevronDown className="w-4 h-4 transition group-hover:rotate-180" />
              </span>
              <div className="absolute left-0 top-6 hidden w-48 bg-black/95 border border-gray-800 rounded-md shadow-xl py-2 group-hover:flex flex-col z-50">
                <Link href="/category/anime" className="px-4 py-2 hover:bg-gray-800 text-sm text-gray-300 hover:text-white transition">Anime</Link>
                <Link href="/category/k-dramas" className="px-4 py-2 hover:bg-gray-800 text-sm text-gray-300 hover:text-white transition">K-Dramas</Link>
                <Link href="/category/mystery" className="px-4 py-2 hover:bg-gray-800 text-sm text-gray-300 hover:text-white transition">Mystery</Link>
                <Link href="/category/family" className="px-4 py-2 hover:bg-gray-800 text-sm text-gray-300 hover:text-white transition">Family</Link>
                <Link href="/category/action" className="px-4 py-2 hover:bg-gray-800 text-sm text-gray-300 hover:text-white transition">Action</Link>
                <Link href="/category/comedy" className="px-4 py-2 hover:bg-gray-800 text-sm text-gray-300 hover:text-white transition">Comedy</Link>
              </div>
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-2 md:gap-6 text-white">
          <button
            onClick={handleInstallClick}
            className="flex items-center justify-center bg-gray-800/80 hover:bg-gray-700/80 text-white p-1.5 md:px-3 md:py-1.5 rounded-full transition border border-gray-700"
            title="Install App"
          >
            <Download className="w-4 h-4 md:w-3.5 md:h-3.5" />
            <span className="hidden md:inline md:ml-2 text-xs font-medium">Install App</span>
          </button>
          <Link href="/search">
            <Search className="w-5 h-5 cursor-pointer hover:text-gray-300 transition" />
          </Link>
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
            <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden bg-gray-800 border border-gray-700">
              {activeProfile ? (
                activeProfile.avatar_url ? (
                  <img src={activeProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-netflix-red text-white flex items-center justify-center font-bold text-sm">
                    {activeProfile.name.charAt(0).toUpperCase()}
                  </div>
                )
              ) : user ? (
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
                    <Link href="/profiles" className="px-4 py-2 hover:underline text-sm text-gray-300 transition mt-1">Manage Profiles</Link>
                    <div className="h-px bg-gray-700 my-2"></div>
                    {user?.email !== "johnwilbertgamis2022@gmail.com" && (
                      <Link href="/help" className="px-4 py-2 hover:underline text-sm text-gray-300 transition">Help Center</Link>
                    )}



                    {user.email === "johnwilbertgamis2022@gmail.com" && (
                      <Link href="/dashboard" className="px-4 py-2 hover:underline text-sm text-netflix-red font-bold transition">Admin Dashboard</Link>
                    )}
                    <div className="h-px bg-gray-700 my-2"></div>
                    <div
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.refresh();
                      }}
                      className="px-4 py-2 hover:underline text-sm text-center text-gray-300 transition cursor-pointer"
                    >
                      Sign out
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

      {/* Mobile Drawer Menu */}
      <div
        className={cn(
          "fixed inset-0 bg-black/95 z-[100] md:hidden transition-transform duration-300 ease-in-out flex flex-col",
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-1 group">
            <div className="h-10 w-10 relative">
              {!isIntroPlaying && (
                <ShinyImage layoutId="mobile-drawer-logo" transition={{ type: "tween", duration: 1.5, ease: "easeInOut" }} src="/logofm2.png" alt="FreeMovies Logo" className="h-10 w-auto cursor-pointer z-50 relative group-hover:scale-105 absolute inset-0" speed={1.5} delay={1.5} offset={0} direction="left" shineColor="#ffffff" spread={120} />
              )}
            </div>
            <ShinyText
              text="REEMOVIES"
              speed={1.5}
              delay={1.5}
              offset={1.5}
              direction="left"
              className="text-4xl font-bold tracking-wider cursor-pointer z-50 relative font-bebas"
              color="#e50914"
              shineColor="#ffffff"
              spread={120}
            />
          </Link>
          <button
            onClick={() => setShowMobileMenu(false)}
            className="p-2 text-white hover:text-gray-300 transition bg-gray-900 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Browse</h2>
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={cn(
                      "text-xl transition-colors hover:text-gray-300 block",
                      pathname === link.href ? "text-white font-bold" : "text-gray-300"
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px bg-gray-800 w-full my-2"></div>

          <div className="flex flex-col gap-4">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Categories</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/category/anime" onClick={() => setShowMobileMenu(false)} className="text-lg transition-colors hover:text-gray-300 text-gray-300">Anime</Link>
              <Link href="/category/k-dramas" onClick={() => setShowMobileMenu(false)} className="text-lg transition-colors hover:text-gray-300 text-gray-300">K-Dramas</Link>
              <Link href="/category/mystery" onClick={() => setShowMobileMenu(false)} className="text-lg transition-colors hover:text-gray-300 text-gray-300">Mystery</Link>
              <Link href="/category/family" onClick={() => setShowMobileMenu(false)} className="text-lg transition-colors hover:text-gray-300 text-gray-300">Family</Link>
              <Link href="/category/action" onClick={() => setShowMobileMenu(false)} className="text-lg transition-colors hover:text-gray-300 text-gray-300">Action</Link>
              <Link href="/category/comedy" onClick={() => setShowMobileMenu(false)} className="text-lg transition-colors hover:text-gray-300 text-gray-300">Comedy</Link>
            </div>
          </div>

          <div className="h-px bg-gray-800 w-full my-2"></div>

          <div className="flex flex-col gap-4">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Notifications</h2>
            {notifications.length > 0 ? (
              notifications.map((movie) => (
                <Link
                  href={`/watch/${movie.media_type || 'movie'}/${movie.id}`}
                  key={movie.id}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-4 hover:bg-gray-800 p-2 rounded-md transition"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.backdrop_path || movie.poster_path}`}
                    alt={movie.title || movie.name}
                    className="w-24 h-14 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white truncate max-w-[200px]">
                      {movie.title || movie.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      New Arrival
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-gray-500 text-sm">No new notifications</div>
            )}
          </div>

          <div className="h-px bg-gray-800 w-full my-2"></div>

          <div className="flex flex-col gap-4 pb-8">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Account</h2>
            {user ? (
              <div className="flex flex-col gap-4">
                <span className="text-gray-400 text-sm font-medium">{user.email}</span>
                <Link href="/profiles" onClick={() => setShowMobileMenu(false)} className="text-lg transition-colors hover:text-gray-300 text-gray-300">Manage Profiles</Link>
                {user?.email !== "johnwilbertgamis2022@gmail.com" && (
                  <Link href="/help" onClick={() => setShowMobileMenu(false)} className="text-lg transition-colors hover:text-gray-300 text-gray-300">Help Center</Link>
                )}


                {user.email === "johnwilbertgamis2022@gmail.com" && (
                  <Link href="/dashboard" onClick={() => setShowMobileMenu(false)} className="text-lg transition-colors text-netflix-red font-bold">Admin Dashboard</Link>
                )}
                <button
                  onClick={async () => {
                    setShowMobileMenu(false);
                    await supabase.auth.signOut();
                    router.refresh();
                  }}
                  className="text-lg transition-colors hover:text-gray-300 text-gray-300 text-left mt-2"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link href="/login" onClick={() => setShowMobileMenu(false)} className="text-lg font-bold text-white bg-netflix-red px-4 py-2 rounded-md text-center">Sign In</Link>
                <Link href="/login" onClick={() => setShowMobileMenu(false)} className="text-lg text-gray-300 text-center">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* iOS Install Prompt Modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#141414] border border-gray-800 rounded-xl max-w-sm w-full p-6 relative flex flex-col items-center text-center shadow-2xl">
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition bg-gray-800/50 hover:bg-gray-700 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 ring-4 ring-gray-800/50 overflow-hidden">
              <img src="/logofm2.png" alt="FreeMovies Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Install FreeMovies</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Install this app on your iPhone or iPad for the best experience.
            </p>
            <div className="bg-gray-800/50 rounded-lg p-4 w-full text-left flex flex-col gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <p className="text-sm text-gray-300">Tap the <span className="text-blue-400 font-bold">Share</span> icon at the bottom of Safari.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <p className="text-sm text-gray-300">Scroll down and tap <span className="text-white font-bold">"Add to Home Screen"</span>.</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full bg-netflix-red text-white font-bold py-3 rounded-md hover:bg-red-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
