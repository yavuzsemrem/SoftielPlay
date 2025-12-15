import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {Colors} from '@constants/colors';
import {usePlayerStore} from '@store/player.store';
import {usePlaylistStore} from '@store/playlist.store';
import {useTrackStore} from '@store/track.store';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {StackParamList} from '@types/navigation';

const logoImage = require('../../assets/logo.png');

type Props = NativeStackScreenProps<StackParamList, 'MainTabs'>;

export default function HomeScreen({navigation}: Props) {
  const {currentTrack, isPlaying, playTrack} = usePlayerStore();
  const {playlists} = usePlaylistStore();
  const {tracks} = useTrackStore();

  useEffect(() => {
    usePlaylistStore.getState().loadPlaylists();
    useTrackStore.getState().loadTracks();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Minimal Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.greeting}>Hoş Geldin</Text>
          <Text style={styles.title}>Müziğini Keşfet</Text>
        </View>

        {/* Now Playing - Minimal Card */}
        {currentTrack && (
          <TouchableOpacity
            style={styles.nowPlayingCard}
            onPress={() => navigation.navigate('Player')}
            activeOpacity={0.8}>
            <View style={styles.nowPlayingContent}>
              {currentTrack.artwork ? (
                <Image
                  source={{uri: currentTrack.artwork}}
                  style={styles.nowPlayingArtwork}
                />
              ) : (
                <View style={styles.nowPlayingArtworkPlaceholder}>
                  <Ionicons name="musical-note" size={24} color={Colors.primary} />
                </View>
              )}
              <View style={styles.nowPlayingInfo}>
                <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                  {currentTrack.title}
                </Text>
                <Text style={styles.nowPlayingArtist} numberOfLines={1}>
                  {currentTrack.artist}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.nowPlayingButton}
                onPress={(e) => {
                  e.stopPropagation();
                  usePlayerStore.getState().togglePlayPause();
                }}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={20}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.7}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryBright]}
              style={styles.quickActionGradient}>
              <Ionicons name="search" size={24} color={Colors.textPrimary} />
            </LinearGradient>
            <Text style={styles.quickActionText}>Ara</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Library')}
            activeOpacity={0.7}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryBright]}
              style={styles.quickActionGradient}>
              <Ionicons name="library" size={24} color={Colors.textPrimary} />
            </LinearGradient>
            <Text style={styles.quickActionText}>Kütüphane</Text>
          </TouchableOpacity>
        </View>

        {/* Playlists Section */}
        {playlists.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Çalma Listelerin</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Library')}
                activeOpacity={0.7}>
                <Text style={styles.seeAll}>Tümü</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}>
              {playlists.slice(0, 5).map((playlist) => (
                <TouchableOpacity
                  key={playlist.id}
                  style={styles.playlistCard}
                  onPress={() =>
                    navigation.navigate('Playlist', {playlistId: playlist.id})
                  }
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.playlistGradient}>
                    <Ionicons name="musical-notes" size={32} color={Colors.textPrimary} />
                  </LinearGradient>
                  <Text style={styles.playlistName} numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text style={styles.playlistTracks}>
                    {playlist.tracks.length} şarkı
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Tracks */}
        {tracks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Son Eklenenler</Text>
            {tracks
              .slice(-10)
              .reverse()
              .map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={styles.trackCard}
                  onPress={() => playTrack(track)}
                  activeOpacity={0.7}>
                  {track.artwork ? (
                    <Image
                      source={{uri: track.artwork}}
                      style={styles.trackArtwork}
                    />
                  ) : (
                    <View style={styles.trackArtworkPlaceholder}>
                      <Ionicons name="musical-note" size={20} color={Colors.primary} />
                    </View>
                  )}
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle} numberOfLines={1}>
                      {track.title}
                    </Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>
                      {track.artist}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.trackPlayButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      playTrack(track);
                    }}
                    activeOpacity={0.8}>
                    <Ionicons name="play" size={18} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* Empty States */}
        {playlists.length === 0 && tracks.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>Henüz içerik yok</Text>
            <Text style={styles.emptySubtext}>
              Arama yaparak şarkı ekleyebilirsin
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryBright]}
                style={styles.emptyButtonGradient}>
                <Ionicons name="search" size={20} color={Colors.textPrimary} />
                <Text style={styles.emptyButtonText}>Ara</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Mini player için ekstra padding
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 64,
    height: 64,
  },
  greeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  nowPlayingCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nowPlayingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nowPlayingArtwork: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  nowPlayingArtworkPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlayingInfo: {
    flex: 1,
  },
  nowPlayingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  nowPlayingArtist: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  nowPlayingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingRight: 20,
  },
  playlistCard: {
    width: 140,
    marginRight: 12,
  },
  playlistGradient: {
    width: 140,
    height: 140,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  playlistName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  playlistTracks: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trackArtwork: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  trackArtworkPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  trackPlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
