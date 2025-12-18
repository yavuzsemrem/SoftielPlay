import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import SignInScreen from '@/features/auth/components/SignInScreen';
import SignUpScreen from '@/features/auth/components/SignUpScreen';
import EmailPasswordScreen from '@/features/auth/components/EmailPasswordScreen';
import LockScreen from '@/features/auth/components/LockScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query/build/legacy/index';
import '../global.css';

// TanStack Query client oluştur
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 dakika
    },
  },
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, userStatus, loading, isPro } = useAuth();
  const [showSignUp, setShowSignUp] = React.useState(false);
  const [showEmailPassword, setShowEmailPassword] = React.useState(false);

  // Loading durumu
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Kullanıcı giriş yapmamışsa - Auth ekranları
  if (!user) {
    if (showEmailPassword) {
      return (
        <EmailPasswordScreen 
          navigation={{
            goBack: () => setShowEmailPassword(false),
          }} 
        />
      );
    }
    if (showSignUp) {
      return (
        <SignUpScreen 
          navigation={{
            goBack: () => setShowSignUp(false),
          }} 
        />
      );
    }
    return (
      <SignInScreen 
        navigation={{
          navigate: (screen) => {
            if (screen === 'SignUp') {
              setShowSignUp(true);
            } else if (screen === 'EmailPassword') {
              setShowEmailPassword(true);
            }
          },
        }} 
      />
    );
  }

  // Kullanıcı giriş yapmış ama Pro değilse - Kilit ekranı
  if (!isPro()) {
    return <LockScreen />;
  }

  // Kullanıcı Pro ise - Ana uygulama
  return (
    <QueryClientProvider client={queryClient}>
      <LinearGradient
        colors={['#000000', '#0B0B0F', '#000000']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </LinearGradient>
    </QueryClientProvider>
  );
}
