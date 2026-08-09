import { create } from 'zustand';

interface OnlineState {
  onlineUsers: string[];
  setOnlineUsers: (users: string[]) => void;
}

export const useOnlineStore = create<OnlineState>((set) => ({
  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));
