import type { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code2,
  Minus,
  Undo2,
  Redo2
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface EditorToolbarProps {
  editor: Editor | null
}

interface ToolbarButton {
  label: string
  icon: LucideIcon
  action: (editor: Editor) => void
  isActive?: (editor: Editor) => boolean
}

const formatButtons: ToolbarButton[] = [
  {
    label: 'Bold',
    icon: Bold,
    action: (e) => e.chain().focus().toggleBold().run(),
    isActive: (e) => e.isActive('bold')
  },
  {
    label: 'Italic',
    icon: Italic,
    action: (e) => e.chain().focus().toggleItalic().run(),
    isActive: (e) => e.isActive('italic')
  },
  {
    label: 'Underline',
    icon: Underline,
    action: (e) => e.chain().focus().toggleUnderline().run(),
    isActive: (e) => e.isActive('underline')
  },
  {
    label: 'Strikethrough',
    icon: Strikethrough,
    action: (e) => e.chain().focus().toggleStrike().run(),
    isActive: (e) => e.isActive('strike')
  },
  {
    label: 'Highlight',
    icon: Highlighter,
    action: (e) => e.chain().focus().toggleHighlight().run(),
    isActive: (e) => e.isActive('highlight')
  }
]

const headingButtons: ToolbarButton[] = [
  {
    label: 'Heading 1',
    icon: Heading1,
    action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (e) => e.isActive('heading', { level: 1 })
  },
  {
    label: 'Heading 2',
    icon: Heading2,
    action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (e) => e.isActive('heading', { level: 2 })
  },
  {
    label: 'Heading 3',
    icon: Heading3,
    action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (e) => e.isActive('heading', { level: 3 })
  }
]

const blockButtons: ToolbarButton[] = [
  {
    label: 'Bullet List',
    icon: List,
    action: (e) => e.chain().focus().toggleBulletList().run(),
    isActive: (e) => e.isActive('bulletList')
  },
  {
    label: 'Ordered List',
    icon: ListOrdered,
    action: (e) => e.chain().focus().toggleOrderedList().run(),
    isActive: (e) => e.isActive('orderedList')
  },
  {
    label: 'Task List',
    icon: ListChecks,
    action: (e) => e.chain().focus().toggleTaskList().run(),
    isActive: (e) => e.isActive('taskList')
  },
  {
    label: 'Blockquote',
    icon: Quote,
    action: (e) => e.chain().focus().toggleBlockquote().run(),
    isActive: (e) => e.isActive('blockquote')
  },
  {
    label: 'Code Block',
    icon: Code2,
    action: (e) => e.chain().focus().toggleCodeBlock().run(),
    isActive: (e) => e.isActive('codeBlock')
  }
]

function ToolbarBtn({
  button,
  editor
}: {
  button: ToolbarButton
  editor: Editor
}) {
  const active = button.isActive?.(editor) ?? false
  const Icon = button.icon
  return (
    <button
      onClick={() => button.action(editor)}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? 'bg-[var(--accent-active-bg)] text-[var(--accent-active-text)] shadow-[0_0_8px_rgba(59,130,246,0.15)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
      }`}
      title={button.label}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  )
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-0.5 px-4 py-2 border-b border-[var(--border)] bg-[var(--toolbar-bg)] backdrop-blur-sm flex-wrap">
      {formatButtons.map((btn) => (
        <ToolbarBtn key={btn.label} button={btn} editor={editor} />
      ))}
      <div className="w-px h-6 bg-[var(--separator)] mx-1.5" />
      {headingButtons.map((btn) => (
        <ToolbarBtn key={btn.label} button={btn} editor={editor} />
      ))}
      <div className="w-px h-6 bg-[var(--separator)] mx-1.5" />
      {blockButtons.map((btn) => (
        <ToolbarBtn key={btn.label} button={btn} editor={editor} />
      ))}
      <div className="w-px h-6 bg-[var(--separator)] mx-1.5" />
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1.5 rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
        title="Horizontal Rule"
      >
        <Minus size={18} strokeWidth={2} />
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30"
        title="Undo"
      >
        <Undo2 size={18} strokeWidth={2} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30"
        title="Redo"
      >
        <Redo2 size={18} strokeWidth={2} />
      </button>
    </div>
  )
}
