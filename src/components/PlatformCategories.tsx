"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, ChevronLeft, Layers, Film, Tv, PlayCircle, Grid, ArrowRightLeft } from "lucide-react";
import { useTvModeStore } from "@/store/useTvModeStore";

interface CategoryBrand {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  type: "platform" | "studio" | "genre";
  href: string;
  gradient: string;
  borderColor: string;
  hoverShadow: string;
  badgeBg: string;
  badgeText: string;
  logo: React.ReactNode;
}

export default function PlatformCategories() {
  const [activeTab, setActiveTab] = useState<"all" | "platform" | "studio" | "genre">("all");
  const [layoutMode, setLayoutMode] = useState<"scroll" | "grid">("scroll");
  const { isTvMode } = useTvModeStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -450 : 450;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const brands: CategoryBrand[] = [
    // Streaming Platforms
    {
      id: "netflix",
      name: "Netflix",
      subtitle: "Series & Movies",
      badge: "ORIGINALS",
      type: "platform",
      href: "/category/netflix",
      gradient: "from-red-950/90 via-black to-red-950/40",
      borderColor: "border-red-900/50 hover:border-red-500",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(229,9,20,0.35)]",
      badgeBg: "bg-red-600/20 border-red-500/40",
      badgeText: "text-red-400",
      logo: (
        <div className="flex items-center gap-2">
          <svg className="h-7 sm:h-8 md:h-9 w-auto" viewBox="0 0 45 75" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 0H21V75H7V0Z" fill="#B81D24" />
            <path d="M24 0H38V75H24V0Z" fill="#E50914" />
            <path d="M7 0L38 75H24L7 0Z" fill="#E50914" />
          </svg>
          <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-[#E50914] font-sans">
            NETFLIX
          </span>
        </div>
      ),
    },
    {
      id: "disney",
      name: "Disney+",
      subtitle: "Pixar, Marvel & Star Wars",
      badge: "DISNEY+",
      type: "platform",
      href: "/category/disney",
      gradient: "from-blue-950/90 via-slate-900 to-cyan-950/40",
      borderColor: "border-cyan-800/40 hover:border-cyan-400",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.35)]",
      badgeBg: "bg-cyan-500/20 border-cyan-400/40",
      badgeText: "text-cyan-300",
      logo: (
        <div className="flex items-center justify-center">
          <svg className="h-7 sm:h-8 md:h-9 w-auto" viewBox="0 0 170 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="5" y="38" fontFamily="Arial, 'Trebuchet MS', sans-serif" fontSize="32" fontWeight="900" fontStyle="italic" fill="#FFFFFF" letterSpacing="-1">
              Disney
            </text>
            <path d="M12 12C45 -3 115 -2 152 18" stroke="url(#disneyArc)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M152 8v16M144 16h16" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
            <defs>
              <linearGradient id="disneyArc" x1="12" y1="12" x2="152" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60A5FA" />
                <stop offset="0.5" stopColor="#38BDF8" />
                <stop offset="1" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ),
    },
    {
      id: "vivamax",
      name: "VivaMax",
      subtitle: "Pinoy Hits & Exclusives",
      badge: "PINOY HITS",
      type: "platform",
      href: "/category/vivamax",
      gradient: "from-rose-950/90 via-black to-amber-950/40",
      borderColor: "border-amber-600/40 hover:border-amber-400",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.35)]",
      badgeBg: "bg-amber-500/20 border-amber-400/40",
      badgeText: "text-amber-300",
      logo: (
        <div className="flex items-center justify-center">
          <svg className="h-7 sm:h-8 md:h-9 w-auto" viewBox="0 0 165 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="5" y="34" fontFamily="Impact, Arial Black, sans-serif" fontSize="32" fontWeight="900" fontStyle="italic" fill="#FFC700" letterSpacing="-1">
              VIVA
            </text>
            <text x="82" y="34" fontFamily="Impact, Arial Black, sans-serif" fontSize="32" fontWeight="900" fontStyle="italic" fill="#FFFFFF" letterSpacing="-1">
              MAX
            </text>
            <path d="M152 10L154 16L160 18L154 20L152 26L150 20L144 18L150 16Z" fill="#FF0055" />
          </svg>
        </div>
      ),
    },
    {
      id: "hbo",
      name: "HBO Max",
      subtitle: "Blockbusters & Originals",
      badge: "HBO MAX",
      type: "platform",
      href: "/category/hbo",
      gradient: "from-purple-950/90 via-slate-950 to-indigo-950/50",
      borderColor: "border-purple-800/40 hover:border-purple-400",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]",
      badgeBg: "bg-purple-500/20 border-purple-400/40",
      badgeText: "text-purple-300",
      logo: (
        <div className="flex items-center gap-2">
          <svg className="h-7 sm:h-8 md:h-9 w-auto" viewBox="0 0 175 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 5h11v13H24V5h11v35H24V26H16v14H5V5z" fill="#FFFFFF" />
            <path d="M38 5h16c5.5 0 9.5 3 9.5 8.2 0 3.2-1.8 5.8-4.5 7.1 3.5 1.2 5.5 4.2 5.5 8 0 5.8-4.5 9.7-10.5 9.7H38V5zm11 11h4c2 0 3.5-1 3.5-2.5S55 12 53 12h-4v4zm0 17h4.5c2.2 0 3.8-1.2 3.8-2.8s-1.6-2.7-3.8-2.7H49v5.5z" fill="#FFFFFF" />
            <circle cx="82" cy="22.5" r="16.5" fill="#FFFFFF" />
            <circle cx="82" cy="22.5" r="7.5" fill="#09090B" />
            <circle cx="82" cy="22.5" r="3" fill="#FFFFFF" />
            <text x="105" y="32" fontFamily="Arial Black, Impact, sans-serif" fontSize="24" fontWeight="900" fill="url(#hboMaxGrad)" letterSpacing="1">MAX</text>
            <defs>
              <linearGradient id="hboMaxGrad" x1="105" y1="5" x2="175" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C084FC" />
                <stop offset="1" stopColor="#818CF8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ),
    },
    {
      id: "apple",
      name: "Apple TV+",
      subtitle: "Award-Winning Originals",
      badge: "ORIGINAL",
      type: "platform",
      href: "/category/apple",
      gradient: "from-gray-900/90 via-black to-slate-900/80",
      borderColor: "border-gray-700/60 hover:border-gray-300",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]",
      badgeBg: "bg-gray-400/20 border-gray-300/40",
      badgeText: "text-gray-200",
      logo: (
        <div className="flex items-center gap-2">
          <svg className="h-6 sm:h-7 md:h-8 w-auto" viewBox="0 0 135 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.7 19.3c.1-3.6 2.9-5.3 3.1-5.5-1.7-2.4-4.2-2.8-5.1-2.8-2.2-.2-4.3 1.3-5.4 1.3-1.1 0-2.8-1.3-4.6-1.2-2.4.1-4.6 1.4-5.8 3.5-2.5 4.3-.6 10.7 1.8 14.2 1.2 1.7 2.6 3.6 4.4 3.5 1.8-.1 2.5-1.1 4.6-1.1 2.2 0 2.8 1.1 4.6 1.1 1.9.1 3.1-1.7 4.3-3.4 1.4-2 1.9-3.9 2-4-.1-.1-3.8-1.5-3.9-5.6zM15.4 9.4c1-1.2 1.6-2.8 1.4-4.4-1.4.1-3.1.9-4.1 2.1-.9 1.1-1.7 2.7-1.5 4.3 1.6.1 3.2-.8 4.2-2z" fill="#FFFFFF" />
            <text x="30" y="31" fontFamily="system-ui, -apple-system, sans-serif" fontSize="26" fontWeight="700" fill="#FFFFFF" letterSpacing="0.5">tv+</text>
          </svg>
        </div>
      ),
    },
    {
      id: "prime",
      name: "Prime Video",
      subtitle: "Amazon Originals & Movies",
      badge: "PRIME",
      type: "platform",
      href: "/category/prime",
      gradient: "from-sky-950/90 via-slate-950 to-blue-900/40",
      borderColor: "border-sky-700/50 hover:border-sky-400",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(56,189,248,0.35)]",
      badgeBg: "bg-sky-500/20 border-sky-400/40",
      badgeText: "text-sky-300",
      logo: (
        <div className="flex flex-col items-center">
          <svg className="h-6 sm:h-7 md:h-8 w-auto" viewBox="0 0 160 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="800" fill="#FFFFFF" letterSpacing="-0.5">
              prime <tspan fill="#38BDF8">video</tspan>
            </text>
            <path d="M10 33C40 43 110 43 145 32" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M140 28L148 32L142 38" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ),
    },
    {
      id: "paramount",
      name: "Paramount+",
      subtitle: "CBS, Nick & Blockbusters",
      badge: "PARAMOUNT+",
      type: "platform",
      href: "/category/paramount",
      gradient: "from-blue-950/90 via-slate-950 to-indigo-950/60",
      borderColor: "border-blue-700/50 hover:border-blue-400",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]",
      badgeBg: "bg-blue-600/20 border-blue-400/40",
      badgeText: "text-blue-300",
      logo: (
        <div className="flex items-center gap-1">
          <span className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-white font-serif italic">
            Paramount<tspan className="text-blue-400 font-sans not-italic font-black ml-0.5">+</tspan>
          </span>
        </div>
      ),
    },
    {
      id: "hulu",
      name: "Hulu",
      subtitle: "TV Series & FX Originals",
      badge: "HULU",
      type: "platform",
      href: "/category/hulu",
      gradient: "from-emerald-950/90 via-black to-teal-950/40",
      borderColor: "border-emerald-700/50 hover:border-emerald-400",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]",
      badgeBg: "bg-emerald-500/20 border-emerald-400/40",
      badgeText: "text-emerald-300",
      logo: (
        <div className="flex items-center">
          <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-[#1CE783] drop-shadow-[0_0_12px_rgba(28,231,131,0.5)]">
            hulu
          </span>
        </div>
      ),
    },
    {
      id: "viu",
      name: "Viu",
      subtitle: "K-Dramas & Asian Hits",
      badge: "ASIAN HITS",
      type: "platform",
      href: "/category/viu",
      gradient: "from-amber-950/90 via-black to-yellow-950/40",
      borderColor: "border-yellow-600/50 hover:border-yellow-400",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(234,179,8,0.35)]",
      badgeBg: "bg-yellow-500/20 border-yellow-400/40",
      badgeText: "text-yellow-300",
      logo: (
        <div className="flex items-center gap-1">
          <span className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-400 tracking-wider font-sans">
            viu
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
        </div>
      ),
    },

    // Studio & Franchise Hubs
    {
      id: "marvel",
      name: "Marvel Studios",
      subtitle: "MCU Movies & Series",
      badge: "MARVEL HUB",
      type: "studio",
      href: "/category/marvel",
      gradient: "from-red-950/90 via-rose-950 to-black",
      borderColor: "border-red-600/60 hover:border-red-400",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]",
      badgeBg: "bg-red-600 text-white font-bold",
      badgeText: "text-white",
      logo: (
        <div className="bg-red-600 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded shadow-lg border border-red-500">
          <span className="text-base sm:text-xl md:text-2xl font-black tracking-widest text-white uppercase font-sans">
            MARVEL
          </span>
        </div>
      ),
    },
    {
      id: "dc",
      name: "DC Universe",
      subtitle: "Batman, Superman & JL",
      badge: "DC HUB",
      type: "studio",
      href: "/category/dc",
      gradient: "from-blue-950/90 via-slate-950 to-sky-950/50",
      borderColor: "border-blue-600/50 hover:border-blue-400",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(37,99,235,0.35)]",
      badgeBg: "bg-blue-600/20 border-blue-400/40",
      badgeText: "text-blue-300",
      logo: (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white font-black text-base sm:text-lg flex items-center justify-center border border-blue-400">
            DC
          </div>
          <span className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-wider">
            UNIVERSE
          </span>
        </div>
      ),
    },

    // Genre Hubs
    {
      id: "anime",
      name: "Anime Hub",
      subtitle: "Shonen, Ghibli & New Ep",
      badge: "ANIME",
      type: "genre",
      href: "/category/anime",
      gradient: "from-fuchsia-950/90 via-purple-950 to-black",
      borderColor: "border-fuchsia-600/50 hover:border-fuchsia-400",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(217,70,239,0.35)]",
      badgeBg: "bg-fuchsia-500/20 border-fuchsia-400/40",
      badgeText: "text-fuchsia-300",
      logo: (
        <div className="flex items-center gap-1.5">
          <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-wider text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
            ANIME
          </span>
          <span className="text-base text-pink-400 font-bold">🌸</span>
        </div>
      ),
    },
    {
      id: "k-dramas",
      name: "K-Drama Hub",
      subtitle: "Korean Series & Romance",
      badge: "K-DRAMA",
      type: "genre",
      href: "/category/k-dramas",
      gradient: "from-pink-950/90 via-rose-950 to-slate-950",
      borderColor: "border-pink-600/50 hover:border-pink-400",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(236,72,153,0.35)]",
      badgeBg: "bg-pink-500/20 border-pink-400/40",
      badgeText: "text-pink-300",
      logo: (
        <div className="flex items-center gap-1.5">
          <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-pink-300">
            K-DRAMA
          </span>
          <span className="text-base text-rose-400 font-bold">🫰</span>
        </div>
      ),
    },
    {
      id: "horror",
      name: "Horror & Suspense",
      subtitle: "Scary Movies & Thrillers",
      badge: "HORROR",
      type: "genre",
      href: "/category/horror",
      gradient: "from-red-950/90 via-stone-950 to-black",
      borderColor: "border-red-800/60 hover:border-red-600",
      hoverShadow: "hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]",
      badgeBg: "bg-red-950 border-red-700/50",
      badgeText: "text-red-400",
      logo: (
        <div className="flex items-center gap-1.5">
          <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-red-600 font-serif">
            HORROR
          </span>
          <span className="text-base">🩸</span>
        </div>
      ),
    },
  ];

  const filteredBrands = brands.filter((b) => {
    if (activeTab === "all") return true;
    return b.type === activeTab;
  });

  return (
    <section className="hidden sm:block px-3 sm:px-4 md:px-12 my-3 sm:my-6 md:my-8 relative z-20 group/section">
      {/* Section Header with Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-2.5 sm:mb-4 md:mb-6">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-500 animate-pulse" />
            <h2 className="text-xs sm:text-base md:text-2xl font-extrabold text-white tracking-wide">
              Browse Categories & Hubs
            </h2>
          </div>

          {/* Layout Mode Switcher Toggle (1 Row Swipe vs Grid) */}
          <button
            onClick={() => setLayoutMode(layoutMode === "scroll" ? "grid" : "scroll")}
            className="flex items-center gap-1 text-[9px] sm:text-xs font-bold text-gray-300 bg-gray-900/90 border border-gray-700 hover:border-gray-500 hover:text-white px-2 sm:px-3 py-1 rounded-md transition cursor-pointer shadow-md"
            title="Toggle between 1-Row Swipe Carousel and Multi-Row Grid"
          >
            {layoutMode === "scroll" ? (
              <>
                <Grid className="w-3 h-3 text-red-400" />
                <span>Grid View</span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-3 h-3 text-red-400" />
                <span>1 Layer (Swipe)</span>
              </>
            )}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="w-full sm:w-auto grid grid-cols-4 sm:flex items-center gap-1 sm:gap-1.5 bg-gray-900/90 p-1 sm:p-1.5 rounded-full border border-gray-800 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-1 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9.5px] sm:text-xs font-semibold sm:font-bold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${activeTab === "all"
                ? "bg-netflix-red text-white shadow-lg shadow-red-950/50"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
          >
            <Layers className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="inline sm:hidden">All ({brands.length})</span>
            <span className="hidden sm:inline">All Hubs ({brands.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("platform")}
            className={`px-1 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9.5px] sm:text-xs font-semibold sm:font-bold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${activeTab === "platform"
                ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
          >
            <Tv className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="inline sm:hidden">Networks</span>
            <span className="hidden sm:inline">Streaming Networks</span>
          </button>
          <button
            onClick={() => setActiveTab("studio")}
            className={`px-1 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9.5px] sm:text-xs font-semibold sm:font-bold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${activeTab === "studio"
                ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
          >
            <Film className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="inline sm:hidden">Studios</span>
            <span className="hidden sm:inline">Studio Franchises</span>
          </button>
          <button
            onClick={() => setActiveTab("genre")}
            className={`px-1 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9.5px] sm:text-xs font-semibold sm:font-bold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${activeTab === "genre"
                ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
          >
            <PlayCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="inline sm:hidden">Genres</span>
            <span className="hidden sm:inline">Genres & Themes</span>
          </button>
        </div>
      </div>

      {/* Container wrapper for 1-Row Scroll arrows */}
      <div className="relative">
        {layoutMode === "scroll" && (
          <>
            <button
              onClick={() => handleScroll("left")}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-black/80 hover:bg-black text-white p-2 rounded-r-xl border border-l-0 border-gray-700/80 shadow-2xl opacity-0 group-hover/section:opacity-100 transition-all cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleScroll("right")}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/80 hover:bg-black text-white p-2 rounded-l-xl border border-r-0 border-gray-700/80 shadow-2xl opacity-0 group-hover/section:opacity-100 transition-all cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Category Cards Container (1 Single Row Carousel OR Multi-Row Grid) */}
        <div
          ref={scrollContainerRef}
          className={
            layoutMode === "scroll"
              ? "flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 sm:pb-3 scroll-smooth animate-in fade-in duration-300"
              : "grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 animate-in fade-in duration-300"
          }
        >
          {filteredBrands.map((brand) => (
            <Link
              key={brand.id}
              href={brand.href}
              tabIndex={0}
              className={`group relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br ${brand.gradient} border ${brand.borderColor
                } ${brand.hoverShadow} p-2 sm:p-3.5 md:p-4 flex flex-col justify-between items-center text-center transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer backdrop-blur-md ${layoutMode === "scroll"
                  ? "min-w-[125px] sm:min-w-[170px] md:min-w-[210px] flex-shrink-0"
                  : "min-w-[115px] sm:min-w-0"
                } min-h-[85px] sm:min-h-[110px] md:min-h-[135px] snap-start focus:outline-none focus:ring-4 focus:ring-red-600 focus:scale-105 focus:z-30 ${isTvMode ? "p-4 sm:p-5 border-2 shadow-2xl scale-100" : ""
                }`}
            >
              {/* Top Shine Highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:via-white/60 transition-all duration-300" />

              {/* Background Ambient Radial Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-radial from-white/10 to-transparent pointer-events-none" />

              {/* Top Badge */}
              <div className="w-full flex justify-between items-center">
                <span className={`text-[7.5px] sm:text-[8.5px] md:text-[10px] font-black px-1 sm:px-2 py-0.2 sm:py-0.5 rounded-full border ${brand.badgeBg} ${brand.badgeText} tracking-wider uppercase backdrop-blur-sm truncate max-w-[80%]`}>
                  {brand.badge}
                </span>
                <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>

              {/* Logo Center */}
              <div className="my-auto py-1 sm:py-1.5 md:py-2 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center scale-90 sm:scale-100">
                {brand.logo}
              </div>

              {/* Subtitle */}
              <p className="text-[9px] sm:text-[10.5px] text-gray-400 group-hover:text-gray-200 transition-colors truncate w-full font-medium">
                {brand.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
