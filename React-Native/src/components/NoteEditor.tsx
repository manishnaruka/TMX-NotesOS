import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NativeModules, StyleSheet, Text, TextInput, View } from 'react-native';
import type { User } from 'firebase/auth';
import { updateNoteContent } from '../lib/firestore';
import { useDebounce } from '../hooks/useDebounce';
import { themes } from '../theme/tokens';
import { useThemeStore } from '../stores/theme-store';
import type { Note, TiptapJSON, TiptapNode } from '../types/note';

const tenTapModule: any = (() => {
  try {
    return require('@10play/tentap-editor');
  } catch {
    return null;
  }
})();

// Temporarily disabled due to runtime incompatibility with current RN/iOS setup.
const ENABLE_TENTAP_EDITOR = false;

interface NoteEditorProps {
  note: Note;
  user: User;
}

function textFromNode(node: TiptapNode): string {
  if (node.text) return node.text;
  if (!node.content) return '';
  return node.content.map(textFromNode).join('');
}

function jsonToPlainText(content: TiptapJSON): string {
  return (content.content ?? []).map(textFromNode).join('\n').trim();
}

function plainTextToJson(text: string): TiptapJSON {
  const lines = text.split(/\n+/).map((line) => line.trim());
  const nodes = lines.length
    ? lines.map((line) => ({
        type: 'paragraph',
        content: line ? [{ type: 'text', text: line }] : undefined,
      }))
    : [{ type: 'paragraph' }];

  return {
    type: 'doc',
    content: nodes,
  };
}

export function NoteEditor({ note, user }: NoteEditorProps) {
  const theme = useThemeStore((state) => themes[state.theme]);
  const noteIdRef = useRef(note.id);
  const [fallbackText, setFallbackText] = useState(() => jsonToPlainText(note.content));

  const saveContent = useCallback(
    async (noteId: string, content: TiptapJSON) => {
      await updateNoteContent(noteId, content, user);
    },
    [user],
  );

  const debouncedSave = useDebounce(saveContent, 1000);

  useEffect(() => {
    if (note.id !== noteIdRef.current) {
      noteIdRef.current = note.id;
      setFallbackText(jsonToPlainText(note.content));
    }
  }, [note.id, note.content]);

  const hasNativeWebView = !!NativeModules.RNCWebViewModule;

  if (ENABLE_TENTAP_EDITOR && tenTapModule && hasNativeWebView) {
    return (
      <TenTapRichEditor
        note={note}
        onDebouncedSave={debouncedSave}
        noteIdRef={noteIdRef}
        editorBg={theme.editor}
      />
    );
  }

  return (
    <View style={[styles.editorWrap, { backgroundColor: theme.editor }]}> 
      <Text style={[styles.warning, { color: theme.textMuted }]}>
        Rich text editor unavailable in this build. Fallback editor active.
      </Text>
      <TextInput
        multiline
        value={fallbackText}
        onChangeText={(value) => {
          setFallbackText(value);
          debouncedSave(note.id, plainTextToJson(value));
        }}
        placeholder="Start writing..."
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
      />
    </View>
  );
}

interface TenTapRichEditorProps {
  note: Note;
  onDebouncedSave: (noteId: string, content: TiptapJSON) => void;
  noteIdRef: React.MutableRefObject<string>;
  editorBg: string;
}

function TenTapRichEditor({ note, onDebouncedSave, noteIdRef, editorBg }: TenTapRichEditorProps) {
  const { RichText, Toolbar, TenTapStartKit, useEditorBridge } = tenTapModule;

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    bridgeExtensions: [TenTapStartKit],
    initialContent: note.content,
    onChange: () => {
      const json = editor.getJSON?.() as TiptapJSON | undefined;
      if (json) {
        onDebouncedSave(noteIdRef.current, json);
      }
    },
  });

  useEffect(() => {
    if (editor?.setContent) {
      editor.setContent(note.content);
    }
  }, [editor, note.content]);

  return (
    <View style={[styles.editorWrap, { backgroundColor: editorBg }]}>
      <Toolbar editor={editor} />
      <RichText editor={editor} />
    </View>
  );
}

const styles = StyleSheet.create({
  editorWrap: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    padding: 12,
    textAlignVertical: 'top',
  },
  warning: {
    fontSize: 12,
    marginBottom: 8,
  },
});
