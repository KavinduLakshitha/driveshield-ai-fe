import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, Image, Animated, Easing
} from "react-native";
import { getPrediction } from "../../services/api";
import * as Speech from "expo-speech"; // Import Text-to-Speech

export default function HomeScreen() {
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
    let interval;

    if (autoScan) {
      fetchPrediction(); // Initial scan
      interval = setInterval(fetchPrediction, 30000); // Scan every 30 seconds
    }

    return () => clearInterval(interval);
  }, [autoScan]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
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
      setNetworkStatus(prev => ({
        message: "NETWORK ERROR",
        attempts: [...prev.attempts, error.message]
      }));
      pulseAnim.stopAnimation();
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoScan = () => {
    setAutoScan(!autoScan);
  };


  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={[styles.headerContainer, { paddingTop: 40 }]}>
        <View style={styles.headerRow}>
          <Image
            source={require('../../assets/images/Alarm.png')}
            style={styles.badgeIcon}
          />
          <Text style={styles.title}>DRIVESHIELD AI</Text>
        </View>
      </View>

      {/* Status Indicator */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>SYSTEM STATUS</Text>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusLight,
            risk.includes("High") ? styles.statusRed :
            risk ? styles.statusGreen : styles.statusYellow
          ]}/>
          <Text style={styles.statusText}>
            {networkStatus.message}
          </Text>
        </View>
      </View>

      {/* Main Risk Display */}
      <View style={styles.riskDisplayOuter}>
        <Animated.View style={[
          styles.riskDisplay,
          { transform: [{ scale: pulseAnim }] },
          risk.includes("High") ? styles.highRiskContainer : styles.lowRiskContainer
        ]}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <View style={styles.riskContent}>

              <View style={styles.riskTextContainer}>
                <Text style={risk.includes("High") ? styles.highRiskText : styles.lowRiskText}>
                  {risk ? risk.split(" ")[0] : "---"}
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
      <View style={styles.controlPanel}>
        <TouchableOpacity
          style={[styles.scanButton, loading && styles.scanButtonDisabled]}
          onPress={toggleAutoScan}
        >
          <Text style={styles.scanButtonText}>
            {autoScan ? "AUTO SCANNING" : "TAP TO ENABLE AUTO SCAN"}
          </Text>
        </TouchableOpacity>

        <View style={[
          styles.emergencyInfo,
          risk.includes("High") && styles.highRiskAlert
        ]}>
          <Text style={styles.infoText}>
            {risk.includes("High")
              ? "⚠️ HIGH RISK DETECTED: Proceed with extreme caution"
              : "Continuous route monitoring active"}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>EMERGENCY RESPONSE SYSTEM v2.4</Text>
        <View style={styles.gpsIndicator}>
          <View style={styles.gpsDot} />
          <Text style={styles.footerText}>GPS SYNCHRONIZED</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#0a0f24',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: 'space-between'
  },

  // Header Section
  headerContainer: {
    alignItems: 'center',
    marginBottom: 15
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeIcon: {
    width: 36,
    height: 40,
    marginRight: 1
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    textTransform: 'uppercase'
  },
  autoScanText: {
    color: '#34c759',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
    letterSpacing: 0.5
  },

  // Status Panel
  statusContainer: {
    backgroundColor: '#1a2342',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'flex-start'
  },
  statusLabel: {
    color: '#6d7a9d',
    fontSize: 12,
    marginBottom: 5,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusLight: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
    shadowRadius: 4,
    shadowOpacity: 0.8
  },
  statusRed: {
    backgroundColor: '#ff3a30',
    shadowColor: '#ff3a30'
  },
  statusYellow: {
    backgroundColor: '#ffcc00',
    shadowColor: '#ffcc00'
  },
  statusGreen: {
    backgroundColor: '#34c759',
    shadowColor: '#34c759'
  },
  statusText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },

  // Risk Display
  riskDisplayOuter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10
  },
  riskDisplay: {
    width: '90%',
    aspectRatio: 1,
    maxWidth: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15
  },
  highRiskContainer: {
    backgroundColor: '#4a0e0e',
    borderWidth: 4,
    borderColor: '#ff3a30'
  },
  lowRiskContainer: {
    backgroundColor: '#0e2a1d',
    borderWidth: 4,
    borderColor: '#34c759'
  },
  riskContent: {
    alignItems: 'center',
    width: '100%'
  },
  riskLevelText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    marginBottom: 5,
    fontWeight: '700'
  },
  riskTextContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  highRiskText: {
    fontSize: 42,
    color: '#ff3a30',
    fontWeight: '900',
    textShadowColor: 'rgba(255,58,48,0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    lineHeight: 42,
    textAlign: 'center'
  },
  lowRiskText: {
    fontSize: 42,
    color: '#34c759',
    fontWeight: '900',
    textShadowColor: 'rgba(52,199,89,0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    lineHeight: 42,
    textAlign: 'center'
  },
  highRiskSubText: {
    fontSize: 20,
    color: '#ff3a30',
    fontWeight: '800',
    marginTop: 5,
    textAlign: 'center'
  },
  lowRiskSubText: {
    fontSize: 20,
    color: '#34c759',
    fontWeight: '800',
    marginTop: 5,
    textAlign: 'center'
  },

  // Control Panel
  controlPanel: {
    marginTop: 15
  },
  scanButton: {
    backgroundColor: '#1e3a8a',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8
  },
  scanButtonDisabled: {
    backgroundColor: '#4b5563'
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  emergencyInfo: {
    backgroundColor: 'rgba(30,58,138,0.25)',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e3a8a'
  },
  highRiskAlert: {
    backgroundColor: 'rgba(255,58,48,0.15)',
    borderColor: '#ff3a30'
  },
  infoText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20
  },

  // Footer
  footer: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e2a4a',
    alignItems: 'center'
  },
  gpsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34c759',
    marginRight: 6
  },
  footerText: {
    color: '#6d7a9d',
    fontSize: 11,
    fontWeight: '500'
  }
});