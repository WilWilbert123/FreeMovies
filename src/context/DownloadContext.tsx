// src/context/DownloadContext.tsx

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { downloadManager, DownloadItem } from "@/lib/downloadManager";

interface DownloadContextValue {
  downloads: DownloadItem[];
  startDownload: (title: string, type: "movie" | "episode", url: string) => Promise<void>;
  removeDownload: (id: string) => Promise<void>;
}

const DownloadContext = createContext<DownloadContextValue | undefined>(undefined);

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  // Simple polling to keep UI in sync with the manager
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads(downloadManager.getDownloads());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const startDownload = async (title: string, type: "movie" | "episode", url: string) => {
    await downloadManager.enqueueDownload({ title, type, url });
    setDownloads(downloadManager.getDownloads());
  };

  const removeDownload = async (id: string) => {
    await downloadManager.removeDownload(id);
    setDownloads(downloadManager.getDownloads());
  };

  return (
    <DownloadContext.Provider value={{ downloads, startDownload, removeDownload }}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownload = (): DownloadContextValue => {
  const ctx = useContext(DownloadContext);
  if (!ctx) throw new Error("useDownload must be used within a DownloadProvider");
  return ctx;
};
