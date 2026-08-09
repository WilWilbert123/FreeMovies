import { create } from 'zustand';

interface IntroState {
  isIntroPlaying: boolean;
  setIsIntroPlaying: (isPlaying: boolean) => void;
}

export const useIntroStore = create<IntroState>((set) => ({
  isIntroPlaying: true, // Default true to match the initial render of the IntroAnimation
  setIsIntroPlaying: (isPlaying) => set({ isIntroPlaying: isPlaying }),
}));
