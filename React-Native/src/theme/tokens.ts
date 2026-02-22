export type ThemeVariant = 'glass-dark' | 'glass-light' | 'modern-dark' | 'modern-light';

export interface ThemeColors {
  background: string;
  sidebar: string;
  editor: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  surfaceHover: string;
  selectedBg: string;
  accent: string;
  badgeBlueBg: string;
  badgeBlueText: string;
  badgePurpleBg: string;
  badgePurpleText: string;
  errorBg: string;
  errorText: string;
}

export const themes: Record<ThemeVariant, ThemeColors> = {
  'glass-dark': {
    background: '#1a1a2e',
    sidebar: 'rgba(255,255,255,0.05)',
    editor: 'rgba(255,255,255,0.03)',
    card: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.1)',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    surfaceHover: 'rgba(255,255,255,0.08)',
    selectedBg: 'rgba(59,130,246,0.2)',
    accent: '#3b82f6',
    badgeBlueBg: 'rgba(59,130,246,0.2)',
    badgeBlueText: '#93c5fd',
    badgePurpleBg: 'rgba(139,92,246,0.2)',
    badgePurpleText: '#c4b5fd',
    errorBg: 'rgba(239,68,68,0.1)',
    errorText: '#fca5a5',
  },
  'glass-light': {
    background: '#e8ecf1',
    sidebar: 'rgba(255,255,255,0.7)',
    editor: 'rgba(255,255,255,0.8)',
    card: 'rgba(255,255,255,0.9)',
    border: 'rgba(0,0,0,0.08)',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#64748b',
    surfaceHover: 'rgba(0,0,0,0.05)',
    selectedBg: 'rgba(59,130,246,0.1)',
    accent: '#3b82f6',
    badgeBlueBg: 'rgba(59,130,246,0.1)',
    badgeBlueText: '#2563eb',
    badgePurpleBg: 'rgba(139,92,246,0.1)',
    badgePurpleText: '#7c3aed',
    errorBg: 'rgba(239,68,68,0.08)',
    errorText: '#dc2626',
  },
  'modern-dark': {
    background: '#111118',
    sidebar: '#1a1a24',
    editor: '#141419',
    card: '#1a1a24',
    border: 'rgba(255,255,255,0.1)',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    surfaceHover: 'rgba(255,255,255,0.05)',
    selectedBg: 'rgba(59,130,246,0.18)',
    accent: '#3b82f6',
    badgeBlueBg: 'rgba(59,130,246,0.15)',
    badgeBlueText: '#93c5fd',
    badgePurpleBg: 'rgba(139,92,246,0.15)',
    badgePurpleText: '#c4b5fd',
    errorBg: 'rgba(239,68,68,0.1)',
    errorText: '#fca5a5',
  },
  'modern-light': {
    background: '#ffffff',
    sidebar: '#f8f9fb',
    editor: '#ffffff',
    card: '#ffffff',
    border: '#e2e8f0',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#64748b',
    surfaceHover: 'rgba(0,0,0,0.04)',
    selectedBg: 'rgba(59,130,246,0.08)',
    accent: '#3b82f6',
    badgeBlueBg: '#dbeafe',
    badgeBlueText: '#2563eb',
    badgePurpleBg: '#f3e8ff',
    badgePurpleText: '#7c3aed',
    errorBg: '#fef2f2',
    errorText: '#dc2626',
  },
};

export const themeLabels: Record<ThemeVariant, string> = {
  'glass-dark': 'Glass Dark',
  'glass-light': 'Glass Light',
  'modern-dark': 'Modern Dark',
  'modern-light': 'Modern Light',
};
