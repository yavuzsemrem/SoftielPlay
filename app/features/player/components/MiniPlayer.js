import React, { useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Play, Pause } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';
import usePlayerStore from '../store/usePlayerStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MiniPlayer() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  const { 
    currentTrack, 
    isPlaying, 
    position, 
    duration,
    isLoading,
    togglePlay 
  } = usePlayerStore();

  // Animasyon değerleri
  const translateY = useSharedValue(100); // Başlangıçta ekranın dışında
  const opacity = useSharedValue(0);
  const albumArtRotation = useSharedValue(0);

  // Şarkı değiştiğinde veya açıldığında animasyon
  useEffect(() => {
    if (currentTrack) {
      // Aşağıdan yukarı doğru yumuşak kayma
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      // Kapanırken aşağı kay
      translateY.value = withSpring(100, {
        damping: 20,
        stiffness: 90,
      });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [currentTrack]);

  // Çalarken albüm kapağı dönsün
  useEffect(() => {
    if (isPlaying && currentTrack) {
      // Sürekli dönme animasyonu (her 10 saniyede 360 derece)
      // Mevcut rotasyon değerinden başla
      const currentRotation = albumArtRotation.value % 360;
      albumArtRotation.value = currentRotation;
      
      albumArtRotation.value = withRepeat(
        withTiming(currentRotation + 360, {
          duration: 10000,
          easing: Easing.linear,
        }),
        -1, // Sonsuz tekrar
        false // Reverse yok
      );
    }
    // Durdurulduğunda animasyon otomatik durur (useEffect dependency değiştiğinde)
  }, [isPlaying, currentTrack]);

  // Animasyon stilleri
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const animatedAlbumArtStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${albumArtRotation.value}deg` }],
    };
  });

  // Progress bar hesaplama
  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  // Şarkı yoksa render etme
  if (!currentTrack) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: insets.bottom + 60, // Tab bar'ın üstünde
          paddingBottom: Math.max(insets.bottom, 8),
        },
        animatedContainerStyle,
      ]}
    >
      <BlurView
        intensity={80}
        tint="dark"
        style={styles.blurContainer}
      >
        {/* Progress Bar (En üstte ince çizgi) */}
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>

        {/* İçerik */}
        <View style={styles.content}>
          {/* Sol: Albüm Kapağı (Dönen) */}
          <Animated.View style={animatedAlbumArtStyle}>
            {currentTrack.album_art ? (
              <Image
                source={{ uri: currentTrack.album_art }}
                style={styles.albumArt}
              />
            ) : (
              <View style={[styles.albumArt, styles.albumArtPlaceholder]}>
                <Text style={styles.albumArtText}>
                  {currentTrack.track_name?.charAt(0) || '🎵'}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Orta: Şarkı Bilgileri */}
          <View style={styles.trackInfo}>
            <Text 
              style={styles.trackName}
              numberOfLines={1}
            >
              {currentTrack.track_name || 'Bilinmeyen Şarkı'}
            </Text>
            <Text 
              style={styles.artistName}
              numberOfLines={1}
            >
              {currentTrack.artist_name || 'Bilinmeyen Sanatçı'}
            </Text>
          </View>

          {/* Sağ: Oynat/Durdur Butonu */}
          <AnimatedPressable
            onPress={togglePlay}
            style={({ pressed }) => [
              styles.playButton,
              pressed && { opacity: 0.7 },
            ]}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingIndicator} />
            ) : isPlaying ? (
              <Pause size={24} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
            )}
          </AnimatedPressable>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
  },
  progressBarContainer: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#60A5FA',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
  },
  albumArtPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
  },
  albumArtText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0, // Text overflow için
  },
  trackName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  artistName: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#60A5FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
  },
});
