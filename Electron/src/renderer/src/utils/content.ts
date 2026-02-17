import type { TiptapJSON, TiptapNode } from '../types/note'

function extractText(node: TiptapNode): string {
  if (node.text) return node.text
  if (!node.content) return ''
  return node.content.map(extractText).join('')
}

export function extractTitle(content: TiptapJSON): string {
  if (!content.content || content.content.length === 0) return 'Untitled'

  const firstNode = content.content[0]
  const text = extractText(firstNode).trim()
  return text || 'Untitled'
}

export function extractPlainTextPreview(content: TiptapJSON, maxLength = 120): string {
  if (!content.content) return ''

  const allText = content.content.map(extractText).join(' ').trim()
  if (allText.length <= maxLength) return allText
  return allText.slice(0, maxLength) + '…'
}
