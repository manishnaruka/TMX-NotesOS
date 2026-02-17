import { useThemeStore } from '../stores/theme-store'
import { Sun, Moon, Layers, Square } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleMode, toggleStyle } = useThemeStore()
  const [style, mode] = theme.split('-') as ['glass' | 'minimal', 'dark' | 'light']

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggleMode}
        className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex-shrink-0"
        title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>
      <button
        onClick={toggleStyle}
        className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex-shrink-0"
        title={style === 'glass' ? 'Switch to minimal style' : 'Switch to glass style'}
      >
        {style === 'glass' ? <Square size={15} /> : <Layers size={15} />}
      </button>
    </div>
  )
}
