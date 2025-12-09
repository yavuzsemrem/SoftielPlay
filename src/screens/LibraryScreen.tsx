import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {usePlaylistStore} from '@store/playlist.store';
import {useTrackStore} from '@store/track.store';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {StackParamList} from '@types/navigation';

type Props = NativeStackScreenProps<StackParamList, 'MainTabs'>;

export default function LibraryScreen({navigation}: Props) {
  const {playlists} = usePlaylistStore();
  const {tracks} = useTrackStore();

  useEffect(() => {
    usePlaylistStore.getState().loadPlaylists();
    useTrackStore.getState().loadTracks();
  }, []);

  const renderPlaylist = ({item}: {item: typeof playlists[0]}) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => navigation.navigate('Playlist', {playlistId: item.id})}>
      <View style={styles.playlistIcon}>
        <Text style={styles.playlistIconText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.playlistTracks}>
          {item.tracks.length} şarkı
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kütüphanen</Text>
        <Text style={styles.subtitle}>
          {playlists.length} çalma listesi • {tracks.length} şarkı
        </Text>
      </View>

      <FlatList
        data={playlists}
        renderItem={renderPlaylist}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Henüz çalma listen yok</Text>
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
  subtitle: {
    fontSize: 16,
    color: '#b3b3b3',
  },
  list: {
    padding: 16,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 12,
  },
  playlistIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  playlistIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  playlistTracks: {
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
});

