import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/TabBarBackground';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

// Enhanced Animated Tab Button Component
function AnimatedTabButton({ 
  children, 
  isActive, 
  onPress, 
  accessibilityState,
  ...props 
}: any) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Active state animations
    if (isActive) {
      scale.value = withSpring(1.05, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(-2, { damping: 12, stiffness: 100 });
      iconScale.value = withSpring(1.1, { damping: 15, stiffness: 120 });
      glowOpacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 12, stiffness: 100 });
      iconScale.value = withSpring(1, { damping: 15, stiffness: 120 });
      glowOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [isActive]);

  const handlePressIn = () => {
    if (!isActive) {
      scale.value = withSpring(0.95, { damping: 20, stiffness: 200 });
      iconScale.value = withSpring(0.9, { damping: 20, stiffness: 200 });
    }
  };

  const handlePressOut = () => {
    if (!isActive) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      iconScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(glowOpacity.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <Animated.View style={[animatedContainerStyle, { flex: 1, alignItems: 'center' }]}>
      {/* Glow effect behind active tab */}
      <Animated.View
        style={[
          animatedGlowStyle,
          {
            position: 'absolute',
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            top: -5,
          }
        ]}
      />
      
      <HapticTab
        {...props}
        accessibilityState={accessibilityState}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingVertical: 8,
        }}
      >
        <Animated.View style={animatedIconStyle}>
          {children}
        </Animated.View>
        
        {/* Active indicator line */}
        {isActive && (
          <Animated.View
            style={{
              position: 'absolute',
              bottom: -2,
              width: 24,
              height: 3,
              borderRadius: 2,
              backgroundColor: '#3b82f6',
            }}
          />
        )}
      </HapticTab>
    </Animated.View>
  );
}

// Enhanced Tab Bar Background with subtle animations
function AnimatedTabBarBackground() {
  const backgroundOpacity = useSharedValue(0);

  React.useEffect(() => {
    backgroundOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 15, 36, 0.95)', // Matching your home screen dark blue
          borderTopWidth: 1,
          borderTopColor: 'rgba(59, 130, 246, 0.1)',
        }
      ]}
    >
      {/* Subtle gradient overlay */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
        }}
      />
      <TabBarBackground />
    </Animated.View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6', // Your primary blue color
        tabBarInactiveTintColor: '#64748b', // Muted gray
        headerShown: false,
        tabBarButton: AnimatedTabButton,
        tabBarBackground: AnimatedTabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            height: 85,
            paddingBottom: 25,
            paddingTop: 10,
            backgroundColor: 'transparent',
          },
          default: {
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            backgroundColor: 'rgba(10, 15, 36, 0.95)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(59, 130, 246, 0.1)',
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24}
              name="house.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Predict"
        options={{
          title: 'Predict',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={24}
              name="paperplane.fill" 
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}