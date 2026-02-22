import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SUPERADMIN_EMAIL } from '@env';
import type { AllowedUser, UserRole } from '../types/note';
import { addAllowedUser, isSuperAdmin, removeAllowedUser, subscribeToAllowedUsers, updateUserRole } from '../lib/user-management';
import { themes } from '../theme/tokens';
import { useThemeStore } from '../stores/theme-store';

interface UserManagementModalProps {
  visible: boolean;
  currentUserEmail: string;
  currentUserRole: UserRole;
  onClose: () => void;
}

export function UserManagementModal({
  visible,
  currentUserEmail,
  currentUserRole,
  onClose,
}: UserManagementModalProps) {
  const [users, setUsers] = useState<AllowedUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const theme = useThemeStore((state) => themes[state.theme]);

  useEffect(() => {
    if (!visible) return;
    const unsubscribe = subscribeToAllowedUsers(
      (usersList) => setUsers(usersList),
      (err) => setError(err.message),
    );

    return () => unsubscribe();
  }, [visible]);

  const canManageUsers = currentUserRole === 'superadmin' || currentUserRole === 'admin';

  const handleAdd = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isSuperAdmin(email)) {
      setError('Superadmin is always authorized and cannot be added here.');
      return;
    }

    setAdding(true);
    setError(null);

    try {
      await addAllowedUser(email, newRole, currentUserEmail);
      setNewEmail('');
      setNewRole('user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <View style={styles.header}> 
            <Text style={[styles.title, { color: theme.textPrimary }]}>User Management</Text>
            <Pressable onPress={onClose}>
              <Text style={{ color: theme.textSecondary }}>Close</Text>
            </Pressable>
          </View>

          {canManageUsers ? (
            <View style={styles.form}> 
              <TextInput
                value={newEmail}
                onChangeText={setNewEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="user@gmail.com"
                placeholderTextColor={theme.textMuted}
                style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
              />

              <View style={styles.roleRow}> 
                {(currentUserRole === 'superadmin' ? (['user', 'admin'] as UserRole[]) : (['user'] as UserRole[])).map((roleOption) => (
                  <Pressable
                    key={roleOption}
                    onPress={() => setNewRole(roleOption)}
                    style={({ pressed }) => [
                      styles.roleChip,
                      {
                        backgroundColor:
                          newRole === roleOption ? theme.selectedBg : pressed ? theme.surfaceHover : theme.sidebar,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={{ color: theme.textPrimary }}>{roleOption}</Text>
                  </Pressable>
                ))}

                <Pressable
                  disabled={adding || !newEmail.trim()}
                  onPress={handleAdd}
                  style={({ pressed }) => [
                    styles.addButton,
                    {
                      backgroundColor: pressed ? theme.selectedBg : theme.accent,
                      opacity: adding || !newEmail.trim() ? 0.5 : 1,
                    },
                  ]}
                >
                  <Text style={styles.addButtonLabel}>{adding ? 'Adding...' : 'Add'}</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {error ? <Text style={[styles.error, { color: theme.errorText }]}>{error}</Text> : null}

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            <View style={[styles.userRow, { borderColor: theme.border }]}> 
              <View>
                <Text style={{ color: theme.textPrimary }}>{SUPERADMIN_EMAIL}</Text>
                <Text style={{ color: theme.badgePurpleText, fontSize: 12 }}>superadmin</Text>
              </View>
            </View>

            {users.map((userItem) => (
              <View key={userItem.id} style={[styles.userRow, { borderColor: theme.border }]}> 
                <View style={styles.userInfo}> 
                  <Text style={{ color: theme.textPrimary }}>{userItem.email}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{userItem.role}</Text>
                </View>

                {canManageUsers ? (
                  <View style={styles.userActions}> 
                    {currentUserRole === 'superadmin' ? (
                      <Pressable
                        onPress={() => updateUserRole(userItem.email, userItem.role === 'admin' ? 'user' : 'admin')}
                        style={styles.smallAction}
                      >
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Toggle role</Text>
                      </Pressable>
                    ) : null}
                    <Pressable onPress={() => removeAllowedUser(userItem.email)} style={styles.smallAction}>
                      <Text style={{ color: theme.errorText, fontSize: 12 }}>Remove</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  addButton: {
    borderRadius: 10,
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonLabel: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: '80%',
    padding: 16,
    width: '92%',
  },
  error: {
    fontSize: 12,
    marginBottom: 8,
  },
  form: {
    marginBottom: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 8,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  roleChip: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  roleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  smallAction: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  userActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  userInfo: {
    flex: 1,
  },
  userRow: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
});
