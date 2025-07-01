import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  SafeAreaView, ScrollView,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from "react-native";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Crosshair,
  Info,
  Pause,
  Radio,
  RotateCw
} from 'react-native-feather';
import { getPrediction } from "../../services/api";

const { width, height } = Dimensions.get('window');

export default function PredictScreen() {
  const [risk, setRisk] = useState("");
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({
    message: "SYSTEM READY",
    attempts: [] as string[]
  });
  const [pulseAnim] = useState(new Animated.Value(1));
  const [autoScan, setAutoScan] = useState(true);

  // Continuous scanning effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (autoScan) {
      fetchPrediction(); // Initial scan
      interval = setInterval(fetchPrediction, 30000); // Scan every 30 seconds
    }

        return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoScan]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const fetchPrediction = async () => {
    startPulse();
    setLoading(true);

    try {
      const startTime = Date.now();
      const data = await getPrediction();
      const responseTime = Date.now() - startTime;

      setRisk(data.risk);
      setNetworkStatus(prev => ({
        message: `LIVE DATA: ${responseTime}ms`,
        attempts: [...prev.attempts]
      }));

      pulseAnim.stopAnimation();

      // 🔊 Stop any ongoing speech
      Speech.stop();

      // 🔊 Speak risk level aloud with appropriate message
      if (data.risk === "High Accident Risk") {
        Speech.speak("Warning! High accident risk. Drive with extreme caution.", {
          language: "en-US",
          rate: 1.0
        });
      } else if (data.risk === "Low Accident Risk") {
        Speech.speak("Low accident risk. Continue driving safely.", {
          language: "en-US",
          rate: 1.0
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setNetworkStatus(prev => ({
        message: "NETWORK ERROR",
        attempts: [...prev.attempts, errorMessage]
      }));
      pulseAnim.stopAnimation();
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoScan = () => {
    setAutoScan(!autoScan);
  };

  const getRiskIcon = () => {
    if (risk.includes("High")) {
      return <AlertTriangle stroke="#ef4444" strokeWidth={2.5} width={32} height={32} />;
    } else if (risk) {
      return <CheckCircle stroke="#22c55e" strokeWidth={2.5} width={32} height={32} />;
    } else {
      return <RotateCw stroke="#3b82f6" strokeWidth={2.5} width={32} height={32} />;
    }
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
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.logoIconContainer}>
              <Crosshair stroke="#3b82f6" strokeWidth={2.5} width={24} height={24} />
            </View>
            <Text style={styles.title}>AI PREDICTION</Text>
          </View>
          <Text style={styles.subtitle}>Real-time Risk Analysis</Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>System Status</Text>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot,
                risk.includes("High") ? styles.statusRed :
                risk ? styles.statusGreen : styles.statusYellow
              ]} />
              <Text style={styles.statusText}>{networkStatus.message}</Text>
            </View>
          </View>
          <View style={styles.statusWave} />
        </View>

        {/* Main Risk Display */}
        <View style={styles.riskSection}>
          <Animated.View style={[
            styles.riskDisplay,
            { transform: [{ scale: pulseAnim }] },
            risk.includes("High") ? styles.highRiskContainer : styles.lowRiskContainer
          ]}>
            <View style={styles.riskGradient} />
            
            {loading ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Analyzing Route...</Text>
              </View>
            ) : (
              <View style={styles.riskContent}>
                <View style={styles.riskIcon}>
                  {getRiskIcon()}
                </View>
                
                <View style={styles.riskTextContainer}>
                  <Text style={risk.includes("High") ? styles.highRiskText : styles.lowRiskText}>
                    {risk ? risk.split(" ")[0] : "Standby"}
                  </Text>
                  {risk && (
                    <Text style={risk.includes("High") ? styles.highRiskSubText : styles.lowRiskSubText}>
                      {risk.split(" ").slice(1).join(" ")}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Control Panel */}
        <View style={styles.controlSection}>
          <TouchableOpacity
            style={[
              styles.scanButton,
              autoScan ? styles.scanButtonActive : styles.scanButtonInactive,
              loading && styles.scanButtonDisabled
            ]}
            onPress={toggleAutoScan}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={styles.scanButtonIconContainer}>
                {autoScan ? (
                  <RotateCw stroke="#ffffff" strokeWidth={2} width={20} height={20} />
                ) : (
                  <Pause stroke="#ffffff" strokeWidth={2} width={20} height={20} />
                )}
              </View>
              <Text style={styles.scanButtonText}>
                {autoScan ? "Auto Scanning Active" : "Tap to Enable Auto Scan"}
              </Text>
            </View>
            <View style={styles.buttonGradient} />
          </TouchableOpacity>

          {/* Alert Card */}
          <View style={[
            styles.alertCard,
            risk.includes("High") && styles.highRiskAlert
          ]}>
            <View style={styles.alertContent}>
              <View style={styles.alertIconContainer}>
                {risk.includes("High") ? (
                  <AlertCircle stroke="#ef4444" strokeWidth={2} width={20} height={20} />
                ) : (
                  <Info stroke="#3b82f6" strokeWidth={2} width={20} height={20} />
                )}
              </View>
              <Text style={styles.alertText}>
                {risk.includes("High")
                  ? "HIGH RISK DETECTED: Proceed with extreme caution"
                  : "Continuous route monitoring active"}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Radio stroke="#3b82f6" strokeWidth={2} width={16} height={16} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>GPS Synchronized</Text>
              <Text style={styles.infoDescription}>Real-time location tracking</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Cpu stroke="#8b5cf6" strokeWidth={2} width={16} height={16} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>AI Engine v2.4</Text>
              <Text style={styles.infoDescription}>Advanced prediction algorithms</Text>
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
    width: width * 1.6,
    height: width * 1.6,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    top: height * 0.05,
    left: -width * 0.3,
    transform: [{ rotate: '20deg' }],
  },
  wave2: {
    width: width * 1.4,
    height: width * 1.4,
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
    top: height * 0.3,
    right: -width * 0.2,
    transform: [{ rotate: '-30deg' }],
  },
  wave3: {
    width: width * 1.8,
    height: width * 1.8,
    backgroundColor: 'rgba(236, 72, 153, 0.025)',
    top: height * 0.6,
    left: -width * 0.4,
    transform: [{ rotate: '40deg' }],
  },
  wave4: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: 'rgba(34, 197, 94, 0.02)',
    top: height * 0.15,
    right: -width * 0.1,
    transform: [{ rotate: '-15deg' }],
  },
  scrollContainer: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoIcon: {
    width: 32,
    height: 37,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '400',
  },
  statusCard: {
    position: 'relative',
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    overflow: 'hidden',
  },
  statusHeader: {
    zIndex: 2,
  },
  statusLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    shadowRadius: 4,
    shadowOpacity: 0.6,
  },
  statusRed: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  statusYellow: {
    backgroundColor: '#eab308',
    shadowColor: '#eab308',
  },
  statusGreen: {
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusWave: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
    top: -75,
    right: -75,
    zIndex: 1,
  },
  riskSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  riskDisplay: {
    width: width * 0.85,
    height: width * 0.85,
    maxWidth: 300,
    maxHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  highRiskContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  lowRiskContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  riskGradient: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
    top: -100,
    right: -100,
    zIndex: 1,
  },
  loadingContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  riskContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  riskIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  riskTextContainer: {
    alignItems: 'center',
  },
  highRiskText: {
    fontSize: 36,
    color: '#ef4444',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  lowRiskText: {
    fontSize: 36,
    color: '#22c55e',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  highRiskSubText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  lowRiskSubText: {
    fontSize: 18,
    color: '#22c55e',
    fontWeight: '600',
    textAlign: 'center',
  },
  controlSection: {
    marginBottom: 24,
  },
  scanButton: {
    position: 'relative',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  scanButtonActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  scanButtonInactive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  scanButtonDisabled: {
    backgroundColor: 'rgba(75, 85, 99, 0.3)',
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  scanButtonIconContainer: {
    marginRight: 12,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGradient: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    top: -75,
    right: -75,
    zIndex: 1,
  },
  alertCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  highRiskAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconContainer: {
    marginRight: 12,
  },
  alertText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoCard: {
    width: '48%',
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoContent: {
    alignItems: 'flex-start',
  },
  infoTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDescription: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
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
    width: 8,
    height: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    top: '20%',
    right: '15%',
  },
  dot2: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    top: '70%',
    left: '10%',
  },
  dot3: {
    width: 10,
    height: 10,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    top: '50%',
    right: '8%',
  },
    logoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  }
});