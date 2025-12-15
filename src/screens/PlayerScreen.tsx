import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {Colors} from '@constants/colors';
import {usePlayerStore} from '@store/player.store';

export default function PlayerScreen() {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    updatePosition,
  } = usePlayerStore();

  useEffect(() => {
    // Position güncellemelerini başlat
    const interval = setInterval(() => {
      updatePosition();
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTrack, updatePosition]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={80} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>Çalan şarkı yok</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd, Colors.background]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.gradient}>
        <View style={styles.content}>
          {/* Artwork */}
          <View style={styles.artworkContainer}>
            {currentTrack.artwork ? (
              <Image
                source={{uri: currentTrack.artwork}}
                style={styles.artwork}
              />
            ) : (
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.artworkPlaceholder}>
                <Ionicons name="musical-note" size={80} color={Colors.textPrimary} />
              </LinearGradient>
            )}
          </View>

          {/* Track Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration || 1}
              value={position}
              onSlidingComplete={seekTo}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.primary}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{formatTime(position)}</Text>
              <Text style={styles.time}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={skipToPrevious}
              activeOpacity={0.7}>
              <Ionicons name="play-skip-back" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryBright]}
                style={styles.playButtonGradient}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={36}
                  color={Colors.textPrimary}
                />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={skipToNext}
              activeOpacity={0.7}>
              <Ionicons name="play-skip-forward" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  artworkContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  artwork: {
    width: 320,
    height: 320,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 20},
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  artworkPlaceholder: {
    width: 320,
    height: 320,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 20},
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  infoContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  artist: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    marginVertical: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  time: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginBottom: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  playButtonGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
