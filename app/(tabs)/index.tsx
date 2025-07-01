import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/Alarm.png')}
            style={styles.logo}
          />
          <View style={styles.logoGlow} />
        </View>
        <Text style={styles.title}>DRIVESHIELD AI</Text>
        <Text style={styles.subtitle}>SMART ROAD HAZARD DETECTION</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/road.webp')}
            style={styles.illustration}
            resizeMode="contain"
          />
          <View style={styles.imageOverlay} />
        </View>

        <Text style={styles.description}>
          Real-time accident risk prediction using advanced AI to keep you safe on the road.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Drive Safe, Drive Smart</Text>
        <Text style={styles.versionText}>v2.4.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f24',
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 93,
    zIndex: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0a0f24',
    top: -5,
    left: -5,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    letterSpacing: 1.2,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  illustration: {
    width: width * 0.9,
    height: width * 0.6,
    borderRadius: 12,
    zIndex: 2,
  },
  imageOverlay: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    zIndex: 1,
    top: 0,
    left: 0,
  },
  description: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
});