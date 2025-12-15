import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {Colors} from '@constants/colors';
import {usePlaylistStore} from '@store/playlist.store';
import {useTrackStore} from '@store/track.store';
import {usePlayerStore} from '@store/player.store';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {StackParamList} from '@types/navigation';
import type {Track} from '@types';

type Props = NativeStackScreenProps<StackParamList, 'Playlist'>;

export default function PlaylistScreen({route, navigation}: Props) {
  const {playlistId} = route.params;
  const {playlists} = usePlaylistStore();
  const {getTrack} = useTrackStore();
  const {playTrack} = usePlayerStore();
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);

  const playlist = playlists.find((p) => p.id === playlistId);

  useEffect(() => {
    if (playlist) {
      const tracks = playlist.tracks
        .map((trackId) => getTrack(trackId))
        .filter((track): track is Track => track !== undefined);
      setPlaylistTracks(tracks);
    }
  }, [playlist, getTrack]);

  const handlePlayTrack = async (track: Track) => {
    await playTrack(track);
  };

  const renderTrack = ({item, index}: {item: Track; index: number}) => (
    <TouchableOpacity
      style={styles.trackCard}
      onPress={() => handlePlayTrack(item)}
      activeOpacity={0.7}>
      <Text style={styles.trackNumber}>{index + 1}</Text>
      {item.artwork ? (
        <Image source={{uri: item.artwork}} style={styles.artwork} />
      ) : (
        <View style={styles.artworkPlaceholder}>
          <Ionicons name="musical-note" size={20} color={Colors.primary} />
        </View>
      )}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.playButton}
        onPress={(e) => {
          e.stopPropagation();
          handlePlayTrack(item);
        }}
        activeOpacity={0.8}>
        <Ionicons name="play" size={16} color={Colors.textPrimary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (!playlist) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.error} />
          <Text style={styles.errorText}>Çalma listesi bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {playlist.name}
        </Text>
        {playlist.description && (
          <Text style={styles.description} numberOfLines={2}>
            {playlist.description}
          </Text>
        )}
        <View style={styles.trackCountContainer}>
          <Ionicons name="musical-note" size={16} color={Colors.textSecondary} />
          <Text style={styles.trackCount}>
            {playlistTracks.length} şarkı
          </Text>
        </View>
      </View>

      <FlatList
        data={playlistTracks}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={80} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>Bu listede şarkı yok</Text>
            <Text style={styles.emptySubtext}>
              Arama yaparak şarkı ekleyebilirsin
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  trackCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  list: {
    padding: 20,
    paddingBottom: 100, // Mini player için ekstra padding
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
  trackNumber: {
    width: 24,
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  artwork: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  artworkPlaceholder: {
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
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    color: Colors.textPrimary,
    fontSize: 18,
    textAlign: 'center',
  },
});
