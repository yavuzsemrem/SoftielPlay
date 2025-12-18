import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { 
  User, 
  Settings, 
  Heart, 
  Users,
  Music,
  LogOut,
  Edit3,
  ChevronRight,
  Crown
} from 'lucide-react-native';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { BlurView } from 'expo-blur';
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

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { user, signOut } = useAuth();
  const isDark = colorScheme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';

  // Örnek istatistikler
  const stats = [
    { label: 'Takipçi', value: '1.2K', icon: Users, color: '#60A5FA' },
    { label: 'Takip Edilen', value: '456', icon: User, color: '#34D399' },
    { label: 'Beğeniler', value: '2.8K', icon: Heart, color: '#F472B6' },
    { label: 'Çalma Listesi', value: '24', icon: Music, color: '#FBBF24' },
  ];

  const menuItems = [
    { 
      id: 1, 
      label: 'Ayarlar', 
      icon: Settings, 
      color: '#60A5FA',
      onPress: () => {},
    },
    { 
      id: 2, 
      label: 'Beğenilen Şarkılar', 
      icon: Heart, 
      color: '#F472B6',
      onPress: () => {},
    },
    { 
      id: 3, 
      label: 'Takipçiler', 
      icon: Users, 
      color: '#34D399',
      onPress: () => {},
    },
    { 
      id: 4, 
      label: 'Takip Edilenler', 
      icon: User, 
      color: '#818CF8',
      onPress: () => {},
    },
  ];

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
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100, paddingHorizontal: 20 }}
      >
        {/* Profile Header */}
        <View style={{ paddingTop: 16, paddingBottom: 20 }}>
          {/* Profile Card */}
          <LinearGradient
            colors={isDark ? ['#1A1A1A', '#2A2A2A'] : ['#FFFFFF', '#F9FAFB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: isDark ? '#3B82F640' : '#E5E5E5',
              marginBottom: 20,
              shadowColor: '#60A5FA',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <LinearGradient
                colors={['#3B82F620', '#60A5FA30']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  borderWidth: 1.5,
                  borderColor: '#3B82F640',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#60A5FA' }}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text 
                    style={{ 
                      fontSize: 18,
                      fontWeight: '700',
                      marginRight: 8,
                      color: textPrimary,
                    }}
                  >
                    {userName}
                  </Text>
                  <View 
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8,
                      backgroundColor: '#3B82F620',
                    }}
                  >
                    <Crown size={12} color="#FBBF24" fill="#FBBF24" />
                  </View>
                </View>
                <Text 
                  style={{ 
                    fontSize: 13,
                    marginBottom: 12,
                    color: textSecondary,
                  }}
                >
                  {user?.email || 'email@example.com'}
                </Text>
                <ScalePressable>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Edit3 size={14} color="#60A5FA" style={{ marginRight: 6 }} />
                    <Text 
                      style={{ 
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#60A5FA',
                      }}
                    >
                      Profili Düzenle
                    </Text>
                  </View>
                </ScalePressable>
              </View>
            </View>
          </LinearGradient>

          {/* Stats Grid */}
          <LinearGradient
            colors={isDark ? ['#1A1A1A', '#2A2A2A'] : ['#FFFFFF', '#F9FAFB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: 'row',
              borderWidth: 1,
              borderColor: isDark ? '#3B82F640' : '#E5E5E5',
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              shadowColor: '#60A5FA',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                  <LinearGradient
                    colors={[`${stat.color}20`, `${stat.color}30`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <IconComponent size={18} color={stat.color} />
                  </LinearGradient>
                  <Text 
                    style={{ 
                      fontSize: 18,
                      fontWeight: '700',
                      marginBottom: 2,
                      color: textPrimary,
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text 
                    style={{ 
                      fontSize: 11,
                      color: textSecondary,
                    }}
                  >
                    {stat.label}
                  </Text>
                  {index < stats.length - 1 && (
                    <View
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        backgroundColor: isDark ? '#2A2A2A' : '#E5E5E5',
                      }}
                    />
                  )}
                </View>
              );
            })}
          </LinearGradient>
        </View>

        {/* Menu Items */}
        <View>
          <Text 
            style={{ 
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 12,
              color: textPrimary,
            }}
          >
            Menü
          </Text>
          <View>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <ScalePressable
                  key={item.id}
                  onPress={item.onPress}
                >
                  <LinearGradient
                    colors={isDark ? ['#1A1A1A', '#2A2A2A'] : ['#FFFFFF', '#F9FAFB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ 
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderRadius: 16,
                      padding: 12,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: isDark ? '#3B82F640' : '#E5E5E5',
                      shadowColor: '#60A5FA',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                  >
                    <LinearGradient
                      colors={[`${item.color}20`, `${item.color}30`]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <IconComponent size={18} color={item.color} />
                    </LinearGradient>
                    <Text 
                      style={{ 
                        flex: 1,
                        fontSize: 15,
                        fontWeight: '600',
                        color: textPrimary,
                      }}
                    >
                      {item.label}
                    </Text>
                    <ChevronRight size={18} color={textSecondary} />
                  </LinearGradient>
                </ScalePressable>
              );
            })}
          </View>
        </View>

        {/* Logout Button */}
        <View style={{ marginTop: 16, marginBottom: 24 }}>
          <ScalePressable onPress={signOut}>
            <View
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                padding: 14,
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderWidth: 1,
                borderColor: '#DC262620',
              }}
            >
              <LogOut size={18} color="#DC2626" style={{ marginRight: 8 }} />
              <Text 
                style={{ 
                  fontSize: 15,
                  fontWeight: '600',
                  color: '#DC2626',
                }}
              >
                Çıkış Yap
              </Text>
            </View>
          </ScalePressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}



