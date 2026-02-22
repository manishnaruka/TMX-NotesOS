import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { subscribeToNotes } from '../lib/firestore';
import type { Note } from '../types/note';

export function useNotes(user: User | null, isSuperAdmin: boolean) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToNotes(
      (notesList) => {
        setNotes(notesList);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
      user.email ?? '',
      isSuperAdmin,
    );

    return () => unsubscribe();
  }, [user?.uid, user?.email, isSuperAdmin]);

  return { notes, loading, error };
}
