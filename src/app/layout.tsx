import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreeMovies - Watch TV Shows & Movies",
  description: "High-performance streaming platform for free movies and TV shows.",
};

import Link from "next/link";
import LiveChat from "@/components/LiveChat";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full bg-[#141414] text-white flex flex-col">
        <div className="flex-grow">
          {children}
        </div>
        <footer className="w-full bg-[#141414] border-t border-gray-800 py-6 mt-12">
          <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4">
            <p className="text-gray-400 text-sm font-medium">
              Created by John Wilbert Gamis &copy; 2026
            </p>
            <Link 
              href="https://github.com/WilWilbert123/FreeMovies" 
              target="_blank" 
              className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              <span className="text-sm">View on GitHub</span>
            </Link>
          </div>
        </footer>
        <LiveChat />
      </body>
    </html>
  );
}
