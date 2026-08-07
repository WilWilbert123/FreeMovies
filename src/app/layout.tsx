import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreeMovies - Watch TV Shows & Movies",
  description: "High-performance streaming platform for free movies and TV shows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full bg-[#141414] text-white">
        {children}
      </body>
    </html>
  );
}
