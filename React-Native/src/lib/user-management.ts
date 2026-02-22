import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { SUPERADMIN_EMAIL } from '@env';
import type { AllowedUser, UserRole } from '../types/note';
import { db } from './firebase';

const ALLOWED_USERS_COLLECTION = 'allowedUsers';

export function isSuperAdmin(email: string | null): boolean {
  return email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
}

export async function checkUserAllowed(
  email: string,
): Promise<{ allowed: boolean; role: UserRole }> {
  if (isSuperAdmin(email)) {
    return { allowed: true, role: 'superadmin' };
  }

  const q = query(collection(db, ALLOWED_USERS_COLLECTION), where('email', '==', email.toLowerCase()));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return { allowed: false, role: 'user' };
  }

  const userData = snapshot.docs[0].data();
  return { allowed: true, role: (userData.role as UserRole) || 'user' };
}

export async function addAllowedUser(email: string, role: UserRole, addedByEmail: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const docRef = doc(db, ALLOWED_USERS_COLLECTION, normalizedEmail);
  await setDoc(docRef, {
    email: normalizedEmail,
    role,
    addedBy: addedByEmail,
    addedAt: serverTimestamp(),
  });
}

export async function removeAllowedUser(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  await deleteDoc(doc(db, ALLOWED_USERS_COLLECTION, normalizedEmail));
}

export async function updateUserRole(email: string, role: UserRole): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  await setDoc(doc(db, ALLOWED_USERS_COLLECTION, normalizedEmail), { role }, { merge: true });
}

export function subscribeToAllowedUsers(
  callback: (users: AllowedUser[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, ALLOWED_USERS_COLLECTION),
    (snapshot) => {
      const users = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      })) as AllowedUser[];

      users.sort((a, b) => a.email.localeCompare(b.email));
      callback(users);
    },
    (err) => onError(err),
  );
}
