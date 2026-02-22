import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from './src/hooks/useAuth';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { UnauthorizedScreen } from './src/screens/UnauthorizedScreen';
import { MainScreen } from './src/screens/MainScreen';
import { themes } from './src/theme/tokens';
import { useThemeStore } from './src/stores/theme-store';

function AppContent() {
  const { user, loading, role, authorized } = useAuth();
  const themeName = useThemeStore((state) => state.theme);
  const theme = themes[themeName];

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (authorized === false) {
    return <UnauthorizedScreen email={user.email || 'Unknown'} />;
  }

  if (!role) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar barStyle={themeName.includes('light') ? 'dark-content' : 'light-content'} />
      <MainScreen user={user} role={role} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
