import type { Note } from '../types/note'
import { NoteListItem } from './NoteListItem'
import { useNoteStore } from '../stores/note-store'

interface NoteListProps {
  notes: Note[]
  loading: boolean
  onDelete: (noteId: string) => void
  onTogglePin: (noteId: string, isPinned: boolean) => void
  isSuperAdmin: boolean
}

export function NoteList({ notes, loading, onDelete, onTogglePin, isSuperAdmin }: NoteListProps) {
  const searchQuery = useNoteStore((s) => s.searchQuery)

  const filteredNotes = searchQuery
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.plainTextPreview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-3 py-3 border-b border-[var(--border)] animate-pulse">
            <div className="h-4 bg-[var(--skeleton-1)] rounded w-3/4 mb-2" />
            <div className="h-3 bg-[var(--skeleton-2)] rounded w-full mb-1" />
            <div className="h-2.5 bg-[var(--skeleton-2)] rounded w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  if (filteredNotes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <p className="text-sm text-[var(--text-muted)] text-center">
          {searchQuery ? 'No notes match your search' : 'No notes yet. Create one!'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredNotes.map((note) => (
        <NoteListItem
          key={note.id}
          note={note}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
          isSuperAdmin={isSuperAdmin}
        />
      ))}
    </div>
  )
}
