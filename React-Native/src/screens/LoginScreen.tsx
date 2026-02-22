import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { signInWithGoogle } from '../hooks/useAuth';
import { themes } from '../theme/tokens';
import { useThemeStore } from '../stores/theme-store';

export function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useThemeStore((state) => themes[state.theme]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
        <Text style={[styles.title, { color: theme.textPrimary }]}>TMX Notes</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign in to access your notes</Text>

        <Pressable
          disabled={loading}
          onPress={handleGoogleSignIn}
          style={({ pressed }) => [
            styles.googleButton,
            {
              backgroundColor: pressed ? theme.surfaceHover : theme.sidebar,
              borderColor: theme.border,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={theme.accent} />
          ) : (
            <Text style={[styles.googleLabel, { color: theme.textPrimary }]}>Continue with Google</Text>
          )}
        </Pressable>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: theme.errorBg }]}> 
            <Text style={[styles.errorText, { color: theme.errorText }]}>{error}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: 400,
    padding: 24,
    width: '90%',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorBox: {
    borderRadius: 10,
    marginTop: 12,
    padding: 10,
  },
  errorText: {
    fontSize: 12,
  },
  googleButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  googleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});
