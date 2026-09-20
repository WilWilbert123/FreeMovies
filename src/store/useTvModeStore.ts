import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

interface TvModeState {
  isTvMode: boolean;
  isGuideOpen: boolean;
  hasSeenGuideOnStartup: boolean;
  setTvMode: (enabled: boolean) => void;
  toggleTvMode: () => void;
  setIsGuideOpen: (open: boolean) => void;
  setHasSeenGuideOnStartup: (seen: boolean) => void;
  initTvDetection: () => void;
}

export const useTvModeStore = create<TvModeState>((set, get) => ({
  isTvMode: false,
  isGuideOpen: false,
  hasSeenGuideOnStartup: false,

  setTvMode: (enabled: boolean) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('filiflix_tv_mode', enabled ? 'true' : 'false');
        if (enabled) {
          document.documentElement.classList.add('tv-mode');
        } else {
          document.documentElement.classList.remove('tv-mode');
        }
      } catch (e) {
        console.error('Failed to save TV mode setting', e);
      }

      // Sync with Supabase if logged in
      try {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.auth.updateUser({
              data: { ...user.user_metadata, tv_mode: enabled }
            }).catch(() => {});
          }
        });
      } catch (e) {}
    }
    set({ isTvMode: enabled });
  },

  toggleTvMode: () => {
    const current = get().isTvMode;
    get().setTvMode(!current);
  },

  setIsGuideOpen: (open: boolean) => set({ isGuideOpen: open }),

  setHasSeenGuideOnStartup: (seen: boolean) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('filiflix_guide_dismissed', seen ? 'true' : 'false');
      } catch (e) {
        console.error('Failed to save guide dismissal setting', e);
      }

      // Sync with Supabase if logged in
      try {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.auth.updateUser({
              data: { ...user.user_metadata, guide_dismissed: seen }
            }).catch(() => {});
          }
        });
      } catch (e) {}
    }
    set({ hasSeenGuideOnStartup: seen });
  },

  initTvDetection: async () => {
    if (typeof window === 'undefined') return;

    try {
      const storedTvMode = localStorage.getItem('filiflix_tv_mode');
      const isDismissed = localStorage.getItem('filiflix_guide_dismissed') === 'true';
      set({ hasSeenGuideOnStartup: isDismissed });

      // Check if user has preferences saved in Supabase
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata) {
          if (typeof user.user_metadata.tv_mode === 'boolean' && storedTvMode === null) {
            set({ isTvMode: user.user_metadata.tv_mode });
            if (user.user_metadata.tv_mode) document.documentElement.classList.add('tv-mode');
          }
          if (typeof user.user_metadata.guide_dismissed === 'boolean' && localStorage.getItem('filiflix_guide_dismissed') === null) {
            set({ hasSeenGuideOnStartup: user.user_metadata.guide_dismissed });
            localStorage.setItem('filiflix_guide_dismissed', user.user_metadata.guide_dismissed ? 'true' : 'false');
          }
        }
      } catch (e) {}

      if (storedTvMode !== null) {
        const isTv = storedTvMode === 'true';
        set({ isTvMode: isTv });
        if (isTv) document.documentElement.classList.add('tv-mode');
      } else {
        // Auto-detect TV user agents (Android TV, WebOS, Tizen, AppleTV, etc.)
        const ua = window.navigator.userAgent.toLowerCase();
        const isTvDevice =
          /smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast|viera|bravia|tizen|webos|android.*tv|aftb|aftm|aftt|afts|crkey/i.test(ua) ||
          ((window.navigator as any).userAgentData?.mobile === false && window.innerWidth >= 1280 && ('ontouchstart' in window === false) && /android/i.test(ua));

        if (isTvDevice) {
          set({ isTvMode: true });
          document.documentElement.classList.add('tv-mode');
          localStorage.setItem('filiflix_tv_mode', 'true');
        }
      }
    } catch (e) {
      console.error('Error during TV detection init', e);
    }
  }
}));
