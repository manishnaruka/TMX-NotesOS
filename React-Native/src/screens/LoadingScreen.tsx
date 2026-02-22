import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { themes } from '../theme/tokens';
import { useThemeStore } from '../stores/theme-store';

export function LoadingScreen() {
  const theme = useThemeStore((state) => themes[state.theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <ActivityIndicator size="large" color={theme.accent} />
      <Text style={[styles.label, { color: theme.textSecondary }]}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
  },
});
