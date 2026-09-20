import { create } from 'zustand';

interface IntroState {
  isIntroPlaying: boolean;
  hasIntroFinished: boolean;
  setIsIntroPlaying: (isPlaying: boolean) => void;
  finishIntro: () => void;
}

export const useIntroStore = create<IntroState>((set) => ({
  isIntroPlaying: true,
  hasIntroFinished: false,
  setIsIntroPlaying: (isPlaying) => set({ isIntroPlaying: isPlaying }),
  finishIntro: () => set({ isIntroPlaying: false, hasIntroFinished: true }),
}));
