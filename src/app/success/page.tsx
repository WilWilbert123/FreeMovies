"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Reveal the button after 2 seconds for a dramatic effect
    const timer = setTimeout(() => setShowButton(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-screen w-full bg-black flex items-center justify-center overflow-hidden">
      {/* Background with slight grid/gradient for a premium feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-black -z-10"></div>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500 via-transparent to-transparent"></div>

      <div className="z-10 flex flex-col items-center">
        {/* 3D Animated Card */}
        <div className="relative group [perspective:1000px]">
          <div className="w-80 h-96 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl transition-all duration-700 ease-out transform group-hover:[transform:rotateX(12deg)_rotateY(-12deg)] hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:border-red-500/50">
            
            {/* Success Icon with a glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
              <CheckCircle className="w-24 h-24 text-green-500 mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-bounce" />
            </div>

            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 text-center tracking-tight">
              Registration Successful
            </h1>
            
            <p className="text-gray-400 text-center text-sm mt-4 font-medium px-4">
              Your email has been verified and your account is now active. Welcome to FiliFlix!
            </p>

            {/* Glowing borders */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ maskImage: 'linear-gradient(black, white)', WebkitMaskImage: 'linear-gradient(black, white)' }}></div>
          </div>
        </div>

        {/* Start Watching Button (Fades in) */}
        <div className={`mt-12 transition-all duration-1000 transform ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link href="/">
            <button className="relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-netflix-red px-8 font-medium text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(229,9,20,0.6)] focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black">
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </div>
              <span className="text-lg font-bold tracking-wider">Start Watching</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
