import { useEffect, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import type { User } from 'firebase/auth'
import { editorExtensions } from '../lib/editor-extensions'
import { EditorToolbar } from './EditorToolbar'
import { updateNoteContent } from '../lib/firestore'
import { useDebounce } from '../hooks/useDebounce'
import type { Note, TiptapJSON } from '../types/note'

interface NoteEditorProps {
  note: Note
  user: User
}

export function NoteEditor({ note, user }: NoteEditorProps) {
  const noteIdRef = useRef(note.id)
  const isLocalUpdate = useRef(false)

  const saveContent = useCallback(
    async (noteId: string, content: TiptapJSON) => {
      try {
        await updateNoteContent(noteId, content, user)
      } catch (err) {
        console.error('Failed to save note:', err)
      }
    },
    [user]
  )

  const debouncedSave = useDebounce(saveContent, 1000)

  const editor = useEditor({
    extensions: editorExtensions,
    content: note.content,
    onUpdate: ({ editor }) => {
      isLocalUpdate.current = true
      debouncedSave(noteIdRef.current, editor.getJSON() as TiptapJSON)
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[calc(100vh-120px)] px-8 py-6'
      }
    }
  })

  // When note changes (different note selected), update editor content
  useEffect(() => {
    if (editor && note.id !== noteIdRef.current) {
      noteIdRef.current = note.id
      isLocalUpdate.current = false
      editor.commands.setContent(note.content)
    }
  }, [editor, note.id, note.content])

  // Sync remote changes only when editor is not focused
  useEffect(() => {
    if (editor && note.id === noteIdRef.current && !editor.isFocused && !isLocalUpdate.current) {
      editor.commands.setContent(note.content)
    }
    isLocalUpdate.current = false
  }, [editor, note.content, note.updatedAt])

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto bg-[var(--editor-bg)]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
