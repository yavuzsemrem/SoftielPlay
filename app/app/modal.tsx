import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { 
  X, 
  Info, 
  Music, 
  Headphones,
  Download,
  Radio,
  Sparkles
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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

export default function ModalScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  const textPrimary = isDark ? '#FFFFFF' : '#111827';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';

  const features = [
    { 
      icon: Music, 
      title: 'Sınırsız Müzik', 
      description: 'Milyonlarca şarkıya erişim',
      color: '#60A5FA',
      gradient: ['#60A5FA', '#3B82F6']
    },
    { 
      icon: Download, 
      title: 'Offline İndirme', 
      description: 'İnternet olmadan dinle',
      color: '#34D399',
      gradient: ['#34D399', '#10B981']
    },
    { 
      icon: Headphones, 
      title: 'Yüksek Kalite', 
      description: 'Premium ses kalitesi',
      color: '#F472B6',
      gradient: ['#F472B6', '#EC4899']
    },
    { 
      icon: Sparkles, 
      title: 'Reklamsız', 
      description: 'Kesintisiz müzik deneyimi',
      color: '#FBBF24',
      gradient: ['#FBBF24', '#F59E0B']
    },
  ];

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View 
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#3B82F620',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Info size={20} color="#60A5FA" />
          </View>
          <Text 
            style={{ 
              fontSize: 22,
              fontWeight: '700',
              color: textPrimary,
            }}
          >
            Hakkında
          </Text>
        </View>
        <ScalePressable onPress={() => router.back()}>
          <View 
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
              borderWidth: 1,
              borderColor: isDark ? '#2A2A2A' : '#E5E5E5',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} color={textPrimary} />
          </View>
        </ScalePressable>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
      >
        {/* App Info Card */}
        <View
          style={{
            borderRadius: 16,
            padding: 24,
            borderWidth: 1,
            borderColor: isDark ? '#2A2A2A' : '#E5E5E5',
            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
            marginBottom: 24,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View 
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: '#3B82F620',
                borderWidth: 1.5,
                borderColor: '#3B82F640',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Music size={36} color="#60A5FA" />
            </View>
            <Text 
              style={{ 
                fontSize: 24,
                fontWeight: '700',
                marginBottom: 4,
                color: textPrimary,
              }}
            >
              SoftielPlay
            </Text>
            <Text 
              style={{ 
                fontSize: 14,
                color: textSecondary,
              }}
            >
              Premium müzik deneyimi
            </Text>
          </View>
          <View 
            style={{
              height: 1,
              backgroundColor: isDark ? '#2A2A2A' : '#E5E5E5',
              marginVertical: 20,
            }}
          />
          <Text 
            style={{ 
              fontSize: 14,
              lineHeight: 20,
              textAlign: 'center',
              color: textSecondary,
            }}
          >
            YouTube tabanlı, akıllı cache mekanizmalı ve sosyal özellikli profesyonel müzik platformu. 
            Milyonlarca şarkıya erişim, offline dinleme ve daha fazlası.
          </Text>
        </View>

        {/* Features */}
        <View style={{ marginBottom: 24 }}>
          <Text 
            style={{ 
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 16,
              color: textPrimary,
            }}
          >
            Özellikler
          </Text>
          <View>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <ScalePressable key={index} style={{ marginBottom: 12 }}>
                  <LinearGradient
                    colors={feature.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 16,
                      padding: 16,
                      shadowColor: feature.color,
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
                          borderRadius: 24,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        <IconComponent size={24} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text 
                          style={{ 
                            fontSize: 16,
                            fontWeight: '700',
                            marginBottom: 4,
                            color: '#FFFFFF',
                          }}
                        >
                          {feature.title}
                        </Text>
                        <Text 
                          style={{ 
                            fontSize: 13,
                            color: 'rgba(255, 255, 255, 0.8)',
                          }}
                        >
                          {feature.description}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </ScalePressable>
              );
            })}
          </View>
        </View>

        {/* Version Info */}
        <View>
          <View 
            style={{
              borderRadius: 16,
              padding: 16,
              backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
              borderWidth: 1,
              borderColor: isDark ? '#2A2A2A' : '#E5E5E5',
            }}
          >
            <Text 
              style={{ 
                fontSize: 13,
                textAlign: 'center',
                color: textSecondary,
              }}
            >
              Versiyon 1.0.0
            </Text>
            <Text 
              style={{ 
                fontSize: 11,
                textAlign: 'center',
                marginTop: 4,
                color: textSecondary,
              }}
            >
              © 2024 SoftielPlay. Tüm hakları saklıdır.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
