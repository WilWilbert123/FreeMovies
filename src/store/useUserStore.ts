import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Movie, Profile } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { Server, SERVERS } from '@/lib/servers';

interface UserState {
  myList: Movie[];
  profiles: Profile[];
  activeProfile: Profile | null;
  activeServer: Server;
  setActiveServer: (server: Server) => void;
  addToList: (movie: Movie) => Promise<void>;
  removeFromList: (id: number) => Promise<void>;
  isInList: (id: number) => boolean;
  fetchUserList: () => Promise<void>;
  setList: (movies: Movie[]) => void;
  fetchProfiles: () => Promise<void>;
  setActiveProfile: (profile: Profile | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      myList: [],
      profiles: [],
      activeProfile: null,
      activeServer: SERVERS[0],

  setActiveServer: (server) => set({ activeServer: server }),

  setList: (movies) => set({ myList: movies }),

  setActiveProfile: (profile) => {
    set({ activeProfile: profile });
    if (profile) {
      get().fetchUserList();
    } else {
      set({ myList: [] });
    }
  },

  fetchProfiles: async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('viewing_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        set({ profiles: data as Profile[] });
      }
    }
  },

  fetchUserList: async () => {
    const activeProfile = get().activeProfile;
    if (!activeProfile) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('profile_my_list')
      .select('movie_data')
      .eq('profile_id', activeProfile.id);

    if (!error && data) {
      // Extract the movie_data JSON objects back into an array of Movies
      const movies = data.map(row => row.movie_data as Movie);
      set({ myList: movies });
    }
  },

  addToList: async (movie) => {
    const activeProfile = get().activeProfile;
    if (!activeProfile) {
      alert("Please select a profile to save movies to your list.");
      return;
    }

    const currentList = get().myList;
    if (!currentList.find((m) => m.id === movie.id)) {
      // Optimistic update
      set({ myList: [...currentList, movie] });

      const supabase = createClient();
      const { error } = await supabase
        .from('profile_my_list')
        .insert({
          profile_id: activeProfile.id,
          movie_id: movie.id,
          movie_data: movie,
        });

      if (error) {
        console.error("Error saving movie to list:", error);
        // Rollback
        set({ myList: get().myList.filter((m) => m.id !== movie.id) });
      }
    }
  },

  removeFromList: async (id) => {
    const activeProfile = get().activeProfile;
    if (!activeProfile) {
      alert("Please select a profile to manage your list.");
      return;
    }

    // Optimistic update
    const previousList = get().myList;
    set({ myList: previousList.filter((m) => m.id !== id) });

    const supabase = createClient();
    const { error } = await supabase
      .from('profile_my_list')
      .delete()
      .eq('profile_id', activeProfile.id)
      .eq('movie_id', id);

    if (error) {
      console.error("Error removing movie from list:", error);
      // Rollback
      set({ myList: previousList });
    }
  },

  isInList: (id) => {
    return get().myList.some((m) => m.id === id);
  },
}), { name: 'freemovies-user-store' }));
