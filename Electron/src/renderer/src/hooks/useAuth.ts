import { useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { useAuthStore } from '../stores/auth-store'
import { checkUserAllowed } from '../lib/user-management'

export function useAuth() {
  const { user, loading, role, authorized, setUser, setLoading, setAuthorization } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser?.email) {
        const result = await checkUserAllowed(firebaseUser.email)
        setAuthorization(result.allowed, result.role)
      } else {
        setAuthorization(null, null)
      }

      setLoading(false)
    })
    return () => unsubscribe()
  }, [setUser, setLoading, setAuthorization])

  return { user, loading, role, authorized }
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider)
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}
