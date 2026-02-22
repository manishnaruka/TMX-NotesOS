import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { signOut } from '../hooks/useAuth';
import { themes } from '../theme/tokens';
import { useThemeStore } from '../stores/theme-store';

interface UnauthorizedScreenProps {
  email: string;
}

export function UnauthorizedScreen({ email }: UnauthorizedScreenProps) {
  const theme = useThemeStore((state) => themes[state.theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
        <Text style={[styles.title, { color: theme.textPrimary }]}>Access not granted</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          {email} is not in the allowed users list.
        </Text>
        <Pressable
          onPress={() => signOut()}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed ? theme.surfaceHover : theme.sidebar,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.buttonLabel, { color: theme.textPrimary }]}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  button: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 420,
    padding: 24,
    width: '90%',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
});
