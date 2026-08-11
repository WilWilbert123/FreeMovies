// src/components/DownloadButton.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useDownload } from "@/context/DownloadContext";
import { Check, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface DownloadButtonProps {
  title: string;
  type: "movie" | "episode";
  url?: string;
  // optional id to match existing download entry for progress display
  id: string;
  onClick?: () => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ title, type, url, id, onClick }) => {
  const router = useRouter();
  const { downloads, startDownload, removeDownload } = useDownload();
  const [downloading, setDownloading] = useState(false);

  const existing = downloads.find((d) => d.id === id || d.title === title);

  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }
    
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (existing?.status === "completed") {
      // maybe remove or do nothing
      return;
    }
    setDownloading(true);
    if (url) {
      await startDownload(title, type, url);
    }
    setDownloading(false);
  };

  return (
    <button
      onClick={handleClick}
      title="Download"
      className="relative flex items-center justify-center w-10 h-10 border-2 border-gray-400 rounded-full hover:border-white bg-[#181818]/50 transition disabled:opacity-50"
      disabled={downloading || existing?.status === "downloading"}
    >
      {existing?.status === "completed" ? (
        <Check className="w-5 h-5 text-green-400" />
      ) : (
        <Download className="w-5 h-5 text-white" />
      )}
      {/* Show progress overlay when downloading */}
      {existing?.status === "downloading" && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white bg-black/75 rounded-full">
          {existing.progress}%
        </span>
      )}
    </button>
  );
};
