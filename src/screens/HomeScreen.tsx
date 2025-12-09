import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {usePlayerStore} from '@store/player.store';
import {usePlaylistStore} from '@store/playlist.store';
import {useTrackStore} from '@store/track.store';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {StackParamList} from '@types/navigation';

type Props = NativeStackScreenProps<StackParamList, 'MainTabs'>;

export default function HomeScreen({navigation}: Props) {
  const {currentTrack, isPlaying} = usePlayerStore();
  const {playlists} = usePlaylistStore();
  const {tracks} = useTrackStore();

  useEffect(() => {
    // Store'ları yükle
    usePlaylistStore.getState().loadPlaylists();
    useTrackStore.getState().loadTracks();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hoş Geldin</Text>
        <Text style={styles.subtitle}>Müziğini keşfet</Text>
      </View>

      {currentTrack && (
        <View style={styles.nowPlaying}>
          <Text style={styles.nowPlayingTitle}>Şimdi Çalıyor</Text>
          <Text style={styles.nowPlayingTrack}>
            {currentTrack.title} - {currentTrack.artist}
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Çalma Listelerin</Text>
        {playlists.length === 0 ? (
          <Text style={styles.emptyText}>Henüz çalma listen yok</Text>
        ) : (
          playlists.slice(0, 5).map((playlist) => (
            <TouchableOpacity
              key={playlist.id}
              style={styles.playlistItem}
              onPress={() =>
                navigation.navigate('Playlist', {playlistId: playlist.id})
              }>
              <Text style={styles.playlistName}>{playlist.name}</Text>
              <Text style={styles.playlistTracks}>
                {playlist.tracks.length} şarkı
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Son Eklenenler</Text>
        {tracks.length === 0 ? (
          <Text style={styles.emptyText}>Henüz şarkı eklenmedi</Text>
        ) : (
          tracks
            .slice(-5)
            .reverse()
            .map((track) => (
              <TouchableOpacity
                key={track.id}
                style={styles.trackItem}
                onPress={() => usePlayerStore.getState().playTrack(track)}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={styles.trackArtist}>{track.artist}</Text>
              </TouchableOpacity>
            ))
        )}
      </View>
    </ScrollView>
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
  nowPlaying: {
    margin: 20,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  nowPlayingTitle: {
    fontSize: 12,
    color: '#b3b3b3',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  nowPlayingTrack: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  playlistItem: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 12,
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
  trackItem: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 12,
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
});

