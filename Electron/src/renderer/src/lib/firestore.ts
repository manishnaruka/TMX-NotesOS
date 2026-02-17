import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe
} from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from './firebase'
import type { Note, NoteUserInfo, TiptapJSON } from '../types/note'
import { extractTitle, extractPlainTextPreview } from '../utils/content'

const NOTES_COLLECTION = 'notes'

const defaultContent: TiptapJSON = {
  type: 'doc',
  content: [{ type: 'paragraph' }]
}

function toNoteUserInfo(user: User): NoteUserInfo {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL
  }
}

export async function createNote(user: User): Promise<string> {
  const userInfo = toNoteUserInfo(user)
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
    createdBy: userInfo,
    lastEditedBy: userInfo
  })
  return docRef.id
}

export async function updateNoteContent(
  noteId: string,
  content: TiptapJSON,
  user: User
): Promise<void> {
  const noteRef = doc(db, NOTES_COLLECTION, noteId)
  await updateDoc(noteRef, {
    content,
    title: extractTitle(content),
    plainTextPreview: extractPlainTextPreview(content),
    updatedAt: serverTimestamp(),
    lastEditedBy: toNoteUserInfo(user)
  })
}

export async function deleteNote(noteId: string, user: User): Promise<void> {
  const noteRef = doc(db, NOTES_COLLECTION, noteId)
  await updateDoc(noteRef, {
    isDeleted: true,
    updatedAt: serverTimestamp(),
    lastEditedBy: toNoteUserInfo(user)
  })
}

export async function togglePinNote(noteId: string, isPinned: boolean, user: User): Promise<void> {
  const noteRef = doc(db, NOTES_COLLECTION, noteId)
  await updateDoc(noteRef, {
    isPinned: !isPinned,
    updatedAt: serverTimestamp(),
    lastEditedBy: toNoteUserInfo(user)
  })
}

export function subscribeToNotes(
  userId: string,
  callback: (notes: Note[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, NOTES_COLLECTION),
    where('userId', '==', userId),
    where('isDeleted', '==', false)
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const notes = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Note[]

      // Sort client-side: pinned first, then by updatedAt descending
      notes.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
        const aTime = a.updatedAt?.toMillis?.() ?? 0
        const bTime = b.updatedAt?.toMillis?.() ?? 0
        return bTime - aTime
      })

      callback(notes)
    },
    (err) => {
      console.error('Firestore subscription error:', err)
      onError(err)
    }
  )
}
