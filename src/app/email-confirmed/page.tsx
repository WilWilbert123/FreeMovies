// src/app/email-confirmed/page.tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function EmailConfirmed() {
  // Optional: automatically go to the login page after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to the login page after 5 seconds
      window.location.href = "/login";
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-4">
      <div className="max-w-md rounded-xl bg-black/70 p-8 text-center shadow-2xl backdrop-blur-lg">
        <h1 className="mb-4 text-3xl font-bold text-white">✅ Email verified!</h1>
        <p className="mb-6 text-lg text-gray-300">
          Your account is now active. You can safely sign in and start streaming.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-md bg-[#e50914] px-6 py-3 text-sm font-semibold text-white hover:bg-[#b2070e] transition-colors"
        >
          Go back to Sign In now
        </Link>
        <p className="mt-4 text-sm text-gray-400">
          (You’ll be redirected automatically in a few seconds…)
        </p>
      </div>
    </div>
  );
}
