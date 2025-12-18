import { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { X, CheckCircle, AlertCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function Toast({ message, type = 'error', visible, onHide, duration = 4000 }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible && message) {
      // Show animation
      Animated.parallel([
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    } else if (!visible) {
      hide();
    }
  }, [visible, message]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  if (!visible || !message) return null;

  const bgColor = type === 'error' ? '#DC2626' : '#10B981';
  const iconColor = '#FFFFFF';
  const IconComponent = type === 'error' ? AlertCircle : CheckCircle;

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }, { scale }],
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <View
        className="flex-row items-center px-5 py-4 rounded-2xl"
        style={{
          backgroundColor: bgColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        <IconComponent size={20} color={iconColor} style={{ marginRight: 12 }} />
        <Text className="flex-1 text-white font-semibold text-sm leading-5" numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}






