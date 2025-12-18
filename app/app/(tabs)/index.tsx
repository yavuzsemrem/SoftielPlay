import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { 
  Music, 
  Clock, 
  TrendingUp, 
  PlayCircle,
  MoreVertical,
  Heart,
  ChevronRight,
  Settings,
  User
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

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

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const isDark = colorScheme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';

  // Örnek veriler - gerçek uygulamada API'den gelecek
  const recentTracks = [
    { id: 1, title: 'Son Dinlenen Şarkı 1', artist: 'Sanatçı 1', duration: '3:45', image: null },
    { id: 2, title: 'Son Dinlenen Şarkı 2', artist: 'Sanatçı 2', duration: '4:12', image: null },
    { id: 3, title: 'Son Dinlenen Şarkı 3', artist: 'Sanatçı 3', duration: '2:58', image: null },
    { id: 4, title: 'Son Dinlenen Şarkı 4', artist: 'Sanatçı 4', duration: '5:20', image: null },
  ];

  const recentPlaylists = [
    { id: 1, name: 'Favori Şarkılarım', count: 24, image: null },
    { id: 2, name: 'Yolculuk Müzikleri', count: 18, image: null },
    { id: 3, name: 'Çalışma Listesi', count: 32, image: null },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi Günler';
    return 'İyi Akşamlar';
  };

  const userName = user?.email?.split('@')[0] || 'Kullanıcı';
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      {/* Sticky Header */}
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ScalePressable>
            <LinearGradient
              colors={['#3B82F620', '#60A5FA30']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ 
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: '#3B82F640',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#60A5FA' }}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </ScalePressable>
          <ScalePressable>
            <View 
              style={{ 
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
                borderWidth: 1,
                borderColor: isDark ? '#2A2A2A' : '#E5E5E5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={20} color={textPrimary} />
            </View>
          </ScalePressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
      >
        {/* Greeting Section */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
          <View style={{ marginBottom: 24 }}>
            <Text 
              style={{ 
                fontSize: 16,
                fontWeight: '500',
                color: textSecondary,
                marginBottom: 4,
              }}
            >
              {getGreeting()}
            </Text>
            <Text 
              style={{ 
                fontSize: 28,
                fontWeight: '700',
                color: textPrimary,
              }}
              numberOfLines={1}
            >
              {userName}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <ScalePressable style={{ flex: 1 }}>
              <LinearGradient
                colors={['#60A5FA', '#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ 
                  borderRadius: 20,
                  padding: 16,
                  shadowColor: '#60A5FA',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <PlayCircle size={28} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginTop: 12, marginBottom: 4 }}>
                  Devam Et
                </Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 13 }}>
                  Son çaldığınız şarkı
                </Text>
              </LinearGradient>
            </ScalePressable>
            
            <ScalePressable style={{ flex: 1 }}>
              <LinearGradient
                colors={isDark ? ['#1A1A1A', '#2A2A2A'] : ['#FFFFFF', '#F5F5F5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ 
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: isDark ? '#3B82F640' : '#E5E5E5',
                  shadowColor: '#60A5FA',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <TrendingUp size={28} color="#60A5FA" />
                <Text 
                  style={{ 
                    fontWeight: '700',
                    fontSize: 16,
                    marginTop: 12,
                    marginBottom: 4,
                    color: textPrimary,
                  }}
                >
                  Trendler
                </Text>
                <Text 
                  style={{ 
                    fontSize: 13,
                    color: textSecondary,
                  }}
                >
                  Popüler şarkılar
                </Text>
              </LinearGradient>
            </ScalePressable>
          </View>
        </View>

        {/* Son Dinlenenler */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 }}>
            <Text 
              style={{ 
                fontSize: 20,
                fontWeight: '700',
                color: textPrimary,
              }}
            >
              Son Dinlenenler
            </Text>
            <ScalePressable>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text 
                  style={{ 
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#60A5FA',
                    marginRight: 4,
                  }}
                >
                  Tümünü Gör
                </Text>
                <ChevronRight size={16} color="#60A5FA" />
              </View>
            </ScalePressable>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 20 }}
          >
            {recentTracks.map((track) => (
              <ScalePressable key={track.id} style={{ marginRight: 12 }}>
                <LinearGradient
                  colors={isDark ? ['#1A1A1A', '#2A2A2A'] : ['#FFFFFF', '#F9FAFB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ 
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: isDark ? '#3B82F640' : '#E5E5E5',
                    width: 200,
                    shadowColor: '#60A5FA',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <LinearGradient
                    colors={['#3B82F620', '#60A5FA30']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ 
                      width: '100%',
                      height: 120,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Music size={40} color="#60A5FA" />
                  </LinearGradient>
                  <Text 
                    style={{ 
                      fontSize: 15,
                      fontWeight: '600',
                      marginBottom: 4,
                      color: textPrimary,
                    }}
                    numberOfLines={1}
                  >
                    {track.title}
                  </Text>
                  <Text 
                    style={{ 
                      fontSize: 13,
                      marginBottom: 8,
                      color: textSecondary,
                    }}
                    numberOfLines={1}
                  >
                    {track.artist}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Clock size={12} color={textSecondary} />
                      <Text 
                        style={{ 
                          fontSize: 12,
                          marginLeft: 4,
                          color: textSecondary,
                        }}
                      >
                        {track.duration}
                      </Text>
                    </View>
                    <ScalePressable>
                      <View style={{ padding: 4 }}>
                        <Heart size={16} color={textSecondary} />
                      </View>
                    </ScalePressable>
                  </View>
                </LinearGradient>
              </ScalePressable>
            ))}
          </ScrollView>
        </View>

        {/* Son Çalma Listeleri */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text 
              style={{ 
                fontSize: 20,
                fontWeight: '700',
                color: textPrimary,
              }}
            >
              Çalma Listeleri
            </Text>
            <ScalePressable>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text 
                  style={{ 
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#60A5FA',
                    marginRight: 4,
                  }}
                >
                  Tümünü Gör
                </Text>
                <ChevronRight size={16} color="#60A5FA" />
              </View>
            </ScalePressable>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {recentPlaylists.map((playlist) => (
              <ScalePressable key={playlist.id} style={{ marginRight: 12 }}>
                <LinearGradient
                  colors={isDark ? ['#1A1A1A', '#2A2A2A'] : ['#FFFFFF', '#F9FAFB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ 
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: isDark ? '#3B82F640' : '#E5E5E5',
                    width: 160,
                    shadowColor: '#60A5FA',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <LinearGradient
                    colors={['#3B82F620', '#60A5FA30']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ 
                      width: '100%',
                      height: 100,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Music size={32} color="#60A5FA" />
                  </LinearGradient>
                  <Text 
                    style={{ 
                      fontSize: 14,
                      fontWeight: '600',
                      marginBottom: 4,
                      color: textPrimary,
                    }}
                    numberOfLines={1}
                  >
                    {playlist.name}
                  </Text>
                  <Text 
                    style={{ 
                      fontSize: 12,
                      color: textSecondary,
                    }}
                  >
                    {playlist.count} şarkı
                  </Text>
                </LinearGradient>
              </ScalePressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
