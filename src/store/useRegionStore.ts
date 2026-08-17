import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RegionState {
  selectedRegion: string;
  setRegion: (region: string) => void;
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set) => ({
      selectedRegion: 'ALL',
      setRegion: (region) => set({ selectedRegion: region }),
    }),
    {
      name: 'region-storage',
    }
  )
);
