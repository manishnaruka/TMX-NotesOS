import { useState, useEffect } from 'react'
import type { AllowedUser, UserRole } from '../types/note'
import {
  subscribeToAllowedUsers,
  addAllowedUser,
  removeAllowedUser,
  updateUserRole,
  isSuperAdmin
} from '../lib/user-management'
import { X, Trash2 } from 'lucide-react'

interface UserManagementProps {
  currentUserEmail: string
  currentUserRole: UserRole
  onClose: () => void
}

export function UserManagement({
  currentUserEmail,
  currentUserRole,
  onClose
}: UserManagementProps) {
  const [users, setUsers] = useState<AllowedUser[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('user')
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToAllowedUsers(
      (usersList) => setUsers(usersList),
      (err) => setError(err.message)
    )
    return () => unsubscribe()
  }, [])

  const handleAdd = async () => {
    const email = newEmail.trim().toLowerCase()
    if (!email) return

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (isSuperAdmin(email)) {
      setError('Superadmin is always authorized and cannot be added here')
      return
    }

    setError(null)
    setAdding(true)
    try {
      await addAllowedUser(email, newRole, currentUserEmail)
      setNewEmail('')
      setNewRole('user')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user')
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (email: string) => {
    try {
      await removeAllowedUser(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user')
    }
  }

  const handleRoleChange = async (email: string, role: UserRole) => {
    try {
      await updateUserRole(email, role)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    }
  }

  const canManageUsers = currentUserRole === 'superadmin' || currentUserRole === 'admin'

  return (
    <div className="fixed inset-0 bg-[var(--overlay-bg)] backdrop-blur-md flex items-center justify-center z-50">
      <div className="glass-card w-full max-w-lg mx-4 max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">User Management</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Add user form */}
        {canManageUsers && (
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="user@gmail.com"
                className="flex-1 px-3 py-2 glass-input rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="px-2 py-2 glass-input rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
              >
                <option value="user">User</option>
                {currentUserRole === 'superadmin' && <option value="admin">Admin</option>}
              </select>
              <button
                onClick={handleAdd}
                disabled={adding || !newEmail.trim()}
                className="px-3 py-2 glass-btn-primary text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? '...' : 'Add'}
              </button>
            </div>
            {error && <p className="text-xs text-[var(--error-text)] mt-2">{error}</p>}
          </div>
        )}

        {/* User list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {/* Superadmin (always shown, not removable) */}
          <div className="flex items-center justify-between py-2.5 border-b border-[var(--border)]">
            <div className="min-w-0">
              <p className="text-sm text-[var(--text-primary)] truncate">
                {import.meta.env.VITE_SUPERADMIN_EMAIL}
              </p>
              <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)]">
                superadmin
              </span>
            </div>
          </div>

          {users.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] text-center py-6">
              No additional users added yet
            </p>
          )}

          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between py-2.5 border-b border-[var(--border)] group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[var(--text-primary)] truncate">{u.email}</p>
                {canManageUsers && currentUserRole === 'superadmin' ? (
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.email, e.target.value as UserRole)}
                    className="mt-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-secondary)] focus:outline-none"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                ) : (
                  <span
                    className={`inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded ${
                      u.role === 'admin'
                        ? 'bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]'
                        : 'bg-[var(--badge-muted-bg)] text-[var(--badge-muted-text)]'
                    }`}
                  >
                    {u.role}
                  </span>
                )}
              </div>
              {canManageUsers && (
                <button
                  onClick={() => handleRemove(u.email)}
                  className="p-1 rounded hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ml-2"
                  title="Remove user"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-muted)] text-center">
            {users.length} user{users.length !== 1 ? 's' : ''} + 1 superadmin
          </p>
        </div>
      </div>
    </div>
  )
}
