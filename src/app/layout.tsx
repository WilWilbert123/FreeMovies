import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
});
import "./globals.css";

export const metadata: Metadata = {
  title: "FiliFlix - Watch TV Shows & Movies",
  description: "High-performance streaming platform for free movies and TV shows.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FiliFlix",
  },
};

export const viewport = {
  themeColor: "#141414",
};

import Link from "next/link";
import IntroAnimation from "@/components/IntroAnimation";
import ShinyText from "@/components/ShinyText/ShinyText";
import PresenceTracker from "@/components/PresenceTracker";
import { DownloadProvider } from "@/context/DownloadContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased dark ${bebasNeue.variable}`}>
      <body className="min-h-full bg-[#141414] text-white flex flex-col">
        <PresenceTracker />
        <IntroAnimation />
        <DownloadProvider>
          <div className="flex-grow">
            {children}
          </div>
        </DownloadProvider>
        <footer className="w-full bg-[#141414] border-t border-gray-800 py-4 mt-12">
          <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-3 text-xs text-gray-500 text-center flex-wrap">
            <div className="flex items-center gap-1">
              Created by <ShinyText text="John Wilbert Gamis" speed={5} className="font-bold" />
            </div>
            <span className="hidden lg:inline">|</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
            <span className="hidden lg:inline">|</span>
            <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
            <span className="hidden lg:inline">|</span>
            <span>Movie posters and metadata are provided by TMDB for informational purposes only.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
