import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Note } from '../types/note';
import { NoteListItem } from './NoteListItem';
import { useNoteStore } from '../stores/note-store';
import { themes } from '../theme/tokens';
import { useThemeStore } from '../stores/theme-store';

interface NoteListProps {
  notes: Note[];
  loading: boolean;
  isSuperAdmin: boolean;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string, isPinned: boolean) => void;
  onAssign: (note: Note) => void;
}

export function NoteList({ notes, loading, isSuperAdmin, onDelete, onTogglePin, onAssign }: NoteListProps) {
  const selectedNoteId = useNoteStore((state) => state.selectedNoteId);
  const setSelectedNoteId = useNoteStore((state) => state.setSelectedNoteId);
  const theme = useThemeStore((state) => themes[state.theme]);

  if (loading) {
    return (
      <View style={styles.emptyState}>
        <Text style={{ color: theme.textMuted }}>Loading notes...</Text>
      </View>
    );
  }

  if (!notes.length) {
    return (
      <View style={styles.emptyState}>
        <Text style={{ color: theme.textMuted }}>No notes found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <NoteListItem
          note={item}
          selected={item.id === selectedNoteId}
          isSuperAdmin={isSuperAdmin}
          onPress={() => setSelectedNoteId(item.id)}
          onPin={() => onTogglePin(item.id, item.isPinned)}
          onDelete={() => onDelete(item.id)}
          onAssign={() => onAssign(item)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
});
