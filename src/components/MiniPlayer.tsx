import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {Colors} from '@constants/colors';
import {usePlayerStore} from '@store/player.store';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {StackParamList} from '@types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<StackParamList>;
};

export default function MiniPlayer({navigation}: Props) {
  const {currentTrack, isPlaying, togglePlayPause} = usePlayerStore();
  const insets = useSafeAreaInsets();

  if (!currentTrack) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 12,
        },
      ]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => navigation.navigate('Player')}
        activeOpacity={0.9}>
        <LinearGradient
          colors={[Colors.card, Colors.cardHover]}
          style={styles.gradient}>
          <View style={styles.content}>
            {/* Artwork */}
            {currentTrack.artwork ? (
              <Image
                source={{uri: currentTrack.artwork}}
                style={styles.artwork}
              />
            ) : (
              <View style={styles.artworkPlaceholder}>
                <Ionicons name="musical-note" size={20} color={Colors.primary} />
              </View>
            )}

            {/* Track Info */}
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={styles.trackArtist} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
            </View>

            {/* Controls */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryBright]}
                style={styles.playButtonGradient}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={18}
                  color={Colors.textPrimary}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  touchable: {
    width: '100%',
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  artworkPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
