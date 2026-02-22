import { useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut as firebaseSignOut } from 'firebase/auth';
import { GOOGLE_WEB_CLIENT_ID, IOS_CLIENT_ID } from '@env';
import { auth } from '../lib/firebase';
import { checkUserAllowed } from '../lib/user-management';
import { useAuthStore } from '../stores/auth-store';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID,
  offlineAccess: false,
});

export function useAuth() {
  const { user, loading, role, authorized, setUser, setLoading, setAuthorization } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser?.email) {
        try {
          const result = await checkUserAllowed(firebaseUser.email);
          setAuthorization(result.allowed, result.role);
        } catch {
          setAuthorization(false, null);
        }
      } else {
        setAuthorization(null, null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setAuthorization, setLoading, setUser]);

  return { user, loading, role, authorized };
}

export async function signInWithGoogle(): Promise<void> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  const idToken = (result as { idToken?: string; data?: { idToken?: string } }).idToken ?? result.data?.idToken;

  if (!idToken) {
    throw new Error('Google sign-in failed: missing ID token.');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
}

export async function signOut(): Promise<void> {
  await GoogleSignin.signOut().catch(() => undefined);
  await firebaseSignOut(auth);
}
