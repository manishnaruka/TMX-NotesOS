import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { UserRole } from '../types/note';

interface AuthStore {
  user: User | null;
  loading: boolean;
  role: UserRole | null;
  authorized: boolean | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthorization: (authorized: boolean | null, role: UserRole | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  role: null,
  authorized: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setAuthorization: (authorized, role) => set({ authorized, role }),
}));
