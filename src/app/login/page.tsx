"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, X, Eye, EyeOff, Sparkles, ArrowLeft } from "lucide-react";
import ShinyText from "@/components/ShinyText/ShinyText";
import ShinyImage from "@/components/ShinyText/ShinyImage";

// ─── Google SVG Icon ─────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

type AuthView = "signin" | "signup" | "magic";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const urlError = searchParams.get("error");

  const [view, setView] = useState<AuthView>(
    modeParam === "signup" ? "signup" : "signin"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(urlError || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMagicModal, setShowMagicModal] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (modeParam === "signup") setView("signup");
    else if (modeParam === "signin") setView("signin");
  }, [modeParam]);

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=/profiles`,
      },
    });
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  // ── Magic Link ──────────────────────────────────────────────────────────────
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=/profiles`,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setShowMagicModal(true);
    }
    setIsLoading(false);
  };

  // ── Manual Sign Up ──────────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://filiflix.vercel.app/email-confirmed",
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setShowConfirmModal(true);
      setView("signin");
    }
    setIsLoading(false);
  };

  // ── Manual Sign In ──────────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push("/profiles");
      router.refresh();
    }
    setIsLoading(false);
  };

  const clearError = () => setError(null);

  return (
    <div className="relative min-h-screen w-full bg-black bg-opacity-50">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center -z-10 brightness-50"
        style={{
          backgroundImage:
            "url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_large.jpg')",
        }}
      />

      {/* Navbar */}
      <div className="px-4 py-4 md:px-12 flex justify-between items-center z-50">
        <Link href="/" className="flex items-center gap-1 group">
          <ShinyImage
            layoutId="login-logo"
            transition={{ type: "tween", duration: 1.5, ease: "easeInOut" }}
            src="/logofm2.png"
            alt="FiliFlix Logo"
            className="h-10 md:h-12 w-auto cursor-pointer z-50 relative group-hover:scale-105 transition-transform duration-300"
            speed={1.5}
            delay={1.5}
            offset={0}
            direction="left"
            shineColor="#ffffff"
            spread={120}
          />
          <ShinyText
            text="ILIFLIX"
            speed={1.5}
            delay={1.5}
            offset={1.5}
            direction="left"
            className="text-4xl md:text-5xl font-bold tracking-wider cursor-pointer z-50 relative font-bebas"
            color="#e50914"
            shineColor="#ffffff"
            spread={120}
          />
        </Link>
      </div>

      {/* Card */}
      <div className="flex justify-center items-center mt-6 md:mt-12 px-4 pb-16">
        <div className="bg-black/80 p-8 md:p-12 rounded-md w-full max-w-md flex flex-col gap-4">

          {/* ── SIGN UP VIEW (Fresh Account Creation with Google + Magic Link) ── */}
          {view === "signup" && (
            <>
              <h2 className="text-white text-3xl font-bold mb-1">Sign Up</h2>
              <p className="text-gray-400 text-sm mb-2">Create a new FiliFlix account</p>

              {error && (
                <div className="bg-orange-500/90 p-3 rounded text-white text-sm flex justify-between items-start">
                  <span>{error}</span>
                  <button onClick={clearError} className="ml-2 shrink-0"><X size={14} /></button>
                </div>
              )}

              {/* Continue with Google */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 w-full bg-white text-gray-900 py-3 rounded-md font-semibold hover:bg-gray-100 transition disabled:opacity-60 shadow-md"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </button>

              {/* Send Magic Link */}
              <button
                onClick={() => { setError(null); setView("magic"); }}
                className="flex items-center justify-center gap-3 w-full bg-[#1a1a2e] border border-indigo-500/40 text-indigo-300 py-3 rounded-md font-semibold hover:bg-indigo-950/60 hover:border-indigo-400/60 transition"
              >

                Send Magic Link
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="text-gray-500 text-xs uppercase tracking-wider">or email & password</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              {/* Manual Email + Password Form */}
              <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#333] text-white px-4 py-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#333] text-white px-4 py-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-netflix-red hover:bg-red-700 text-white py-3 rounded-md font-bold mt-2 transition flex justify-center items-center disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>

              <div className="text-gray-400 text-sm text-center mt-4">
                Already have an account?{" "}
                <span
                  onClick={() => { setError(null); setView("signin"); }}
                  className="text-red-500 hover:underline cursor-pointer font-medium"
                >
                  Sign in now.
                </span>
              </div>
            </>
          )}

          {/* ── SIGN IN VIEW (Existing User Login) ── */}
          {view === "signin" && (
            <>
              <h2 className="text-white text-3xl font-bold mb-1">Sign In</h2>
              <p className="text-gray-400 text-sm mb-2">Welcome back to FiliFlix</p>

              {error && (
                <div className="bg-orange-500/90 p-3 rounded text-white text-sm flex justify-between items-start">
                  <span>{error}</span>
                  <button onClick={clearError} className="ml-2 shrink-0"><X size={14} /></button>
                </div>
              )}

              {/* Continue with Google */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 w-full bg-white text-gray-900 py-3 rounded-md font-semibold hover:bg-gray-100 transition disabled:opacity-60 shadow-md"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="text-gray-500 text-xs uppercase tracking-wider">or sign in with password</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#333] text-white px-4 py-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#333] text-white px-4 py-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-netflix-red hover:bg-red-700 text-white py-3 rounded-md font-bold mt-2 transition flex justify-center items-center disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <div className="flex items-center gap-1">
                  <input type="checkbox" id="remember" className="w-4 h-4 bg-gray-500" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <Link href="/help" className="hover:underline">Need help?</Link>
              </div>

              <div className="text-gray-400 text-sm text-center mt-4">
                New to FiliFlix?{" "}
                <span
                  onClick={() => { setError(null); setView("signup"); }}
                  className="text-red-500 hover:underline cursor-pointer font-medium"
                >
                  Sign up now.
                </span>
              </div>
            </>
          )}

          {/* ── MAGIC LINK VIEW ── */}
          {view === "magic" && (
            <>
              <button
                onClick={() => { setError(null); setView("signup"); }}
                className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-2 transition w-fit"
              >
                <ArrowLeft size={15} /> Back to Sign Up
              </button>
              <h2 className="text-white text-3xl font-bold mb-1">Magic Link</h2>
              <p className="text-gray-400 text-sm mb-2">
                Enter your email and we'll send a link. Click it to sign in instantly — no password needed.
              </p>

              {error && (
                <div className="bg-orange-500/90 p-3 rounded text-white text-sm flex justify-between items-start">
                  <span>{error}</span>
                  <button onClick={clearError} className="ml-2 shrink-0"><X size={14} /></button>
                </div>
              )}

              <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#333] text-white px-4 py-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-bold transition flex justify-center items-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={17} />
                      Send Magic Link
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── Email Confirmation Modal (after manual sign-up) ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#141414] border border-gray-800 rounded-xl max-w-sm md:max-w-md w-full p-6 md:p-8 relative flex flex-col items-center text-center shadow-2xl">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-white transition bg-gray-800/50 hover:bg-gray-700 p-1.5 md:p-2 rounded-full"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 md:mb-6 ring-4 ring-gray-800/50">
              <Mail className="w-8 h-8 md:w-10 md:h-10 text-netflix-red" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Check your email</h2>
            <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8 leading-relaxed">
              We've sent a confirmation link to{" "}
              <span className="text-white font-medium">{email}</span>.{" "}
              Please verify your email address to complete your registration!
            </p>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="w-full bg-white text-black font-bold py-2.5 md:py-3.5 rounded-md hover:bg-gray-200 transition text-base md:text-lg"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}

      {/* ── Magic Link Sent Modal ── */}
      {showMagicModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#141414] border border-gray-800 rounded-xl max-w-sm md:max-w-md w-full p-6 md:p-8 relative flex flex-col items-center text-center shadow-2xl">
            <button
              onClick={() => setShowMagicModal(false)}
              className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-white transition bg-gray-800/50 hover:bg-gray-700 p-1.5 md:p-2 rounded-full"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 md:mb-6 ring-4 ring-indigo-800/30">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Magic link sent! ✨</h2>
            <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8 leading-relaxed">
              We sent a sign-in link to{" "}
              <span className="text-white font-medium">{email}</span>.{" "}
              Click the link in your email to instantly sign in — no password needed.
            </p>
            <button
              onClick={() => setShowMagicModal(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 md:py-3.5 rounded-md transition text-base md:text-lg"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-black flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
