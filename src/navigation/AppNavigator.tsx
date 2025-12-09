import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {StackParamList, TabParamList} from '@types/navigation';

// Screens
import HomeScreen from '@screens/HomeScreen';
import SearchScreen from '@screens/SearchScreen';
import LibraryScreen from '@screens/LibraryScreen';
import PlaylistScreen from '@screens/PlaylistScreen';
import PlayerScreen from '@screens/PlayerScreen';

const Stack = createStackNavigator<StackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1DB954', // Spotify yeşili
        tabBarInactiveTintColor: '#b3b3b3',
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#1a1a1a',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Ara',
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Kütüphane',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#121212',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Playlist"
          component={PlaylistScreen}
          options={{title: 'Çalma Listesi'}}
        />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

