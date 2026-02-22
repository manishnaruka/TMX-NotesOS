import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Note } from '../types/note';
import { formatNoteDate } from '../utils/date';
import { themes } from '../theme/tokens';
import { useThemeStore } from '../stores/theme-store';
import { Pin, PinOff, Trash2, UserRoundCheck } from 'lucide-react-native';

interface NoteListItemProps {
  note: Note;
  selected: boolean;
  isSuperAdmin: boolean;
  onPress: () => void;
  onPin: () => void;
  onDelete: () => void;
  onAssign: () => void;
}

export function NoteListItem({
  note,
  selected,
  isSuperAdmin,
  onAssign,
  onDelete,
  onPin,
  onPress,
}: NoteListItemProps) {
  const theme = useThemeStore((state) => themes[state.theme]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? theme.selectedBg : pressed ? theme.surfaceHover : theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.row}> 
        <Text numberOfLines={1} style={[styles.title, { color: theme.textPrimary }]}>
          {note.isPinned ? '📌 ' : ''}
          {note.title || 'Untitled'}
        </Text>
        <Text style={[styles.date, { color: theme.textMuted }]}>{formatNoteDate(note.updatedAt)}</Text>
      </View>

      <Text numberOfLines={2} style={[styles.preview, { color: theme.textSecondary }]}>
        {note.plainTextPreview || 'No content'}
      </Text>

      <View style={styles.actions}> 
        <Pressable accessibilityLabel={note.isPinned ? 'Unpin note' : 'Pin note'} onPress={onPin} style={styles.actionBtn}>
          {note.isPinned ? (
            <PinOff color={theme.textSecondary} size={14} />
          ) : (
            <Pin color={theme.textSecondary} size={14} />
          )}
        </Pressable>
        {isSuperAdmin ? (
          <>
            <Pressable accessibilityLabel="Assign note" onPress={onAssign} style={styles.actionBtn}>
              <UserRoundCheck color={theme.textSecondary} size={14} />
            </Pressable>
            <Pressable accessibilityLabel="Delete note" onPress={onDelete} style={styles.actionBtn}>
              <Trash2 color={theme.errorText} size={14} />
            </Pressable>
          </>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionBtn: {
    alignItems: 'center',
    borderRadius: 8,
    height: 24,
    justifyContent: 'center',
    marginRight: 10,
    width: 24,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 14,
    marginVertical: 6,
    padding: 12,
  },
  date: {
    fontSize: 11,
    marginLeft: 12,
  },
  preview: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
});
