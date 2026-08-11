// src/lib/downloadManager.ts

/**
 * Simple download manager using the File System Access API.
 * Streams a video file, writes it to a user‑chosen location, and reports progress.
 */

export type DownloadStatus = "queued" | "downloading" | "completed" | "error";

export interface DownloadItem {
  id: string;
  title: string;
  type: "movie" | "episode";
  url: string;
  progress: number; // 0‑100
  status: DownloadStatus;
  fileHandle?: any; // from File System Access API
  blobUrl?: string; // fallback for playback if stored in memory
}

class DownloadManager {
  private downloads: Map<string, DownloadItem> = new Map();

  /** Get current list of downloads */
  getDownloads(): DownloadItem[] {
    return Array.from(this.downloads.values());
  }

  /** Enqueue a new download */
  async enqueueDownload(item: Omit<DownloadItem, "id" | "progress" | "status">): Promise<DownloadItem> {
    const id = crypto.randomUUID();
    const download: DownloadItem = {
      ...item,
      id,
      progress: 0,
      status: "queued",
    };
    this.downloads.set(id, download);
    // Start the download asynchronously, but don't await to keep UI responsive
    this.startDownload(download);
    return download;
  }

  /** Core download logic */
  async startDownload(item: DownloadItem): Promise<void> {
    try {
      item.status = "downloading";
      // Prompt the user for a save location
      const options = {
        suggestedName: `${item.title}.mp4`,
        types: [{ description: "MP4 Video", accept: { "video/mp4": [".mp4"] } }],
      };

      // Try File System Access API if available
      let handle: any = null;
      const useFSAPI = typeof window !== "undefined" && typeof (window as any).showSaveFilePicker === "function";
      if (useFSAPI) {
        try {
          handle = await (window as any).showSaveFilePicker(options);
        } catch (e: any) {
          if (e.name === "AbortError") {
            console.warn("User cancelled the save file dialog.");
            item.status = "error";
            return;
          }
          console.error("showSaveFilePicker error", e);
          // fallback to anchor download
        }
      }

      // Fetch the video stream
      let response: Response | null = null;
      try {
        response = await fetch(item.url);
        if (!response || !response.ok || !response.body) {
          throw new Error(`Failed to fetch video stream: ${response?.statusText || 'Server error'}`);
        }
      } catch (fetchErr) {
        console.error("Download fetch error:", fetchErr);
        item.status = "error";
        return;
      }

      // If FS API is available and we have a handle, stream to file
      if (handle && response && response.body) {
        const writable = await handle.createWritable();
        const contentLength = Number(response.headers.get("Content-Length")) || 0;
        await this.streamToWritable(response.body, writable, item, contentLength);
        await writable.close();
        item.fileHandle = handle;
        item.progress = 100;
        item.status = "completed";
        return;
      }

      // Fallback: download via blob and anchor element
      if (response) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${item.title}.mp4`;
        a.click();
        URL.revokeObjectURL(url);
        item.progress = 100;
        item.status = "completed";
      }
    } catch (e) {
      console.error("Download error", e);
      item.status = "error";
    }
  }

  // Helper to stream response body to a WritableStream with progress updates
  async streamToWritable(
    body: ReadableStream<Uint8Array>,
    writable: any,
    item: DownloadItem,
    contentLength: number
  ): Promise<void> {
    let loaded = 0;
    const reader = body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      await writable.write(value);
      loaded += value ? value.length : 0;
      if (contentLength > 0) {
        item.progress = Math.round((loaded / contentLength) * 100);
      } else {
        item.progress = Math.min(item.progress + 1, 99);
      }
    }
  }

  /** Remove a download entry */
  async removeDownload(id: string): Promise<void> {
    const item = this.downloads.get(id);
    if (!item) return;
    this.downloads.delete(id);
  }
}

export const downloadManager = new DownloadManager();
