import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {Colors} from '@constants/colors';
import {spotifyService} from '@services/spotify.service';
import {usePlayerStore} from '@store/player.store';
import {useTrackStore} from '@store/track.store';
import type {Track} from '@types';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {playTrack} = usePlayerStore();
  const {addTrack} = useTrackStore();

  const handleSearch = async () => {
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const tracks = await spotifyService.searchTracks(query, 20);
      setResults(tracks);
      // Bulunan track'ları store'a ekle
      tracks.forEach((track) => addTrack(track));
    } catch (err) {
      setError('Arama yapılamadı. Lütfen tekrar deneyin.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = async (track: Track) => {
    try {
      await playTrack(track);
    } catch (err: any) {
      console.error('Play track error:', err);
      Alert.alert(
        'Şarkı Çalınamadı',
        err.message || 'Şarkı çalınamadı. Lütfen tekrar deneyin.',
        [{text: 'Tamam'}],
      );
    }
  };

  const renderTrack = ({item}: {item: Track}) => (
    <TouchableOpacity
      style={styles.trackCard}
      onPress={() => handlePlayTrack(item)}
      activeOpacity={0.7}>
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
        <Ionicons name="play" size={18} color={Colors.textPrimary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ara</Text>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={Colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Şarkı, sanatçı veya albüm ara..."
              placeholderTextColor={Colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery('');
                  setResults([]);
                }}
                style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading || !query.trim()}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color={Colors.textPrimary} size="small" />
            ) : (
              <LinearGradient
                colors={[Colors.primary, Colors.primaryBright]}
                style={styles.searchButtonGradient}>
                <Ionicons name="search" size={20} color={Colors.textPrimary} />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && results.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Aranıyor...</Text>
        </View>
      ) : results.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={80} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>Arama yapmak için yukarıdaki kutuya yazın</Text>
          <Text style={styles.emptySubtext}>
            Spotify'dan milyonlarca şarkıyı keşfedin
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderTrack}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
});
