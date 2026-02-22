import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AllowedUser, Note } from '../types/note';
import { subscribeToAllowedUsers } from '../lib/user-management';
import { assignNoteToUsers } from '../lib/firestore';
import { themes } from '../theme/tokens';
import { useThemeStore } from '../stores/theme-store';

interface NoteAssignModalProps {
  note: Note | null;
  visible: boolean;
  onClose: () => void;
}

export function NoteAssignModal({ note, visible, onClose }: NoteAssignModalProps) {
  const [users, setUsers] = useState<AllowedUser[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const theme = useThemeStore((state) => themes[state.theme]);

  useEffect(() => {
    if (!visible) return;

    const unsubscribe = subscribeToAllowedUsers(
      (list) => setUsers(list),
      () => undefined,
    );

    return () => unsubscribe();
  }, [visible]);

  useEffect(() => {
    if (!note) return;
    setSelected(new Set((note.assignedTo ?? []).map((item) => item.toLowerCase())));
  }, [note]);

  const selectedCount = selected.size;

  if (!note) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}> 
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <View style={styles.header}> 
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Assign Note</Text>
              <Text numberOfLines={1} style={{ color: theme.textMuted }}>{note.title}</Text>
            </View>
            <Pressable onPress={onClose}>
              <Text style={{ color: theme.textSecondary }}>Close</Text>
            </Pressable>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 8 }}>
            {users.map((userItem) => {
              const isSelected = selected.has(userItem.email);

              return (
                <Pressable
                  key={userItem.id}
                  onPress={() => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (next.has(userItem.email)) next.delete(userItem.email);
                      else next.add(userItem.email);
                      return next;
                    });
                  }}
                  style={({ pressed }) => [
                    styles.userRow,
                    {
                      borderColor: theme.border,
                      backgroundColor: isSelected ? theme.selectedBg : pressed ? theme.surfaceHover : theme.sidebar,
                    },
                  ]}
                >
                  <Text style={{ color: theme.textPrimary, flex: 1 }}>{userItem.email}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{userItem.role}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.footer}> 
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>{selectedCount} users assigned</Text>
            <Pressable
              disabled={saving}
              onPress={async () => {
                setSaving(true);
                try {
                  await assignNoteToUsers(note.id, Array.from(selected));
                  onClose();
                } finally {
                  setSaving(false);
                }
              }}
              style={({ pressed }) => [
                styles.saveButton,
                { backgroundColor: pressed ? theme.selectedBg : theme.accent, opacity: saving ? 0.5 : 1 },
              ]}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>{saving ? 'Saving...' : 'Save'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    height: '75%',
    padding: 16,
    width: '92%',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  saveButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  userRow: {
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
