import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Animated, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Music, Headphones, Radio, Sparkles } from 'lucide-react-native';
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

export default function EmailPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  
  const insets = useSafeAreaInsets();
  const formOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  
  const { signIn } = useAuth();

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
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Lütfen email ve şifre giriniz');
      setShowToast(true);
      return;
    }

    setError(null);
    setLoading(true);
    
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

    try {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        setError(signInError.message || 'Giriş yapılamadı');
        setShowToast(true);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const getInputBorderColor = (inputName) => {
    if (error && !inputName) return '#DC2626';
    if (focusedInput === inputName) return '#60A5FA';
    return '#222222';
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
          {/* Back Button with Safe Area */}
          <ScalePressable
            onPress={() => navigation?.goBack?.()}
            style={{
              position: 'absolute',
              top: insets.top + 20,
              left: 24,
              zIndex: 10,
              padding: 8,
            }}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </ScalePressable>

          {/* Logo */}
          <Animated.View 
            style={{ 
              alignItems: 'center',
              marginBottom: 32,
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
                  width: 80,
                  height: 80,
                  resizeMode: 'contain',
                }}
              />
            </Animated.View>
          </Animated.View>

          {/* Form */}
          <Animated.View 
            style={{ opacity: formOpacity }}
          >
            <Text 
              style={{ 
                fontSize: 28,
                fontWeight: '700',
                color: '#FFFFFF',
                marginBottom: 8,
                textAlign: 'center',
                textShadowColor: 'rgba(96, 165, 250, 0.3)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
              }}
            >
              Email ile Giriş
            </Text>
            <Text style={{ fontSize: 15, color: '#9CA3AF', fontWeight: '500', textAlign: 'center', marginBottom: 32 }}>
              Email ve şifrenizi girin
            </Text>

            {/* Email Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#D1D5DB', marginBottom: 8 }}>
                Email
              </Text>
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
                  <Mail size={20} color="#71717A" />
                </View>
                <LinearGradient
                    colors={focusedInput === 'email' ? ['#1E1E2E', '#2A2A3E', '#252538'] : ['#1A1A2A', '#1E1E2E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 16,
                      borderWidth: focusedInput === 'email' ? 2 : 1.5,
                      borderColor: getInputBorderColor('email'),
                      shadowColor: focusedInput === 'email' ? '#60A5FA' : 'transparent',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: focusedInput === 'email' ? 0.3 : 0,
                      shadowRadius: focusedInput === 'email' ? 12 : 0,
                      elevation: focusedInput === 'email' ? 8 : 2,
                    }}
                  >
                  <TextInput
                    style={{ 
                      width: '100%',
                      paddingLeft: 48,
                      paddingRight: 16,
                      paddingVertical: 14,
                      borderRadius: 16,
                      fontSize: 16,
                      backgroundColor: 'transparent',
                      color: '#FFFFFF',
                    }}
                    placeholder="ornek@email.com"
                    placeholderTextColor="#52525B"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError(null);
                    }}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </LinearGradient>
              </View>
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#D1D5DB', marginBottom: 8 }}>
                Şifre
              </Text>
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
                  <Lock size={20} color="#71717A" />
                </View>
                <LinearGradient
                    colors={focusedInput === 'password' ? ['#1E1E2E', '#2A2A3E', '#252538'] : ['#1A1A2A', '#1E1E2E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 16,
                      borderWidth: focusedInput === 'password' ? 2 : 1.5,
                      borderColor: getInputBorderColor('password'),
                      shadowColor: focusedInput === 'password' ? '#60A5FA' : 'transparent',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: focusedInput === 'password' ? 0.3 : 0,
                      shadowRadius: focusedInput === 'password' ? 12 : 0,
                      elevation: focusedInput === 'password' ? 8 : 2,
                    }}
                  >
                  <TextInput
                    style={{ 
                      width: '100%',
                      paddingLeft: 48,
                      paddingRight: 48,
                      paddingVertical: 14,
                      borderRadius: 16,
                      fontSize: 16,
                      backgroundColor: 'transparent',
                      color: '#FFFFFF',
                    }}
                    placeholder="••••••••"
                    placeholderTextColor="#52525B"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setError(null);
                    }}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    editable={!loading}
                  />
                </LinearGradient>
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
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#71717A" />
                  ) : (
                    <Eye size={20} color="#71717A" />
                  )}
                </ScalePressable>
              </View>
            </View>

            {/* Sign In Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }], marginBottom: 20 }}>
              <ScalePressable
                onPress={handleSignIn}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#60A5FA', '#3B82F6', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: '100%',
                    paddingVertical: 16,
                    borderRadius: 16,
                    shadowColor: '#60A5FA',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 8,
                    opacity: loading ? 0.8 : 1,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '700', fontSize: 16 }}>
                      Giriş Yap
                    </Text>
                  )}
                </LinearGradient>
              </ScalePressable>
            </Animated.View>
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
