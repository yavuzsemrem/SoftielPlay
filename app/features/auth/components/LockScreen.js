import { useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Linking, Animated, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Sparkles, Headphones, Download, Radio, AlertCircle, Mail, LogOut } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScalePressable({ children, onPress, style, ...props }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{ transform: [{ scale }] }, style]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function LockScreen() {
  const { signOut } = useAuth();
  
  const badgeScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const featuresOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(badgeScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(featuresOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleContact = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Alert.alert(
      'İletişim',
      'Pro sürüm için uygulama sahibi ile iletişime geçin:\n\nEmail: support@openaudio.app',
      [
        {
          text: 'Kapat',
          style: 'cancel',
        },
        {
          text: 'Email Gönder',
          onPress: () => {
            Linking.openURL('mailto:support@openaudio.app?subject=Pro Sürüm İsteği');
          },
        },
      ]
    );
  };

  const proFeatures = [
    { icon: Crown, text: 'Sınırsız müzik dinleme', color: '#818CF8', gradient: ['#818CF8', '#6366F1'] },
    { icon: Download, text: 'Offline indirme özelliği', color: '#F472B6', gradient: ['#F472B6', '#EC4899'] },
    { icon: Headphones, text: 'Yüksek kalite ses', color: '#60A5FA', gradient: ['#60A5FA', '#3B82F6'] },
    { icon: Sparkles, text: 'Reklamsız deneyim', color: '#FBBF24', gradient: ['#FBBF24', '#F59E0B'] },
    { icon: Radio, text: 'Özel playlistler', color: '#34D399', gradient: ['#34D399', '#10B981'] },
    { icon: Crown, text: 'Öncelikli destek', color: '#A78BFA', gradient: ['#A78BFA', '#8B5CF6'] },
  ];

  return (
    <LinearGradient
      colors={['#000000', '#0A0A0F', '#1A1A2E', '#000000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1" edges={['top', 'bottom']} style={{ backgroundColor: 'transparent' }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 48,
          minHeight: '100%',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo with Animation */}
        <Animated.View 
          style={{ 
            alignItems: 'center',
            marginBottom: 32,
            transform: [{ scale: badgeScale }],
            opacity: logoOpacity,
          }}
        >
          <Animated.View
            style={{
              shadowColor: '#60A5FA',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            <Image
              source={require('../../../assets/images/transparent.png')}
              style={{
                width: 100,
                height: 100,
                resizeMode: 'contain',
              }}
            />
          </Animated.View>
        </Animated.View>

        {/* Premium Badge with Animation */}
        <Animated.View 
          style={{ 
            alignItems: 'center',
            marginBottom: 32,
            opacity: titleOpacity,
          }}
        >
          <View 
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#3B82F6',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              shadowColor: '#60A5FA',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <Crown size={36} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          
          <Text 
            style={{ 
              fontSize: 26,
              fontWeight: '700',
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Pro Sürüme Geçin
          </Text>
          
          <Text style={{ 
            color: '#9CA3AF',
            textAlign: 'center',
            fontSize: 15,
            lineHeight: 22,
            paddingHorizontal: 16,
            fontWeight: '500',
          }}>
            Premium özelliklere erişmek için pro sürüme yükseltin
          </Text>
        </Animated.View>

        {/* Features Grid with Gradient Boxes */}
        <Animated.View 
          style={{ 
            marginBottom: 24,
            opacity: featuresOpacity,
          }}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {proFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <ScalePressable
                  key={index}
                  style={{ width: '48%', marginBottom: 12 }}
                >
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
                    <View style={{ alignItems: 'center' }}>
                      <View 
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 12,
                        }}
                      >
                        <IconComponent size={24} color="#FFFFFF" />
                      </View>
                      <Text 
                        style={{ 
                          color: '#FFFFFF',
                          fontSize: 13,
                          fontWeight: '600',
                          textAlign: 'center',
                          lineHeight: 18,
                        }}
                        numberOfLines={2}
                      >
                        {feature.text}
                      </Text>
                    </View>
                  </LinearGradient>
                </ScalePressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Info Card */}
        <Animated.View 
          style={{ 
            marginBottom: 20,
            opacity: featuresOpacity,
          }}
        >
          <View
            style={{
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#2A2A2A',
              backgroundColor: '#1A1A1A',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View 
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#60A5FA20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <AlertCircle size={20} color="#60A5FA" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15, marginBottom: 8 }}>
                  Özel Davet Gerekli
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: 13, lineHeight: 18 }}>
                  Pro sürüm şu anda özel davet ile açılmaktadır. Uygulama sahibi ile iletişime geçerek pro sürüme erişim talep edebilirsiniz.
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Contact Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }], marginBottom: 12 }}>
          <ScalePressable onPress={handleContact}>
            <LinearGradient
              colors={['#60A5FA', '#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                borderRadius: 16,
                shadowColor: '#60A5FA',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Mail size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '700', fontSize: 16 }}>
                Uygulama Sahibiyle İletişime Geç
              </Text>
            </LinearGradient>
          </ScalePressable>
        </Animated.View>

        {/* Sign Out Button */}
        <ScalePressable onPress={handleSignOut}>
          <View
            style={{
              width: '100%',
              paddingVertical: 14,
              borderRadius: 16,
              backgroundColor: '#1A1A1A',
              borderWidth: 1,
              borderColor: '#2A2A2A',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <Text style={{ color: '#9CA3AF', textAlign: 'center', fontWeight: '600', fontSize: 15 }}>
              Çıkış Yap
            </Text>
          </View>
        </ScalePressable>
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  );
}
