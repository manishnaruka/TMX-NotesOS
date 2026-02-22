import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { User } from 'firebase/auth';
import { createNote, deleteNote, togglePinNote } from '../lib/firestore';
import { signOut } from '../hooks/useAuth';
import { useNoteStore } from '../stores/note-store';
import { useNotes } from '../hooks/useNotes';
import { useNote } from '../hooks/useNote';
import type { Note, UserRole } from '../types/note';
import { NoteList } from '../components/NoteList';
import { SearchBar } from '../components/SearchBar';
import { NoteEditor } from '../components/NoteEditor';
import { UserManagementModal } from '../components/UserManagementModal';
import { NoteAssignModal } from '../components/NoteAssignModal';
import { themes } from '../theme/tokens';
import { useThemeStore } from '../stores/theme-store';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { ArrowLeft, LogOut, Plus, UserRoundCheck, Users } from 'lucide-react-native';


interface MainScreenProps {
  user: User;
  role: UserRole;
}

export function MainScreen({ user, role }: MainScreenProps) {
  const isSuperAdmin = role === 'superadmin';
  const searchQuery = useNoteStore((state) => state.searchQuery);
  const selectedNoteId = useNoteStore((state) => state.selectedNoteId);
  const setSelectedNoteId = useNoteStore((state) => state.setSelectedNoteId);
  const theme = useThemeStore((state) => themes[state.theme]);

  const [showUserManagement, setShowUserManagement] = useState(false);
  const [assigningNote, setAssigningNote] = useState<Note | null>(null);

  const { notes, loading } = useNotes(user, isSuperAdmin);
  const { note: activeNote } = useNote(selectedNoteId);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return notes;

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(normalizedQuery) ||
        note.plainTextPreview.toLowerCase().includes(normalizedQuery),
    );
  }, [notes, searchQuery]);

  const handleNewNote = useCallback(async () => {
    if (!isSuperAdmin) return;
    const id = await createNote(user);
    setSelectedNoteId(id);
  }, [isSuperAdmin, setSelectedNoteId, user]);

  const handleDelete = useCallback(
    async (noteId: string) => {
      if (!isSuperAdmin) return;
      await deleteNote(noteId, user);
      if (selectedNoteId === noteId) setSelectedNoteId(null);
    },
    [isSuperAdmin, selectedNoteId, setSelectedNoteId, user],
  );

  const handleTogglePin = useCallback(
    async (noteId: string, isPinned: boolean) => {
      await togglePinNote(noteId, isPinned, user);
    },
    [user],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={[styles.header, { borderColor: theme.border }]}> 
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>TMX Notes</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{user.email}</Text>
        </View>

        <ThemeToggleButton />

        {(role === 'superadmin' || role === 'admin') ? (
          <Pressable
            accessibilityLabel="Manage users"
            onPress={() => setShowUserManagement(true)}
            style={styles.headerBtn}
          >
            <Users color={theme.textSecondary} size={16} />
          </Pressable>
        ) : null}

        <Pressable accessibilityLabel="Logout" onPress={() => signOut()} style={styles.headerBtn}>
          <LogOut color={theme.textSecondary} size={16} />
        </Pressable>
      </View>

      {!activeNote ? (
        <View style={styles.listPane}>
          <View style={styles.listTopRow}>
            <Text style={[styles.listTitle, { color: theme.textPrimary }]}>Notes</Text>
            {isSuperAdmin ? (
              <Pressable
                accessibilityLabel="New note"
                onPress={handleNewNote}
                style={[styles.newBtn, { backgroundColor: theme.accent }]}
              >
                <Plus color="#fff" size={16} />
              </Pressable>
            ) : null}
          </View>

          <SearchBar />
          <NoteList
            notes={filteredNotes}
            loading={loading}
            isSuperAdmin={isSuperAdmin}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin}
            onAssign={setAssigningNote}
          />
        </View>
      ) : (
        <View style={styles.editorPane}>
          <View style={[styles.editorHeader, { borderColor: theme.border }]}> 
            <Pressable accessibilityLabel="Back to notes" onPress={() => setSelectedNoteId(null)} style={styles.headerBtn}>
              <ArrowLeft color={theme.textSecondary} size={16} />
            </Pressable>
            <Text numberOfLines={1} style={[styles.editorTitle, { color: theme.textPrimary }]}>{activeNote.title}</Text>
            {isSuperAdmin ? (
              <Pressable
                accessibilityLabel="Assign note"
                onPress={() => setAssigningNote(activeNote)}
                style={styles.headerBtn}
              >
                <UserRoundCheck color={theme.textSecondary} size={16} />
              </Pressable>
            ) : (
              <View style={styles.headerBtn} />
            )}
          </View>
          <NoteEditor note={activeNote} user={user} />
        </View>
      )}

      <UserManagementModal
        visible={showUserManagement}
        currentUserEmail={user.email || ''}
        currentUserRole={role}
        onClose={() => setShowUserManagement(false)}
      />

      <NoteAssignModal
        visible={!!assigningNote}
        note={assigningNote}
        onClose={() => setAssigningNote(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editorHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editorPane: {
    flex: 1,
  },
  editorTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerBtn: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  listPane: {
    flex: 1,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  listTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  newBtn: {
    alignItems: 'center',
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
});
