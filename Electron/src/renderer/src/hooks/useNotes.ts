import { useEffect, useState } from 'react'
import { subscribeToNotes } from '../lib/firestore'
import type { Note } from '../types/note'

export function useNotes(userId: string) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToNotes(
      userId,
      (notesList) => {
        setNotes(notesList)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [userId])

  return { notes, loading, error }
}
