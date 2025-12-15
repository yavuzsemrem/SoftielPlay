import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {Colors} from '@constants/colors';
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
      style={styles.playlistCard}
      onPress={() => navigation.navigate('Playlist', {playlistId: item.id})}
      activeOpacity={0.7}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.playlistIcon}>
        <Ionicons name="musical-notes" size={28} color={Colors.textPrimary} />
      </LinearGradient>
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.playlistTracks}>
          {item.tracks.length} şarkı
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={80} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>Henüz çalma listen yok</Text>
            <Text style={styles.emptySubtext}>
              İlk çalma listeni oluşturmak için arama yap
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
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  list: {
    padding: 20,
    paddingBottom: 100, // Mini player için ekstra padding
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playlistIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  playlistTracks: {
    fontSize: 14,
    color: Colors.textSecondary,
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
});
