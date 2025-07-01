import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // Start pulsing animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const animationSequence = Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2500), // Longer delay
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]);

    spinAnimation.start();
    pulseAnimation.start();

    animationSequence.start(() => {
      spinAnimation.stop();
      pulseAnimation.stop();
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Background Waves */}
      <View style={styles.wavesContainer}>
        <View style={[styles.wave, styles.wave1]} />
        <View style={[styles.wave, styles.wave2]} />
        <View style={[styles.wave, styles.wave3]} />
      </View>

      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <Animated.View 
            style={[
              styles.logoWrapper,
              {
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <Image
              source={require('../assets/images/Alarm.png')}
              style={styles.logo}
            />
            <View style={styles.logoGlow} />
          </Animated.View>
        </View>
        
        <Text style={styles.title}>DRIVESHIELD AI</Text>
        <Text style={styles.subtitle}>Smart Road Hazard Detection</Text>
        
        <View style={styles.loadingContainer}>
          <Animated.View 
            style={[
              styles.spinner,
              {
                transform: [{
                  rotate: spinAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }
            ]}
          >
            <View style={styles.spinnerRing} />
            <View style={[styles.spinnerRing, styles.spinnerRing2]} />
            <View style={[styles.spinnerRing, styles.spinnerRing3]} />
          </Animated.View>
          <Text style={styles.loadingText}>One moment please…</Text>
        </View>
      </Animated.View>

      {/* Floating Particles */}
      <View style={styles.particlesContainer}>
        <View style={[styles.particle, styles.particle1]} />
        <View style={[styles.particle, styles.particle2]} />
        <View style={[styles.particle, styles.particle3]} />
        <View style={[styles.particle, styles.particle4]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wavesContainer: {
    position: 'absolute',
    width: width * 2,
    height: height,
    top: 0,
    left: -width * 0.5,
  },
  wave: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: width,
  },
  wave1: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    top: height * 0.1,
    left: -width * 0.3,
    transform: [{ rotate: '15deg' }],
  },
  wave2: {
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
    top: height * 0.3,
    left: -width * 0.2,
    transform: [{ rotate: '-10deg' }],
  },
  wave3: {
    backgroundColor: 'rgba(236, 72, 153, 0.025)',
    top: height * 0.5,
    left: -width * 0.4,
    transform: [{ rotate: '20deg' }],
  },
  content: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  logoWrapper: {
    position: 'relative',
  },
  logo: {
    width: 96,
    height: 111,
    zIndex: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    top: -12,
    left: -12,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    letterSpacing: 0.5,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 48,
  },
  loadingContainer: {
    alignItems: 'center',
    width: width * 0.6,
  },
  spinner: {
    width: 50,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#3b82f6',
  },
  spinnerRing2: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderTopColor: '#8b5cf6',
    transform: [{ rotate: '45deg' }],
  },
  spinnerRing3: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderTopColor: '#ec4899',
    transform: [{ rotate: '90deg' }],
  },
  loadingText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  particle1: {
    width: 8,
    height: 8,
    top: '20%',
    left: '15%',
  },
  particle2: {
    width: 12,
    height: 12,
    top: '70%',
    right: '20%',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  particle3: {
    width: 6,
    height: 6,
    top: '40%',
    left: '80%',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
  },
  particle4: {
    width: 10,
    height: 10,
    top: '80%',
    left: '10%',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
});