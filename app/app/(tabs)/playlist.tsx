import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { 
  Music, 
  Plus, 
  Grid3x3, 
  List,
  MoreVertical,
  Play,
  Clock,
  User
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScalePressable({ children, onPress, style, ...props }: any) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function PlaylistScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Örnek çalma listeleri
  const playlists = [
    { 
      id: 1, 
      name: 'Favori Şarkılarım', 
      description: 'En sevdiğim şarkılar',
      songCount: 24, 
      duration: '1:24:30',
      image: null 
    },
    { 
      id: 2, 
      name: 'Yolculuk Müzikleri', 
      description: 'Uzun yol için',
      songCount: 18, 
      duration: '58:45',
      image: null 
    },
    { 
      id: 3, 
      name: 'Çalışma Listesi', 
      description: 'Odaklanmak için',
      songCount: 32, 
      duration: '2:15:20',
      image: null 
    },
    { 
      id: 4, 
      name: 'Spor Müzikleri', 
      description: 'Enerji veren şarkılar',
      songCount: 15, 
      duration: '45:30',
      image: null 
    },
    { 
      id: 5, 
      name: 'Akşam Müzikleri', 
      description: 'Rahatlatan şarkılar',
      songCount: 20, 
      duration: '1:10:15',
      image: null 
    },
    { 
      id: 6, 
      name: 'Parti Listesi', 
      description: 'Eğlence için',
      songCount: 28, 
      duration: '1:35:40',
      image: null 
    },
  ];

  const renderGridItem = ({ item }: { item: any }) => (
    <ScalePressable style={{ width: '100%' }}>
      <LinearGradient
        colors={isDark ? ['#1A1A1A', '#2A2A2A'] : ['#FFFFFF', '#F9FAFB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ 
          borderWidth: 1,
          borderColor: isDark ? '#3B82F640' : '#E5E5E5',
          borderRadius: 16,
          padding: 12,
          shadowColor: '#60A5FA',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <LinearGradient
          colors={['#3B82F620', '#60A5FA30']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: '100%',
            aspectRatio: 1,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <Music size={40} color="#60A5FA" />
        </LinearGradient>
        <Text 
          style={{ 
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 4,
            color: textPrimary,
          }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text 
          style={{ 
            fontSize: 12,
            marginBottom: 8,
            color: textSecondary,
          }}
          numberOfLines={1}
        >
          {item.description}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text 
            style={{ 
              fontSize: 12,
              color: textSecondary,
            }}
          >
            {item.songCount} şarkı
          </Text>
          <ScalePressable>
            <View 
              style={{ 
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#3B82F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          </ScalePressable>
        </View>
      </LinearGradient>
    </ScalePressable>
  );

  const renderListItem = ({ item }: { item: any }) => (
    <ScalePressable>
      <LinearGradient
        colors={isDark ? ['#1A1A1A', '#2A2A2A'] : ['#FFFFFF', '#F9FAFB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ 
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 16,
          padding: 12,
          marginBottom: 8,
          borderWidth: 1,
          borderColor: isDark ? '#3B82F640' : '#E5E5E5',
          shadowColor: '#60A5FA',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <LinearGradient
          colors={['#3B82F620', '#60A5FA30']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Music size={24} color="#60A5FA" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text 
            style={{ 
              fontSize: 15,
              fontWeight: '600',
              marginBottom: 4,
              color: textPrimary,
            }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text 
            style={{ 
              fontSize: 13,
              marginBottom: 4,
              color: textSecondary,
            }}
            numberOfLines={1}
          >
            {item.description}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text 
              style={{ 
                fontSize: 12,
                marginRight: 12,
                color: textSecondary,
              }}
            >
              {item.songCount} şarkı
            </Text>
            <Clock size={12} color={textSecondary} />
            <Text 
              style={{ 
                fontSize: 12,
                marginLeft: 4,
                color: textSecondary,
              }}
            >
              {item.duration}
            </Text>
          </View>
        </View>
        <ScalePressable style={{ marginRight: 8 }}>
          <View 
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#3B82F6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        </ScalePressable>
        <ScalePressable>
          <View style={{ padding: 4 }}>
            <MoreVertical size={18} color={textSecondary} />
          </View>
        </ScalePressable>
      </LinearGradient>
    </ScalePressable>
  );

  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || 'Kullanıcı';
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      {/* Sticky Header */}
      <View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 20,
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#1A1A1A' : '#E5E5E5',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ScalePressable>
            <LinearGradient
              colors={['#3B82F620', '#60A5FA30']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ 
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: '#3B82F640',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#60A5FA' }}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </ScalePressable>
          <ScalePressable>
            <View 
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#3B82F6',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#60A5FA',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Plus size={20} color="#FFFFFF" />
            </View>
          </ScalePressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100, paddingHorizontal: 20 }}
      >
        {/* Header */}
        <View style={{ paddingTop: 16, paddingBottom: 20 }}>
          <View style={{ marginBottom: 20 }}>
            <Text 
              style={{ 
                fontSize: 24,
                fontWeight: '700',
                marginBottom: 4,
                color: textPrimary,
              }}
            >
              Çalma Listeleri
            </Text>
            <Text 
              style={{ 
                fontSize: 14,
                color: textSecondary,
              }}
            >
              {playlists.length} çalma listesi
            </Text>
          </View>

          {/* View Mode Toggle */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View 
              style={{
                flexDirection: 'row',
                borderRadius: 12,
                padding: 4,
                backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
                borderWidth: 1,
                borderColor: isDark ? '#2A2A2A' : '#E5E5E5',
              }}
            >
              <ScalePressable
                onPress={() => setViewMode('grid')}
              >
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: viewMode === 'grid' ? '#3B82F6' : 'transparent',
                  }}
                >
                  <Grid3x3 
                    size={18} 
                    color={viewMode === 'grid' ? '#FFFFFF' : textSecondary} 
                  />
                </View>
              </ScalePressable>
              <ScalePressable
                onPress={() => setViewMode('list')}
              >
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: viewMode === 'list' ? '#3B82F6' : 'transparent',
                  }}
                >
                  <List 
                    size={18} 
                    color={viewMode === 'list' ? '#FFFFFF' : textSecondary} 
                  />
                </View>
              </ScalePressable>
            </View>
          </View>
        </View>

        {/* Playlists */}
        <View>
          {viewMode === 'grid' ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {playlists.map((item, index) => (
                <View 
                  key={item.id} 
                  style={{ 
                    width: '48%',
                    marginBottom: 12,
                  }}
                >
                  {renderGridItem({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View>
              {playlists.map((item) => (
                <View key={item.id}>
                  {renderListItem({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
