import { useState } from 'react'
import { signOut } from '../hooks/useAuth'
import logoIcon from '../assets/logo_icon.png'

interface UnauthorizedScreenProps {
  email: string
}

export function UnauthorizedScreen({ email }: UnauthorizedScreenProps) {
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } catch (err) {
      console.error('Failed to sign out:', err)
      setSigningOut(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen gradient-bg">
      <div className="w-full max-w-sm px-8 py-10 glass-card text-center">
        <img src={logoIcon} alt="TMX Notes" className="w-16 h-16 mb-4 mx-auto opacity-40" />
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Access Denied</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          <span className="font-medium text-[var(--text-primary)]">{email}</span> is not authorized to use this
          app. Contact your administrator to request access.
        </p>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-6 w-full px-4 py-2.5 glass-btn rounded-xl text-sm font-medium text-[var(--text-secondary)] disabled:opacity-50"
        >
          {signingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}
