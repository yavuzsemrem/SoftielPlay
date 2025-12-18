import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Search, Music, User } from 'lucide-react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MiniPlayer from '@/features/player/components/MiniPlayer';

function TabBarIcon({ Icon, color, focused }: { Icon: any; color: string; focused: boolean }) {
  return <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#60A5FA',
          tabBarInactiveTintColor: isDark ? '#71717A' : '#9CA3AF',
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            height: 60 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 6),
            paddingTop: 6,
            elevation: 0,
            shadowOpacity: 0,
            position: 'absolute',
          },
          tabBarBackground: () => (
            <BlurView
              intensity={80}
              tint="dark"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                borderTopWidth: 0.5,
                borderTopColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Ana Sayfa',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={Home} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: 'Ara',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={Search} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="playlist"
          options={{
            title: 'Çalma Listeleri',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={Music} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon Icon={User} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
      
      {/* Global Mini Player - Her sekmede görünür */}
      <MiniPlayer />
    </View>
  );
}
