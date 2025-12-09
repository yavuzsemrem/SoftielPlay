import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
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

  const renderTrack = ({item}: {item: Track}) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => handlePlayTrack(item)}>
      {item.artwork && (
        <Image source={{uri: item.artwork}} style={styles.artwork} />
      )}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Çalma listesi bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{playlist.name}</Text>
        {playlist.description && (
          <Text style={styles.description}>{playlist.description}</Text>
        )}
        <Text style={styles.trackCount}>
          {playlistTracks.length} şarkı
        </Text>
      </View>

      <FlatList
        data={playlistTracks}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Bu listede şarkı yok</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#b3b3b3',
    marginBottom: 8,
  },
  trackCount: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  list: {
    padding: 16,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 12,
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 4,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

