import { useState } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { 
  Search as SearchIcon, 
  X, 
  TrendingUp,
  Music,
  PlayCircle,
  History
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSearch } from '@/features/search/hooks/useSearch';
import SongItem from '@/features/search/components/SongItem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScalePressable({ children, onPress, style, ...props }: any) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches] = useState([
    'Pop Müzik',
    'Rock Klasikleri',
    'Jazz Akşamları',
    'Elektronik Müzik',
  ]);
  const [trendingSearches] = useState([
    { id: 1, term: '2024 Hit Şarkılar', icon: TrendingUp, gradient: ['#60A5FA', '#3B82F6'] },
    { id: 2, term: 'Yeni Çıkanlar', icon: Music, gradient: ['#34D399', '#10B981'] },
    { id: 3, term: 'Popüler Albümler', icon: PlayCircle, gradient: ['#F472B6', '#EC4899'] },
  ]);

  // useSearch hook'unu kullan
  const { results, isLoading, isError, error } = useSearch(searchQuery);

  // Debug: Sonuçları konsola yazdır
  console.log('🎵 SearchScreen - results:', results);
  console.log('🎵 SearchScreen - isLoading:', isLoading);
  console.log('🎵 SearchScreen - isError:', isError);
  console.log('🎵 SearchScreen - error:', error);

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      {/* Sticky Header with Search Bar */}
      <View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 20,
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#1A1A1A' : '#E5E5E5',
        }}
      >
        <View style={{ position: 'relative' }}>
          <View 
            style={{
              position: 'absolute',
              left: 16,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              zIndex: 10,
            }}
            pointerEvents="none"
          >
            <SearchIcon size={20} color={textSecondary} />
          </View>
          <TextInput
            style={{ 
              width: '100%',
              paddingLeft: 48,
              paddingRight: searchQuery.length > 0 ? 48 : 16,
              paddingVertical: 14,
              borderRadius: 16,
              fontSize: 16,
              backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
              color: textPrimary,
              borderWidth: 1,
              borderColor: isDark ? '#2A2A2A' : '#E5E5E5',
            }}
            placeholder="Şarkı, sanatçı veya çalma listesi ara..."
            placeholderTextColor={textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <ScalePressable
              style={{
                position: 'absolute',
                right: 16,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
                zIndex: 10,
                padding: 4,
              }}
              onPress={() => setSearchQuery('')}
            >
              <X size={18} color={textSecondary} />
            </ScalePressable>
          )}
        </View>
      </View>

      {searchQuery.length > 0 ? (
        <View style={{ flex: 1, paddingTop: insets.top + 35 }}>
          {isLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
              <ActivityIndicator size="large" color="#60A5FA" />
              <Text 
                style={{ 
                  marginTop: 16,
                  fontSize: 16,
                  color: textSecondary,
                  fontWeight: '500',
                }}
              >
                Aranıyor...
              </Text>
            </View>
          ) : isError ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100, paddingHorizontal: 20 }}>
              <Text 
                style={{ 
                  fontSize: 16,
                  color: '#EF4444',
                  textAlign: 'center',
                  fontWeight: '500',
                  marginBottom: 8,
                }}
              >
                Arama sırasında bir hata oluştu.
              </Text>
              {error && (
                <Text 
                  style={{ 
                    fontSize: 12,
                    color: '#9CA3AF',
                    textAlign: 'center',
                    marginTop: 8,
                  }}
                >
                  {error.message || 'Bilinmeyen hata'}
                </Text>
              )}
            </View>
          ) : results.length > 0 ? (
            <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8 }}>
              <Text 
                style={{ 
                  fontSize: 20,
                  fontWeight: '700',
                  marginBottom: 16,
                  marginTop: 8,
                  color: textPrimary,
                }}
              >
                Arama Sonuçları ({results.length})
              </Text>
              <FlatList
                data={results}
                keyExtractor={(item) => item.videoId || `item-${item.title}`}
                renderItem={({ item }) => {
                  console.log('🎬 Rendering item:', item);
                  return (
                    <SongItem
                      videoId={item.videoId}
                      title={item.title}
                      artist={item.artist}
                      thumbnail={item.thumbnail}
                      duration={item.duration}
                      onPress={() => {
                        // TODO: Şarkı çalma işlevi eklenecek
                        console.log('Şarkı seçildi:', item);
                      }}
                    />
                  );
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: textSecondary }}>Sonuç yükleniyor...</Text>
                  </View>
                }
              />
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100, paddingHorizontal: 20 }}>
              <Text 
                style={{ 
                  fontSize: 16,
                  color: textSecondary,
                  textAlign: 'center',
                  fontWeight: '500',
                }}
              >
                Sonuç bulunamadı. Farklı bir arama terimi deneyin.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: insets.top + 35, paddingBottom: 100, paddingHorizontal: 20 }}
        >
          {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <History size={18} color={textSecondary} style={{ marginRight: 8 }} />
                    <Text 
                      style={{ 
                        fontSize: 18,
                        fontWeight: '700',
                        color: textPrimary,
                      }}
                    >
                      Son Aramalar
                    </Text>
                  </View>
                  <ScalePressable>
                    <Text 
                      style={{ 
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#60A5FA',
                      }}
                    >
                      Temizle
                    </Text>
                  </ScalePressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {recentSearches.map((search, index) => (
                    <ScalePressable
                      key={index}
                      onPress={() => setSearchQuery(search)}
                    >
                      <LinearGradient
                        colors={isDark ? ['#1A1A1A', '#2A2A2A'] : ['#F5F5F5', '#FFFFFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ 
                          borderRadius: 20,
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderWidth: 1,
                          borderColor: isDark ? '#3B82F640' : '#E5E5E5',
                        }}
                      >
                        <Text 
                          style={{ 
                            fontSize: 14,
                            fontWeight: '500',
                            color: textPrimary,
                          }}
                        >
                          {search}
                        </Text>
                      </LinearGradient>
                    </ScalePressable>
                  ))}
                </View>
              </View>
            )}

            {/* Trending Searches */}
            <View style={{ marginBottom: 24 }}>
              <Text 
                style={{ 
                  fontSize: 18,
                  fontWeight: '700',
                  marginBottom: 16,
                  color: textPrimary,
                }}
              >
                Popüler Kategoriler
              </Text>
              <View style={{ gap: 12 }}>
                {trendingSearches.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <ScalePressable
                      key={item.id}
                      onPress={() => setSearchQuery(item.term)}
                    >
                      <LinearGradient
                        colors={item.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          borderRadius: 16,
                          padding: 16,
                          shadowColor: item.gradient[0],
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 12,
                          elevation: 6,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View 
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12,
                            }}
                          >
                            <IconComponent size={24} color="#FFFFFF" />
                          </View>
                          <Text 
                            style={{ 
                              flex: 1,
                              fontSize: 16,
                              fontWeight: '700',
                              color: '#FFFFFF',
                            }}
                          >
                            {item.term}
                          </Text>
                          <TrendingUp size={20} color="#FFFFFF" />
                        </View>
                      </LinearGradient>
                    </ScalePressable>
                  );
                })}
              </View>
            </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
