import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { themes } from '../theme/tokens';
import { useThemeStore } from '../stores/theme-store';
import { Layers, Moon, Square, Sun } from 'lucide-react-native';

export function ThemeToggleButton() {
  const { theme, toggleMode, toggleStyle } = useThemeStore();
  const colors = themes[theme];
  const [style, mode] = theme.split('-') as ['modern' | 'glass', 'dark' | 'light'];

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onPress={toggleMode}
        style={styles.headerBtn}
      >
        {mode === 'dark' ? (
          <Sun color={colors.textSecondary} size={16} />
        ) : (
          <Moon color={colors.textSecondary} size={16} />
        )}
      </Pressable>

      <Pressable
        accessibilityLabel={style === 'glass' ? 'Switch to modern style' : 'Switch to glass style'}
        onPress={toggleStyle}
        style={styles.headerBtn}

      >
        {style === 'glass' ? (
          <Square color={colors.textSecondary} size={16} />
        ) : (
          <Layers color={colors.textSecondary} size={16} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  container: {
    flexDirection: 'row',
    gap: 6,
  },
    headerBtn: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  }
});
