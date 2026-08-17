import { create } from 'zustand';

export interface OnlineUser {
  id: string;
  device?: string;
  browser?: string;
  location?: string;
}

interface OnlineState {
  onlineUsers: OnlineUser[];
  setOnlineUsers: (users: OnlineUser[]) => void;
}

export const useOnlineStore = create<OnlineState>((set) => ({
  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));
