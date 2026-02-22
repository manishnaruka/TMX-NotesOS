import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useNoteStore } from '../stores/note-store';
import { themes } from '../theme/tokens';
import { useThemeStore } from '../stores/theme-store';

export function SearchBar() {
  const searchQuery = useNoteStore((state) => state.searchQuery);
  const setSearchQuery = useNoteStore((state) => state.setSearchQuery);
  const theme = useThemeStore((state) => themes[state.theme]);

  return (
    <View style={[styles.wrapper, { borderColor: theme.border, backgroundColor: theme.card }]}> 
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search notes"
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { color: theme.textPrimary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  wrapper: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 10,
  },
});
