import VoiceAssistant from '@/components/VoiceAssistant';
import { getStatusIndicator, useAccessibility } from '@/context/AccessibilityContext';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
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
  Mic,
  Navigation,
  Shield,
  Smartphone,
  Target,
  Zap
} from 'react-native-feather';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const { getColors, getFontSizes, settings } = useAccessibility();
  
  const colors = getColors();
  const fonts = getFontSizes();

  const handleQuickPredict = () => {
    console.log('Navigate to Predict tab');
  };

  const handleVoiceAssistant = () => {
    setShowVoiceAssistant(true);
  };

  const handleBackFromVoice = () => {
    setShowVoiceAssistant(false);
  };

  // Get status indicator for colorblind support
  const statusIndicator = getStatusIndicator('success', settings.colorBlindMode);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Background Waves */}
      <View style={styles.backgroundContainer}>
        <View style={[
          styles.wave, 
          styles.wave1, 
          { backgroundColor: `${colors.primary}0D` }
        ]} />
        <View style={[
          styles.wave, 
          styles.wave2, 
          { backgroundColor: `${colors.secondary}0A` }
        ]} />
        <View style={[
          styles.wave, 
          styles.wave3, 
          { backgroundColor: settings.colorBlindMode ? `${colors.info}06` : 'rgba(236, 72, 153, 0.025)' }
        ]} />
        <View style={[
          styles.wave, 
          styles.wave4, 
          { backgroundColor: `${colors.success}05` }
        ]} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={[
              styles.logoIconContainer,
              { backgroundColor: `${colors.primary}26` }
            ]}>
              <Crosshair stroke={colors.primary} strokeWidth={2.5} width={48} height={48} />
            </View>
            <View style={[
              styles.logoGlow,
              { backgroundColor: `${colors.primary}1A` }
            ]} />
          </View>
          <Text style={[
            styles.title, 
            { 
              color: colors.text,
              fontSize: fonts.title + 4
            }
          ]}>
            DRIVESHIELD AI
          </Text>
          <Text style={[
            styles.subtitle, 
            { 
              color: colors.textSecondary,
              fontSize: fonts.medium
            }
          ]}>
            Smart Road Hazard Detection
          </Text>
        </View>

        {/* Status Card */}
        <View style={[
          styles.statusCard,
          { 
            backgroundColor: `${colors.success}14`,
            borderColor: `${colors.success}1A`,
            ...(settings.highContrast && {
              borderWidth: 2,
              backgroundColor: `${colors.success}20`
            })
          }
        ]}>
          <View style={styles.statusContent}>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: colors.success }
              ]} />
              {statusIndicator.needsPattern && (
                <Text style={[
                  styles.statusPattern, 
                  { color: colors.success, fontSize: fonts.medium }
                ]}>
                  {statusIndicator.pattern}
                </Text>
              )}
              <Text style={[
                styles.statusText, 
                { 
                  color: colors.success,
                  fontSize: fonts.large
                }
              ]}>
                AI System Active
              </Text>
            </View>
            <Text style={[
              styles.statusDescription, 
              { 
                color: colors.text,
                fontSize: fonts.medium - 1
              }
            ]}>
              Your intelligent road safety companion is ready to protect you
            </Text>
          </View>
          <View style={[
            styles.statusWave,
            { backgroundColor: `${colors.success}05` }
          ]} />
        </View>

        {/* Main Action Cards */}
        <View style={styles.actionSection}>
          {/* Predict Card */}
          <TouchableOpacity 
            style={[
              styles.mainActionCard,
              { 
                backgroundColor: `${colors.primary}14`,
                borderColor: `${colors.primary}26`,
                ...(settings.highContrast && {
                  borderWidth: 2,
                  backgroundColor: `${colors.primary}20`
                })
              }
            ]} 
            onPress={handleQuickPredict}
            activeOpacity={0.9}
          >
            <View style={[
              styles.actionGradient,
              { backgroundColor: `${colors.primary}08` }
            ]} />
            <View style={styles.actionContent}>
              <View style={[
                styles.actionIcon,
                { backgroundColor: `${colors.primary}26` }
              ]}>
                <Target stroke={colors.primary} strokeWidth={2} width={32} height={32} />
              </View>
              <Text style={[
                styles.actionTitle, 
                { 
                  color: colors.text,
                  fontSize: fonts.title
                }
              ]}>
                Start Prediction
              </Text>
              <Text style={[
                styles.actionSubtitle, 
                { 
                  color: colors.textSecondary,
                  fontSize: fonts.medium
                }
              ]}>
                Analyze road conditions and get instant safety insights
              </Text>
              <View style={[
                styles.actionButton,
                { 
                  backgroundColor: `${colors.primary}33`,
                  borderColor: `${colors.primary}4D`
                }
              ]}>
                <Text style={[
                  styles.actionButtonText, 
                  { 
                    color: colors.primary,
                    fontSize: fonts.medium
                  }
                ]}>
                  Get Started
                </Text>
                <ArrowRight stroke={colors.primary} strokeWidth={2} width={16} height={16} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Voice Assistant Card */}
          <TouchableOpacity 
            style={[
              styles.mainActionCard, 
              styles.voiceActionCard,
              { 
                backgroundColor: `${colors.secondary}14`,
                borderColor: `${colors.secondary}26`,
                ...(settings.highContrast && {
                  borderWidth: 2,
                  backgroundColor: `${colors.secondary}20`
                })
              }
            ]} 
            onPress={handleVoiceAssistant}
            activeOpacity={0.9}
          >
            <View style={[
              styles.actionGradient, 
              styles.voiceGradient,
              { backgroundColor: `${colors.secondary}08` }
            ]} />
            <View style={styles.actionContent}>
              <View style={[
                styles.actionIcon, 
                styles.voiceActionIcon,
                { backgroundColor: `${colors.secondary}26` }
              ]}>
                <Mic stroke={colors.secondary} strokeWidth={2} width={32} height={32} />
              </View>
              <Text style={[
                styles.actionTitle, 
                { 
                  color: colors.text,
                  fontSize: fonts.title
                }
              ]}>
                Voice Assistant
              </Text>
              <Text style={[
                styles.actionSubtitle, 
                { 
                  color: colors.textSecondary,
                  fontSize: fonts.medium
                }
              ]}>
                Navigate anywhere with voice commands or manual input
              </Text>
              <View style={[
                styles.actionButton, 
                styles.voiceActionButton,
                { 
                  backgroundColor: `${colors.secondary}33`,
                  borderColor: `${colors.secondary}4D`
                }
              ]}>
                <Text style={[
                  styles.actionButtonText, 
                  styles.voiceActionButtonText,
                  { 
                    color: colors.secondary,
                    fontSize: fonts.medium
                  }
                ]}>
                  Ask Direction
                </Text>
                <Navigation stroke={colors.secondary} strokeWidth={2} width={16} height={16} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={[
            styles.sectionTitle, 
            { 
              color: colors.text,
              fontSize: fonts.title - 2
            }
          ]}>
            Why Choose DriveShield?
          </Text>
          
          <View style={styles.featuresGrid}>
            <View style={[
              styles.featureCard,
              { 
                backgroundColor: colors.surface,
                borderColor: settings.highContrast ? colors.textSecondary : 'rgba(148, 163, 184, 0.1)'
              }
            ]}>
              <View style={[
                styles.featureIconContainer,
                { backgroundColor: `${colors.primary}1A` }
              ]}>
                <Cpu stroke={colors.primary} strokeWidth={2} width={24} height={24} />
              </View>
              <Text style={[
                styles.featureTitle, 
                { 
                  color: colors.text,
                  fontSize: fonts.medium
                }
              ]}>
                AI-Powered
              </Text>
              <Text style={[
                styles.featureDescription, 
                { 
                  color: colors.textSecondary,
                  fontSize: fonts.small + 1
                }
              ]}>
                Advanced machine learning algorithms
              </Text>
            </View>

            <View style={[
              styles.featureCard,
              { 
                backgroundColor: colors.surface,
                borderColor: settings.highContrast ? colors.textSecondary : 'rgba(148, 163, 184, 0.1)'
              }
            ]}>
              <View style={[
                styles.featureIconContainer,
                { backgroundColor: `${colors.warning}1A` }
              ]}>
                <Zap stroke={colors.warning} strokeWidth={2} width={24} height={24} />
              </View>
              <Text style={[
                styles.featureTitle, 
                { 
                  color: colors.text,
                  fontSize: fonts.medium
                }
              ]}>
                Real-Time
              </Text>
              <Text style={[
                styles.featureDescription, 
                { 
                  color: colors.textSecondary,
                  fontSize: fonts.small + 1
                }
              ]}>
                Instant hazard detection and alerts
              </Text>
            </View>

            <View style={[
              styles.featureCard,
              { 
                backgroundColor: colors.surface,
                borderColor: settings.highContrast ? colors.textSecondary : 'rgba(148, 163, 184, 0.1)'
              }
            ]}>
              <View style={[
                styles.featureIconContainer,
                { backgroundColor: `${colors.success}1A` }
              ]}>
                <Shield stroke={colors.success} strokeWidth={2} width={24} height={24} />
              </View>
              <Text style={[
                styles.featureTitle, 
                { 
                  color: colors.text,
                  fontSize: fonts.medium
                }
              ]}>
                Protection
              </Text>
              <Text style={[
                styles.featureDescription, 
                { 
                  color: colors.textSecondary,
                  fontSize: fonts.small + 1
                }
              ]}>
                Proactive accident prevention
              </Text>
            </View>

            <View style={[
              styles.featureCard,
              { 
                backgroundColor: colors.surface,
                borderColor: settings.highContrast ? colors.textSecondary : 'rgba(148, 163, 184, 0.1)'
              }
            ]}>
              <View style={[
                styles.featureIconContainer,
                { backgroundColor: `${colors.secondary}1A` }
              ]}>
                <Smartphone stroke={colors.secondary} strokeWidth={2} width={24} height={24} />
              </View>
              <Text style={[
                styles.featureTitle, 
                { 
                  color: colors.text,
                  fontSize: fonts.medium
                }
              ]}>
                Easy to Use
              </Text>
              <Text style={[
                styles.featureDescription, 
                { 
                  color: colors.textSecondary,
                  fontSize: fonts.small + 1
                }
              ]}>
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
        <View style={[
          styles.floatingDot, 
          styles.dot1,
          { backgroundColor: `${colors.primary}1A` }
        ]} />
        <View style={[
          styles.floatingDot, 
          styles.dot2,
          { backgroundColor: `${colors.secondary}1A` }
        ]} />
        <View style={[
          styles.floatingDot, 
          styles.dot3,
          { backgroundColor: settings.colorBlindMode ? `${colors.info}1A` : 'rgba(236, 72, 153, 0.1)' }
        ]} />
      </View>

      {/* Voice Assistant Modal */}
      <Modal
        visible={showVoiceAssistant}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleBackFromVoice}
      >
        <VoiceAssistant onBack={handleBackFromVoice} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    top: height * 0.1,
    left: -width * 0.2,
    transform: [{ rotate: '15deg' }],
  },
  wave2: {
    width: width * 1.5,
    height: width * 1.5,
    top: height * 0.4,
    right: -width * 0.3,
    transform: [{ rotate: '-25deg' }],
  },
  wave3: {
    width: width * 1.2,
    height: width * 1.2,
    top: height * 0.7,
    left: -width * 0.1,
    transform: [{ rotate: '45deg' }],
  },
  wave4: {
    width: width * 2,
    height: width * 2,
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
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -14,
    left: -14,
    zIndex: 1,
  },
  title: {
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontWeight: '400',
  },
  statusCard: {
    position: 'relative',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
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
    marginRight: 10,
  },
  statusPattern: {
    marginRight: 8,
    fontWeight: 'bold',
  },
  statusText: {
    fontWeight: '600',
  },
  statusDescription: {
    lineHeight: 22,
  },
  statusWave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -100,
    right: -100,
    zIndex: 1,
  },
  actionSection: {
    marginBottom: 40,
    gap: 20,
  },
  mainActionCard: {
    position: 'relative',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  voiceActionCard: {
    // Specific styles for voice card if needed
  },
  actionGradient: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -150,
    right: -150,
    zIndex: 1,
  },
  voiceGradient: {
    // Specific gradient styles if needed
  },
  actionContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  actionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceActionIcon: {
    // Specific voice icon styles if needed
  },
  actionTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  actionSubtitle: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
  },
  voiceActionButton: {
    // Specific voice button styles if needed
  },
  actionButtonText: {
    fontWeight: '600',
    marginRight: 8,
  },
  voiceActionButtonText: {
    // Specific voice button text styles if needed
  },
  featuresSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontWeight: '700',
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  featureDescription: {
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
    top: '25%',
    right: '10%',
  },
  dot2: {
    width: 8,
    height: 8,
    top: '65%',
    left: '8%',
  },
  dot3: {
    width: 10,
    height: 10,
    top: '45%',
    right: '15%',
  },
  logoIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});