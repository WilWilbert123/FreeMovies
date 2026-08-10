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
        <div className="flex-grow">
          {children}
        </div>
        <footer className="w-full bg-[#141414] border-t border-gray-800 py-6 mt-12">
          <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4">
            <div className="text-gray-400 text-sm font-medium flex items-center justify-center gap-1">
              Created by <ShinyText text="John Wilbert Gamis" speed={5} className="text-sm font-bold" /> &copy; 2026
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
