import { useNoteStore } from '../stores/note-store'
import { Search, X } from 'lucide-react'

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useNoteStore()

  return (
    <div className="px-3 py-2">
      <div className="relative">
        <Search
          size={15}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="text"
          placeholder="Search notes…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] glass-input rounded-lg focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
