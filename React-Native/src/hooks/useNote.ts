import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Note } from '../types/note';
import { db } from '../lib/firebase';

export function useNote(noteId: string | null) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!noteId) {
      setNote(null);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, 'notes', noteId),
      (snapshot) => {
        if (snapshot.exists()) {
          setNote({ id: snapshot.id, ...snapshot.data() } as Note);
        } else {
          setNote(null);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [noteId]);

  return { note, loading };
}
