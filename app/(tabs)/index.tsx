import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  ArrowRight,
  Cpu,
  Crosshair,
  Shield,
  Smartphone,
  Target,
  Zap
} from 'react-native-feather';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const handleQuickPredict = () => {
    // Navigate to Predict tab
    console.log('Navigate to Predict tab');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Background Waves */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.wave, styles.wave1]} />
        <View style={[styles.wave, styles.wave2]} />
        <View style={[styles.wave, styles.wave3]} />
        <View style={[styles.wave, styles.wave4]} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIconContainer}>
              <Crosshair stroke="#3b82f6" strokeWidth={2.5} width={48} height={48} />
            </View>
            <View style={styles.logoGlow} />
          </View>
          <Text style={styles.title}>DRIVESHIELD AI</Text>
          <Text style={styles.subtitle}>Smart Road Hazard Detection</Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusContent}>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>AI System Active</Text>
            </View>
            <Text style={styles.statusDescription}>
              Your intelligent road safety companion is ready to protect you
            </Text>
          </View>
          <View style={styles.statusWave} />
        </View>

        {/* Main Action Card */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.mainActionCard} 
            onPress={handleQuickPredict}
            activeOpacity={0.9}
          >
            <View style={styles.actionGradient} />
            <View style={styles.actionContent}>
              <View style={styles.actionIcon}>
                <Target stroke="#3b82f6" strokeWidth={2} width={32} height={32} />
              </View>
              <Text style={styles.actionTitle}>Start Prediction</Text>
              <Text style={styles.actionSubtitle}>
                Analyze road conditions and get instant safety insights
              </Text>
              <View style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Get Started</Text>
                <ArrowRight stroke="#3b82f6" strokeWidth={2} width={16} height={16} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose DriveShield?</Text>
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Cpu stroke="#3b82f6" strokeWidth={2} width={24} height={24} />
              </View>
              <Text style={styles.featureTitle}>AI-Powered</Text>
              <Text style={styles.featureDescription}>
                Advanced machine learning algorithms
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Zap stroke="#eab308" strokeWidth={2} width={24} height={24} />
              </View>
              <Text style={styles.featureTitle}>Real-Time</Text>
              <Text style={styles.featureDescription}>
                Instant hazard detection and alerts
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Shield stroke="#22c55e" strokeWidth={2} width={24} height={24} />
              </View>
              <Text style={styles.featureTitle}>Protection</Text>
              <Text style={styles.featureDescription}>
                Proactive accident prevention
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Smartphone stroke="#8b5cf6" strokeWidth={2} width={24} height={24} />
              </View>
              <Text style={styles.featureTitle}>Easy to Use</Text>
              <Text style={styles.featureDescription}>
                Simple and intuitive interface
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Elements */}
      <View style={styles.floatingElements}>
        <View style={[styles.floatingDot, styles.dot1]} />
        <View style={[styles.floatingDot, styles.dot2]} />
        <View style={[styles.floatingDot, styles.dot3]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f24',
  },
  backgroundContainer: {
    position: 'absolute',
    width: width * 2,
    height: height * 1.5,
    top: -height * 0.2,
    left: -width * 0.5,
  },
  wave: {
    position: 'absolute',
    borderRadius: width,
  },
  wave1: {
    width: width * 1.8,
    height: width * 1.8,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    top: height * 0.1,
    left: -width * 0.2,
    transform: [{ rotate: '15deg' }],
  },
  wave2: {
    width: width * 1.5,
    height: width * 1.5,
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
    top: height * 0.4,
    right: -width * 0.3,
    transform: [{ rotate: '-25deg' }],
  },
  wave3: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: 'rgba(236, 72, 153, 0.025)',
    top: height * 0.7,
    left: -width * 0.1,
    transform: [{ rotate: '45deg' }],
  },
  wave4: {
    width: width * 2,
    height: width * 2,
    backgroundColor: 'rgba(34, 197, 94, 0.02)',
    top: height * 0.2,
    left: width * 0.2,
    transform: [{ rotate: '-35deg' }],
  },
  scrollContainer: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logo: {
    width: 72,
    height: 83,
    zIndex: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    top: -14,
    left: -14,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '400',
  },
  statusCard: {
    position: 'relative',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.1)',
    overflow: 'hidden',
  },
  statusContent: {
    zIndex: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    marginRight: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22c55e',
  },
  statusDescription: {
    fontSize: 15,
    color: '#e2e8f0',
    lineHeight: 22,
  },
  statusWave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(34, 197, 94, 0.02)',
    top: -100,
    right: -100,
    zIndex: 1,
  },
  actionSection: {
    marginBottom: 40,
  },
  mainActionCard: {
    position: 'relative',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
    overflow: 'hidden',
  },
  actionGradient: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
    top: -150,
    right: -150,
    zIndex: 1,
  },
  actionContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  actionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  actionSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginRight: 8,
  },
  featuresSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  floatingDot: {
    position: 'absolute',
    borderRadius: 50,
  },
  dot1: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    top: '25%',
    right: '10%',
  },
  dot2: {
    width: 8,
    height: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    top: '65%',
    left: '8%',
  },
  dot3: {
    width: 10,
    height: 10,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    top: '45%',
    right: '15%',
  },
  logoIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});