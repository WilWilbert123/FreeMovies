"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const pathname = usePathname();

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
            <Bell className="w-5 h-5 cursor-pointer hover:text-gray-300 transition" />
            
            {showNotifications && (
              <div className="absolute right-0 top-8 w-72 bg-black/95 border border-gray-800 rounded-md shadow-xl py-2 flex flex-col z-50">
                <div className="px-4 py-3 text-sm font-bold text-white border-b border-gray-800">Notifications</div>
                <div className="px-4 py-3 hover:bg-gray-800 cursor-pointer transition flex items-start gap-3">
                  <div className="w-12 h-8 bg-red-600 rounded flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-gray-200 line-clamp-2">New Arrival: The Latest Action Thriller</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-gray-800 cursor-pointer transition flex items-start gap-3">
                  <div className="w-12 h-8 bg-blue-600 rounded flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-gray-200 line-clamp-2">Top 10 Today: Check out what everyone is watching!</p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div 
            className="relative flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setShowAccountMenu(true)}
            onMouseLeave={() => setShowAccountMenu(false)}
          >
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            
            {showAccountMenu && (
              <div className="absolute right-0 top-10 w-48 bg-black/95 border border-gray-800 rounded-md shadow-xl py-2 flex flex-col z-50">
                <div className="px-4 py-2 hover:underline flex items-center gap-3 transition">
                  <div className="w-6 h-6 bg-green-500 rounded flex-shrink-0"></div>
                  <span className="text-sm text-gray-300">Kids</span>
                </div>
                <Link href="/my-list" className="px-4 py-2 hover:underline text-sm text-gray-300 transition mt-1">Manage Profiles</Link>
                <div className="h-px bg-gray-700 my-2"></div>
                <Link href="#" className="px-4 py-2 hover:underline text-sm font-bold text-gray-300 transition">Account</Link>
                <Link href="#" className="px-4 py-2 hover:underline text-sm text-gray-300 transition">Help Center</Link>
                <div className="h-px bg-gray-700 my-2"></div>
                <Link href="#" className="px-4 py-2 hover:underline text-sm text-center text-gray-300 transition">Sign out of FreeMovies</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
