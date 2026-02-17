import { useCallback, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { NoteEditor } from './components/NoteEditor'
import { EmptyState } from './components/EmptyState'
import { LoginScreen } from './components/LoginScreen'
import { UnauthorizedScreen } from './components/UnauthorizedScreen'
import { useNotes } from './hooks/useNotes'
import { useNote } from './hooks/useNote'
import { useAuth } from './hooks/useAuth'
import { useNoteStore } from './stores/note-store'
import { createNote, deleteNote, togglePinNote } from './lib/firestore'
import logoIcon from './assets/logo_icon.png'

export default function App() {
  const { user, loading: authLoading, role, authorized } = useAuth()
  const { notes, loading } = useNotes(user?.uid ?? '')
  const { selectedNoteId, setSelectedNoteId } = useNoteStore()
  const { note: activeNote } = useNote(selectedNoteId)

  const isSuperAdmin = role === 'superadmin'

  const handleNewNote = useCallback(async () => {
    if (!user || role !== 'superadmin') return
    try {
      const id = await createNote(user)
      setSelectedNoteId(id)
    } catch (err) {
      console.error('Failed to create note:', err)
    }
  }, [user, role, setSelectedNoteId])

  const handleDelete = useCallback(
    async (noteId: string) => {
      if (!user || role !== 'superadmin') return
      try {
        await deleteNote(noteId, user)
        if (selectedNoteId === noteId) {
          setSelectedNoteId(null)
        }
      } catch (err) {
        console.error('Failed to delete note:', err)
      }
    },
    [user, role, selectedNoteId, setSelectedNoteId]
  )

  const handleTogglePin = useCallback(
    async (noteId: string, isPinned: boolean) => {
      if (!user) return
      try {
        await togglePinNote(noteId, isPinned, user)
      } catch (err) {
        console.error('Failed to toggle pin:', err)
      }
    },
    [user]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isSuperAdmin && (e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleNewNote()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isSuperAdmin, handleNewNote])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen gradient-bg">
        <div className="flex flex-col items-center gap-3">
          <img src={logoIcon} alt="TMX Notes" className="w-12 h-12 animate-pulse" />
          <p className="text-sm text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  if (!authorized) {
    return <UnauthorizedScreen email={user.email || 'Unknown'} />
  }

  return (
    <div className="flex h-screen gradient-bg">
      <Sidebar
        notes={notes}
        loading={loading}
        onNewNote={handleNewNote}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
        user={user}
        role={role!}
        isSuperAdmin={isSuperAdmin}
      />
      <main className="flex-1 flex flex-col min-w-0">
        {activeNote ? (
          <NoteEditor key={activeNote.id} note={activeNote} user={user} />
        ) : (
          <EmptyState onNewNote={isSuperAdmin ? handleNewNote : undefined} />
        )}
      </main>
    </div>
  )
}
