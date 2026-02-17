import { useState } from 'react'
import type { User } from 'firebase/auth'
import type { Note, UserRole } from '../types/note'
import { SearchBar } from './SearchBar'
import { NoteList } from './NoteList'
import { UserManagement } from './UserManagement'
import { ThemeToggle } from './ThemeToggle'
import { signOut } from '../hooks/useAuth'
import { Plus, Users, LogOut } from 'lucide-react'

interface SidebarProps {
  notes: Note[]
  loading: boolean
  onNewNote: () => void
  onDelete: (noteId: string) => void
  onTogglePin: (noteId: string, isPinned: boolean) => void
  user: User
  role: UserRole
  isSuperAdmin: boolean
}

export function Sidebar({
  notes,
  loading,
  onNewNote,
  onDelete,
  onTogglePin,
  user,
  role,
  isSuperAdmin
}: SidebarProps) {
  const [signingOut, setSigningOut] = useState(false)
  const [showUserManagement, setShowUserManagement] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } catch (err) {
      console.error('Failed to sign out:', err)
      setSigningOut(false)
    }
  }

  const canManageUsers = role === 'superadmin' || role === 'admin'

  return (
    <>
      <aside className="w-72 h-full glass flex flex-col select-none">
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Notes</h1>
          {isSuperAdmin && (
            <button
              onClick={onNewNote}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white glass-btn-primary rounded-lg"
              title="New Note (Ctrl+N)"
            >
              <Plus size={14} strokeWidth={2.5} />
              New
            </button>
          )}
        </div>
        <SearchBar />
        <NoteList
          notes={notes}
          loading={loading}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
          isSuperAdmin={isSuperAdmin}
        />
        <div className="px-3 py-2 border-t border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-muted)] text-center mb-2">{notes.length} notes</p>
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-6 h-6 rounded-full flex-shrink-0 ring-1 ring-[var(--avatar-ring)]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[var(--avatar-fallback-bg)] flex items-center justify-center flex-shrink-0 ring-1 ring-[var(--avatar-ring)]">
                <span className="text-[10px] font-medium text-[var(--avatar-fallback-text)]">
                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                {user.displayName || 'User'}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
            </div>
            {canManageUsers && (
              <button
                onClick={() => setShowUserManagement(true)}
                className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex-shrink-0"
                title="Manage users"
              >
                <Users size={15} />
              </button>
            )}
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex-shrink-0 disabled:opacity-50"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {showUserManagement && (
        <UserManagement
          currentUserEmail={user.email!}
          currentUserRole={role}
          onClose={() => setShowUserManagement(false)}
        />
      )}
    </>
  )
}
