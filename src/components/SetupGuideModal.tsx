"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  Tv,
  ExternalLink,
  X,
  Zap,
  CheckCircle2,
  Wifi,
  Compass,
  Copy,
  Check,
  Download
} from "lucide-react";
import { useTvModeStore } from "@/store/useTvModeStore";

export default function SetupGuideModal() {
  const {
    isTvMode,
    toggleTvMode,
    isGuideOpen,
    setIsGuideOpen,
    hasSeenGuideOnStartup,
    setHasSeenGuideOnStartup,
    initTvDetection
  } = useTvModeStore();

  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [copiedDns, setCopiedDns] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Sync PWA install prompt & TV detection
  useEffect(() => {
    initTvDetection();
    if (typeof window !== "undefined") {
      const isDismissed = localStorage.getItem("filiflix_guide_dismissed") === "true";
      setDontShowAgain(isDismissed);

      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }
  }, [initTvDetection]);

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsGuideOpen(false);
      }
    };
    if (isGuideOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isGuideOpen, setIsGuideOpen]);

  const handleClose = () => {
    setHasSeenGuideOnStartup(dontShowAgain);
    setIsGuideOpen(false);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setDontShowAgain(checked);
    setHasSeenGuideOnStartup(checked);
  };

  const handleCopyDns = () => {
    navigator.clipboard.writeText("DNS 1: 94.140.14.14\nDNS 2: 94.140.15.15");
    setCopiedDns(true);
    setTimeout(() => setCopiedDns(false), 2000);
  };

  const openInCompactWindow = (url: string) => {
    if (typeof window !== "undefined") {
      const width = 650;
      const height = 750;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      window.open(
        url,
        "InstallerPopup",
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
      );
    }
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <AnimatePresence>
      {isGuideOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Dead-Centered 1-Page Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="relative w-full max-w-4xl bg-[#141414] border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col m-auto"
          >
            {/* Header */}
            <div className="relative px-5 py-3.5 sm:px-6 sm:py-4 border-b border-gray-800 bg-gradient-to-r from-red-950/40 via-black/60 to-black/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-500 shrink-0">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-base sm:text-xl font-bold text-white tracking-wide truncate">
                    FiliFlix Ad-Free Setup Guide
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">
                    Zero popup ads & smooth playback for PC, Mobile & Smart TV
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/10 hover:bg-red-600 text-white border border-white/20 hover:border-red-500 transition cursor-pointer font-bold text-xs sm:text-sm shadow-md shrink-0"
                aria-label="Close Guide Modal"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4 text-gray-300 text-xs sm:text-sm leading-relaxed">
              {/* Intro Alert Banner */}
              <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" />
                <p className="text-xs sm:text-sm text-red-200/90 leading-snug">
                  Streaming servers try to trigger popup ads. Follow the recommendations below for a 100% ad-free experience!
                </p>
              </div>

              {/* 2x2 Grid of Ad-Free Solutions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                {/* 1. TV Bro Browser (Android TV / Google TV) */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3.5 sm:p-4 hover:border-gray-700 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                          <Tv className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-white text-xs sm:text-sm truncate">1. TV Bro Browser</h3>
                          <span className="text-[11px] text-blue-400 font-medium">Android TV / Google TV</span>
                        </div>
                      </div>

                      {/* Google Play Button */}
                      <button
                        onClick={() => openInCompactWindow("https://play.google.com/store/apps/details?id=com.phlox.tvwebbrowser&hl=en")}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition cursor-pointer shadow-sm shadow-blue-900/30 shrink-0"
                        title="Open Google Play Store"
                      >
                        <span>Google Play</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <ul className="text-xs space-y-1.5 text-gray-400 border-t border-gray-800/80 pt-2.5">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span><strong>Built-in Ad Blocker:</strong> Kills all video host popups</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span><strong>TV Remote Optimized:</strong> D-pad virtual mouse cursor</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Hardware video acceleration prevents video stutter</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 2. AdGuard DNS for Any TV */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3.5 sm:p-4 hover:border-gray-700 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                          <Wifi className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-white text-xs sm:text-sm truncate">2. AdGuard DNS for Any TV</h3>
                          <span className="text-[11px] text-emerald-400 font-medium">Samsung, LG & All Smart TVs</span>
                        </div>
                      </div>

                      <button
                        onClick={handleCopyDns}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-semibold text-xs rounded-lg transition shrink-0 cursor-pointer"
                      >
                        {copiedDns ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy DNS</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 border-t border-gray-800/80 pt-2">
                      TV <strong className="text-gray-200">Settings → Network → Wi-Fi / IP Settings → DNS</strong>:
                    </p>

                    <div className="mt-2 p-2 bg-black/60 rounded-lg border border-gray-800 flex items-center justify-between font-mono text-xs text-emerald-400">
                      <span>DNS 1: 94.140.14.14</span>
                      <span className="text-gray-600">|</span>
                      <span>DNS 2: 94.140.15.15</span>
                    </div>
                  </div>
                </div>

                {/* 3. uBlock Origin Lite (PC / Chrome / Edge) */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3.5 sm:p-4 hover:border-gray-700 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-white text-xs sm:text-sm truncate">3. uBlock Origin Lite</h3>
                          <span className="text-[11px] text-red-400 font-medium">Chrome, Edge & Opera (PC)</span>
                        </div>
                      </div>

                      <button
                        onClick={() => openInCompactWindow("https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh?hl=en&pli=1")}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition shrink-0 cursor-pointer shadow-sm shadow-red-900/30"
                      >
                        <span>Install</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <ul className="text-xs space-y-1.5 text-gray-400 border-t border-gray-800/80 pt-2.5">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Stops 100% of video player popup tabs & redirects</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Ultra-lightweight: zero CPU lag or battery drain</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 4. Brave Browser (Mobile & All Devices) */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3.5 sm:p-4 hover:border-gray-700 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-white text-xs sm:text-sm truncate">4. Brave Browser</h3>
                          <span className="text-[11px] text-orange-400 font-medium">Android, iOS, Win & Mac</span>
                        </div>
                      </div>

                      <button
                        onClick={() => openInCompactWindow("https://brave.com/")}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs rounded-lg transition shrink-0 cursor-pointer shadow-sm"
                      >
                        <span>Get Brave</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <ul className="text-xs space-y-1.5 text-gray-400 border-t border-gray-800/80 pt-2.5">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Built-in Shields: No extensions needed, blocks ads natively</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>3x faster page loads with low data consumption</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Controls */}
            <div className="px-5 py-3 sm:px-6 sm:py-3.5 bg-black/70 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-gray-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-red-600 focus:ring-red-600/30 focus:ring-offset-0 transition cursor-pointer"
                  />
                  <span>Don't show this guide on startup</span>
                </label>

                {/* 1-Click Install FiliFlix App (PWA) Button if available */}
                {deferredPrompt && (
                  <button
                    onClick={handleInstallPwa}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-lg transition border border-gray-700 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install FiliFlix App</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Got It, Start Watching</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
