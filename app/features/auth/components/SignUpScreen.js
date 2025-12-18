import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, CheckCircle, Music, Headphones, Radio, Sparkles } from 'lucide-react-native';
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

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState('error');
  const [focusedInput, setFocusedInput] = useState(null);
  
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  const { signUp } = useAuth();

  useEffect(() => {
    // Entrance animations with staggered timing
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

  const validatePassword = (pwd) => {
    if (pwd.length < 6) return { valid: false, message: 'En az 6 karakter' };
    return { valid: true };
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Lütfen tüm alanları doldurunuz');
      setSuccess(null);
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setSuccess(null);
      setToastType('error');
      setShowToast(true);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      setSuccess(null);
      setToastType('error');
      setShowToast(true);
      return;
    }

    setError(null);
    setLoading(true);
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
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
      const { error: signUpError } = await signUp(email.trim(), password);
      if (signUpError) {
        setError(signUpError.message || 'Kayıt oluşturulamadı');
        setSuccess(null);
        setToastType('error');
        setShowToast(true);
      } else {
        setError(null);
        setSuccess('Hesabınız oluşturuldu! Giriş yapabilirsiniz.');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => {
          navigation?.goBack?.();
        }, 2000);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
      setSuccess(null);
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const getInputBorderColor = (inputName) => {
    if (error && inputName === 'password' && password.length > 0 && password.length < 6) return '#DC2626';
    if (error && inputName === 'confirmPassword' && password !== confirmPassword && confirmPassword.length > 0) return '#DC2626';
    if (focusedInput === inputName) return '#60A5FA';
    return '#222222';
  };

  const isPasswordValid = password.length >= 6;
  const isPasswordMatch = password === confirmPassword && confirmPassword.length > 0;

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
              Hesap oluşturun ve başlayın
            </Text>
          </Animated.View>

          {/* Form with Fade In */}
          <Animated.View 
            className="space-y-6"
            style={{ opacity: formOpacity }}
          >
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
            <View style={{ marginBottom: 20 }}>
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
                    autoComplete="password-new"
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
              {password.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  {isPasswordValid ? (
                    <>
                      <CheckCircle size={14} color="#10B981" />
                      <Text style={{ color: '#10B981', fontSize: 12, marginLeft: 6, fontWeight: '500' }}>
                        Şifre geçerli
                      </Text>
                    </>
                  ) : (
                    <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '500' }}>
                      En az 6 karakter olmalı
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#D1D5DB', marginBottom: 8 }}>
                Şifre Tekrar
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
                    colors={focusedInput === 'confirmPassword' ? ['#1E1E2E', '#2A2A3E', '#252538'] : ['#1A1A2A', '#1E1E2E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 16,
                      borderWidth: focusedInput === 'confirmPassword' ? 2 : 1.5,
                      borderColor: getInputBorderColor('confirmPassword'),
                      shadowColor: focusedInput === 'confirmPassword' ? '#60A5FA' : 'transparent',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: focusedInput === 'confirmPassword' ? 0.3 : 0,
                      shadowRadius: focusedInput === 'confirmPassword' ? 12 : 0,
                      elevation: focusedInput === 'confirmPassword' ? 8 : 2,
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
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setError(null);
                    }}
                    onFocus={() => setFocusedInput('confirmPassword')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
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
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#71717A" />
                  ) : (
                    <Eye size={20} color="#71717A" />
                  )}
                </ScalePressable>
              </View>
              {confirmPassword.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  {isPasswordMatch ? (
                    <>
                      <CheckCircle size={14} color="#10B981" />
                      <Text style={{ color: '#10B981', fontSize: 12, marginLeft: 6, fontWeight: '500' }}>
                        Şifreler eşleşiyor
                      </Text>
                    </>
                  ) : (
                    <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '500' }}>
                      Şifreler eşleşmiyor
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Sign Up Button with Gradient Effect */}
            <Animated.View style={{ transform: [{ scale: buttonScale }], marginBottom: 20 }}>
              <ScalePressable
                onPress={handleSignUp}
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
                      Kayıt Ol
                    </Text>
                  )}
                </LinearGradient>
              </ScalePressable>
            </Animated.View>

            {/* Sign In Link */}
            <ScalePressable
              onPress={() => navigation?.goBack?.()}
              disabled={loading}
            >
              <Text style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                Zaten hesabınız var mı?{' '}
                <Text style={{ fontWeight: '700', color: '#60A5FA' }}>Giriş Yap</Text>
              </Text>
            </ScalePressable>
          </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Toast */}
        <Toast
          message={error || success}
          type={toastType}
          visible={showToast}
          onHide={() => setShowToast(false)}
        />
        </SafeAreaView>
    </LinearGradient>
  );
}






