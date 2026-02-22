import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { Note, NoteUserInfo, TiptapJSON } from '../types/note';
import { db } from './firebase';
import { extractPlainTextPreview, extractTitle } from '../utils/content';

const NOTES_COLLECTION = 'notes';

const defaultContent: TiptapJSON = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

function toNoteUserInfo(user: User): NoteUserInfo {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}

export async function createNote(user: User): Promise<string> {
  const userInfo = toNoteUserInfo(user);
  const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
    title: 'Untitled',
    content: defaultContent,
    plainTextPreview: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isPinned: false,
    isDeleted: false,
    userId: user.uid,
    tags: [],
    assignedTo: [],
    createdBy: userInfo,
    lastEditedBy: userInfo,
  });

  return docRef.id;
}

export async function updateNoteContent(noteId: string, content: TiptapJSON, user: User): Promise<void> {
  await updateDoc(doc(db, NOTES_COLLECTION, noteId), {
    content,
    title: extractTitle(content),
    plainTextPreview: extractPlainTextPreview(content),
    updatedAt: serverTimestamp(),
    lastEditedBy: toNoteUserInfo(user),
  });
}

export async function deleteNote(noteId: string, user: User): Promise<void> {
  await updateDoc(doc(db, NOTES_COLLECTION, noteId), {
    isDeleted: true,
    updatedAt: serverTimestamp(),
    lastEditedBy: toNoteUserInfo(user),
  });
}

export async function togglePinNote(noteId: string, isPinned: boolean, user: User): Promise<void> {
  await updateDoc(doc(db, NOTES_COLLECTION, noteId), {
    isPinned: !isPinned,
    updatedAt: serverTimestamp(),
    lastEditedBy: toNoteUserInfo(user),
  });
}

export async function assignNoteToUsers(noteId: string, userEmails: string[]): Promise<void> {
  await updateDoc(doc(db, NOTES_COLLECTION, noteId), {
    assignedTo: userEmails.map((email) => email.toLowerCase()),
  });
}

export function subscribeToNotes(
  callback: (notes: Note[]) => void,
  onError: (error: Error) => void,
  userEmail: string,
  isSuperAdmin: boolean,
): Unsubscribe {
  const notesQuery = isSuperAdmin
    ? query(collection(db, NOTES_COLLECTION), where('isDeleted', '==', false))
    : query(
        collection(db, NOTES_COLLECTION),
        where('isDeleted', '==', false),
        where('assignedTo', 'array-contains', userEmail.toLowerCase()),
      );

  return onSnapshot(
    notesQuery,
    (snapshot) => {
      const notes = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      })) as Note[];

      notes.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        const aTime = a.updatedAt?.toMillis?.() ?? 0;
        const bTime = b.updatedAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });

      callback(notes);
    },
    (err) => onError(err),
  );
}
