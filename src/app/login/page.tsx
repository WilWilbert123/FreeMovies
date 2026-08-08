"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ShinyText from "@/components/ShinyText/ShinyText";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Auto sign in after sign up is configured in Supabase by default unless email verification is required
        alert("Sign up successful! You can now log in.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/profiles");
        router.refresh(); // Refresh to update navbar state
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full bg-black bg-opacity-50">
      <div 
        className="absolute inset-0 bg-cover bg-center -z-10 brightness-50"
        style={{ backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_large.jpg')" }}
      ></div>

      <div className="px-4 py-4 md:px-12 flex justify-between items-center z-50">
        <Link href="/">
          <ShinyText 
            text="FREEMOVIES" 
            speed={3} 
            className="text-4xl md:text-5xl font-bold tracking-wider cursor-pointer z-50 relative font-bebas" 
            color="#e50914" 
            shineColor="#ffffff" 
            spread={120} 
          />
        </Link>
      </div>

      <div className="flex justify-center items-center mt-8 md:mt-20">
        <div className="bg-black/80 p-12 rounded-md w-full max-w-md flex flex-col gap-4">
          <h2 className="text-white text-3xl font-bold mb-4">
            {isSignUp ? "Sign Up" : "Sign In"}
          </h2>
          
          {error && (
            <div className="bg-orange-500 p-3 rounded text-white text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <input 
              type="email"
              placeholder="Email or phone number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#333] text-white px-4 py-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
            <input 
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#333] text-white px-4 py-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            />
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-netflix-red text-white py-3 rounded-md font-bold mt-4 hover:bg-red-700 transition"
            >
              {isLoading ? "Please wait..." : (isSignUp ? "Sign Up" : "Sign In")}
            </button>
          </form>

          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <div className="flex items-center gap-1">
              <input type="checkbox" id="remember" className="w-4 h-4 bg-gray-500" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="#" className="hover:underline">Need help?</a>
          </div>

          <div className="text-gray-400 mt-10">
            {isSignUp ? "Already subscribed to FreeMovies? " : "New to FreeMovies? "}
            <span 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-white hover:underline cursor-pointer"
            >
              {isSignUp ? "Sign in now." : "Sign up now."}
            </span>
          </div>
          
          <p className="text-gray-500 text-xs mt-2">
            This page is protected by Google reCAPTCHA to ensure you're not a bot. <a href="#" className="text-blue-500 hover:underline">Learn more.</a>
          </p>
        </div>
      </div>
    </div>
  );
}
