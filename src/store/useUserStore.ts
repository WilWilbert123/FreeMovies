import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Movie } from '@/types';

interface UserState {
  myList: Movie[];
  addToList: (movie: Movie) => void;
  removeFromList: (id: number) => void;
  isInList: (id: number) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      myList: [],
      addToList: (movie) => {
        const currentList = get().myList;
        if (!currentList.find((m) => m.id === movie.id)) {
          set({ myList: [...currentList, movie] });
        }
      },
      removeFromList: (id) => {
        set({ myList: get().myList.filter((m) => m.id !== id) });
      },
      isInList: (id) => {
        return get().myList.some((m) => m.id === id);
      },
    }),
    {
      name: 'freemovies-user-storage', // name of the item in the storage (must be unique)
    }
  )
);
