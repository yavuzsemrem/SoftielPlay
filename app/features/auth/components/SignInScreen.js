import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, Animated, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Music, Headphones, Radio, Sparkles } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import Toast from '../../shared/components/Toast';
import { LinearGradient } from 'expo-linear-gradient';

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

export default function SignInScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  
  const { signInWithGoogle, signInWithApple } = useAuth();

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
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
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await signInWithGoogle();
      if (signInError) {
        setError(signInError.message || 'Google ile giriş yapılamadı');
        setShowToast(true);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await signInWithApple();
      if (signInError) {
        setError(signInError.message || 'Apple ile giriş yapılamadı');
        setShowToast(true);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = () => {
    navigation?.navigate?.('EmailPassword');
  };

  return (
    <LinearGradient
      colors={['#000000', '#0A0A0F', '#0F172A', '#1E293B', '#1E293B', '#0F172A', '#000000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* Abstract Background Elements */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <LinearGradient
          colors={['#3B82F615', '#60A5FA10', '#2563EB08', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
        
        {/* Decorative Icons */}
        <View style={{ position: 'absolute', top: 80, right: 30, opacity: 0.15 }}>
          <Music size={80} color="#60A5FA" />
        </View>
        <View style={{ position: 'absolute', top: 200, left: 20, opacity: 0.12 }}>
          <Headphones size={60} color="#3B82F6" />
        </View>
        <View style={{ position: 'absolute', bottom: 150, right: 50, opacity: 0.1 }}>
          <Radio size={70} color="#60A5FA" />
        </View>
        <View style={{ position: 'absolute', bottom: 300, left: 40, opacity: 0.08 }}>
          <Sparkles size={50} color="#3B82F6" />
        </View>
        
        {/* Abstract Circles */}
        <View style={{ position: 'absolute', top: 120, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#3B82F608', opacity: 0.3 }} />
        <View style={{ position: 'absolute', bottom: 200, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: '#2563EB08', opacity: 0.25 }} />
        <View style={{ position: 'absolute', top: 400, left: 100, width: 150, height: 150, borderRadius: 75, backgroundColor: '#60A5FA08', opacity: 0.2 }} />
      </View>
      <SafeAreaView className="flex-1" edges={[]} style={{ backgroundColor: 'transparent' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          style={{ backgroundColor: 'transparent' }}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: 24,
              paddingVertical: 20,
              minHeight: '100%',
            }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Brand with Animation */}
          <Animated.View 
            style={{ 
              alignItems: 'center',
              marginBottom: 40,
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            }}
          >
            <Animated.View
              style={{
                shadowColor: '#60A5FA',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 16,
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
            <Text 
              style={{ 
                fontSize: 28,
                fontWeight: '700',
                color: '#FFFFFF',
                marginTop: 20,
                marginBottom: 8,
                textShadowColor: 'rgba(96, 165, 250, 0.3)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
              }}
            >
              SoftielPlay
            </Text>
            <Text style={{ fontSize: 15, color: '#9CA3AF', fontWeight: '500' }}>
              Premium müzik deneyimi
            </Text>
          </Animated.View>

          {/* Form with Fade In */}
          <Animated.View 
            className="space-y-6"
            style={{ opacity: formOpacity }}
          >
            {/* Google Sign In Button */}
            <ScalePressable
              onPress={handleGoogleSignIn}
              disabled={loading}
              style={{ marginBottom: 12 }}
            >
              <View
                style={{
                  width: '100%',
                  paddingVertical: 16,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: '#E5E7EB',
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                  opacity: loading ? 0.7 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesome5 name="google" size={20} color="#4285F4" />
                <Text style={{ color: '#1F2937', fontWeight: '600', fontSize: 16, marginLeft: 12 }}>
                  Google ile Giriş Yap
                </Text>
              </View>
            </ScalePressable>

            {/* Apple Sign In Button */}
            {Platform.OS === 'ios' && (
              <ScalePressable
                onPress={handleAppleSignIn}
                disabled={loading}
                style={{ marginBottom: 12 }}
              >
                <View
                  style={{
                    width: '100%',
                    paddingVertical: 16,
                    borderRadius: 16,
                    backgroundColor: '#000000',
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                    opacity: loading ? 0.7 : 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesome5 name="apple" size={20} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16, marginLeft: 12 }}>
                    Apple ile Giriş Yap
                  </Text>
                </View>
              </ScalePressable>
            )}

            {/* Email Sign In Button */}
            <ScalePressable
              onPress={handleEmailSignIn}
              disabled={loading}
              style={{ marginBottom: 12 }}
            >
              <LinearGradient
                colors={['#1E1E2E', '#2A2A3E', '#252538']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: '100%',
                  paddingVertical: 16,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: '#3B82F6',
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Mail size={20} color="#60A5FA" />
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16, marginLeft: 12 }}>
                  Email ile Giriş Yap
                </Text>
              </LinearGradient>
            </ScalePressable>

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#374151' }} />
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginHorizontal: 16 }}>veya</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#374151' }} />
            </View>

            {/* Sign Up Link */}
            <ScalePressable
              onPress={() => navigation?.navigate?.('SignUp')}
              disabled={loading}
            >
              <Text style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                Hesabınız yok mu?{' '}
                <Text style={{ fontWeight: '700', color: '#60A5FA' }}>Kayıt Ol</Text>
              </Text>
            </ScalePressable>
          </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Toast */}
        <Toast
          message={error}
          type="error"
          visible={showToast}
          onHide={() => setShowToast(false)}
        />
        </SafeAreaView>
    </LinearGradient>
  );
}

