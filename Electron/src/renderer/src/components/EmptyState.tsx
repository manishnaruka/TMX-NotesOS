import logoIcon from '../assets/logo_icon.png'
import { Plus } from 'lucide-react'

interface EmptyStateProps {
  onNewNote?: () => void
}

export function EmptyState({ onNewNote }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-transparent">
      <div className="text-center max-w-sm">
        <img src={logoIcon} alt="TMX Notes" className="mx-auto w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-lg font-medium text-[var(--text-secondary)] mb-1">Select a note</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Choose a note from the sidebar{onNewNote ? ' or create a new one' : ''}
        </p>
        {onNewNote && (
          <button
            onClick={onNewNote}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white glass-btn-primary rounded-xl"
          >
            <Plus size={16} />
            New Note
          </button>
        )}
      </div>
    </div>
  )
}
