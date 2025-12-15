import React, {useEffect} from 'react';
import {StatusBar, Platform} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {playerService} from './src/services/player.service';

export default function App() {
  useEffect(() => {
    // Player servisini başlat
    playerService.initialize();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={Platform.OS === 'android'}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

