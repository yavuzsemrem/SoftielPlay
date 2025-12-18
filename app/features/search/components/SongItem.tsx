import { View, Text, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PlayCircle, Music } from 'lucide-react-native';
import { useColorScheme } from '@/components/useColorScheme';
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

interface SongItemProps {
  spotify_id: string;
  track_name: string;
  artist_name: string;
  album_art: string | null;
  album_name?: string | null;
  duration: string;
  onPress?: () => void;
}

export default function SongItem({ 
  spotify_id, 
  track_name, 
  artist_name, 
  album_art, 
  album_name,
  duration,
  onPress 
}: SongItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <ScalePressable onPress={onPress}>
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
        {/* Album Art (Kare görsel - Spotify formatı) */}
        {album_art ? (
          <Image
            source={{ uri: album_art }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              marginRight: 12,
              aspectRatio: 1,
            }}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#3B82F620', '#60A5FA30']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              aspectRatio: 1,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Music size={28} color="#60A5FA" />
          </LinearGradient>
        )}

        {/* Song Info */}
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
            {track_name}
          </Text>
          <Text 
            style={{ 
              fontSize: 13,
              color: textSecondary,
            }}
            numberOfLines={1}
          >
            {artist_name}
          </Text>
          {album_name && (
            <Text 
              style={{ 
                fontSize: 11,
                color: textSecondary,
                marginTop: 2,
                opacity: 0.7,
              }}
              numberOfLines={1}
            >
              {album_name}
            </Text>
          )}
        </View>

        {/* Duration and Play Icon */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
          <Text 
            style={{ 
              fontSize: 12,
              color: textSecondary,
              marginRight: 8,
            }}
          >
            {duration}
          </Text>
          <PlayCircle size={20} color="#60A5FA" />
        </View>
      </LinearGradient>
    </ScalePressable>
  );
}






