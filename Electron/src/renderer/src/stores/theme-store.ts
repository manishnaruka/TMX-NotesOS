import { create } from 'zustand'

export type ThemeStyle = 'glass' | 'minimal'
export type ThemeMode = 'dark' | 'light'
export type ThemeId = `${ThemeStyle}-${ThemeMode}`

interface ThemeStore {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
  toggleMode: () => void
  toggleStyle: () => void
}

function getInitialTheme(): ThemeId {
  const stored = localStorage.getItem('tmx-theme')
  if (stored === 'glass-dark' || stored === 'glass-light' || stored === 'minimal-dark' || stored === 'minimal-light') {
    return stored
  }
  return 'glass-dark'
}

function applyTheme(theme: ThemeId): void {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('tmx-theme', theme)
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  toggleMode: () => {
    const current = get().theme
    const [style, mode] = current.split('-') as [ThemeStyle, ThemeMode]
    const newTheme: ThemeId = `${style}-${mode === 'dark' ? 'light' : 'dark'}`
    applyTheme(newTheme)
    set({ theme: newTheme })
  },
  toggleStyle: () => {
    const current = get().theme
    const [style, mode] = current.split('-') as [ThemeStyle, ThemeMode]
    const newTheme: ThemeId = `${style === 'glass' ? 'minimal' : 'glass'}-${mode}`
    applyTheme(newTheme)
    set({ theme: newTheme })
  }
}))
