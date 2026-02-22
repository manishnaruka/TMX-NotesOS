import { create } from 'zustand';
import type { ThemeVariant } from '../theme/tokens';

interface ThemeStore {
  theme: ThemeVariant;
  setTheme: (theme: ThemeVariant) => void;
  toggleMode: () => void;
  toggleStyle: () => void;
  cycleTheme: () => void;
}

const order: ThemeVariant[] = ['modern-dark', 'modern-light', 'glass-dark', 'glass-light'];

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'modern-dark',
  setTheme: (theme) => set({ theme }),
  toggleMode: () => {
    const [style, mode] = get().theme.split('-') as ['modern' | 'glass', 'dark' | 'light'];
    const nextMode = mode === 'dark' ? 'light' : 'dark';
    set({ theme: `${style}-${nextMode}` as ThemeVariant });
  },
  toggleStyle: () => {
    const [style, mode] = get().theme.split('-') as ['modern' | 'glass', 'dark' | 'light'];
    const nextStyle = style === 'glass' ? 'modern' : 'glass';
    set({ theme: `${nextStyle}-${mode}` as ThemeVariant });
  },
  cycleTheme: () => {
    const current = get().theme;
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];
    set({ theme: next });
  },
}));
