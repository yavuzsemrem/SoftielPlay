import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import {playerService} from './src/services/player.service';

export default function App() {
  useEffect(() => {
    // Player servisini başlat
    playerService.initialize();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <AppNavigator />
    </>
  );
}

