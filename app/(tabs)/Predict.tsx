import * as Location from 'expo-location';
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
  CloudRain,
  Crosshair,
  Droplet,
  Eye,
  Info,
  MapPin,
  Moon,
  Pause,
  RotateCw,
  Sun,
  Thermometer,
  Volume2,
  VolumeX,
  Wind
} from 'react-native-feather';
import { getPrediction } from "../../services/api";

const { width, height } = Dimensions.get('window');

const getCurrentLocation = async (): Promise<{coords: {latitude: number, longitude: number}, locationName: string}> => {
  try {
    // Request permissions
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    // Get current position
    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    // Get address from coordinates
    let reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    const address = reverseGeocode[0];
    const locationName = address.city || address.subregion || address.region || "Unknown Location";

    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      },
      locationName
    };
  } catch (error) {
    throw new Error('Unable to get location');
  }
};

// Define the types for better type safety
interface WeatherData {
  "Temperature(F)"?: number;
  "Humidity(%)"?: number;
  "Visibility(mi)"?: number;
  "Wind_Speed(mph)"?: number;
  "Precipitation(in)"?: number;
}

interface PredictionData {
  risk: string;
  weather: WeatherData;
  daylight_status: string;
  location: { latitude: number; longitude: number };
  probability: number;
  safety_tips: string[];
}

export default function PredictScreen() {
  const [data, setData] = useState<PredictionData>({
    risk: "",
    weather: {},
    daylight_status: "",
    location: { latitude: 0, longitude: 0 },
    probability: 0,
    safety_tips: []
  });
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({
    message: "SYSTEM READY",
    attempts: [] as string[]
  });
  const [locationName, setLocationName] = useState<string>("");
  const [pulseAnim] = useState(new Animated.Value(1));
  const [autoScan, setAutoScan] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Continuous scanning effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (autoScan) {
      fetchPrediction(); // Initial scan
      interval = setInterval(fetchPrediction, 20 * 60 * 1000); // Scan every 20 minutes
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoScan]);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const locationData = await getCurrentLocation();
        setData(prev => ({
          ...prev,
          location: locationData.coords
        }));
        setLocationName(locationData.locationName);
      } catch (error) {
        console.error('Location error:', error);
        setLocationName('Location unavailable');
      }
    };

    getLocation();
  }, []);

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
      const response = await getPrediction();
      const responseTime = Date.now() - startTime;

      setData(response);
      setNetworkStatus(prev => ({
        message: `LIVE DATA: ${responseTime}ms`,
        attempts: [...prev.attempts]
      }));

      pulseAnim.stopAnimation();

      // 🔊 Stop any ongoing speech
      Speech.stop();

      // 🔊 Speak risk level aloud with appropriate message
      // if (response.risk === "High Accident Risk") {
      //   Speech.speak("Warning! High accident risk. Drive with extreme caution.", {
      //     language: "en-US",
      //     rate: 1.0
      //   });
      // } else if (response.risk === "Low Accident Risk") {
      //   Speech.speak("Low accident risk. Continue driving safely.", {
      //     language: "en-US",
      //     rate: 1.0
      //   });
      // }

      if (voiceEnabled) {
        if (response.risk === "High Accident Risk") {
          // Determine specific risk factors for more targeted alerts
          const weather = response.weather;
          const isRaining = (weather["Precipitation(in)"] !== undefined && weather["Precipitation(in)"] > 0.1);
          const lowVisibility = weather["Visibility(mi)"] !== undefined && weather["Visibility(mi)"] < 2;
          const highWind = weather["Wind_Speed(mph)"] !== undefined && weather["Wind_Speed(mph)"] > 25;
          const isDarkTime = response.daylight_status === "Night";

          let alertMessage = "Warning! High accident risk detected. ";
          
          // Add specific emergency guidance based on conditions
          if (isRaining && lowVisibility) {
            alertMessage += "Heavy rain and low visibility. Reduce speed, use emergency lights, and exercise extreme caution.";
          } else if (isRaining) {
            alertMessage += "Wet road conditions. Increase following distance and reduce emergency response speed by 15%.";
          } else if (lowVisibility) {
            alertMessage += "Poor visibility conditions. Use all emergency lighting and proceed with caution.";
          } else if (highWind) {
            alertMessage += "High wind conditions affecting vehicle stability. Maintain firm steering control.";
          } else if (isDarkTime) {
            alertMessage += "Nighttime high-risk conditions. Use full emergency lighting and watch for impaired drivers.";
          } else {
            alertMessage += "Multiple risk factors present. Consider alternate route if available.";
          }

          Speech.speak(alertMessage, {
            language: "en-US",
            rate: 0.85,
            pitch: 1.1
          });

        } else if (response.risk === "Low Accident Risk") {
          Speech.speak("Low accident risk. Maintain emergency protocols and drive safely.", {
            language: "en-US",
            rate: 0.9,
            pitch: 1.0
          });
        }
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
    if (data.risk.includes("High")) {
      return <AlertTriangle stroke="#ef4444" strokeWidth={2.5} width={32} height={32} />;
    } else if (data.risk) {
      return <CheckCircle stroke="#22c55e" strokeWidth={2.5} width={32} height={32} />;
    } else {
      return <RotateCw stroke="#3b82f6" strokeWidth={2.5} width={32} height={32} />;
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    // Stop any current speech when disabling
    if (voiceEnabled) {
      Speech.stop();
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
                data.risk.includes("High") ? styles.statusRed :
                data.risk ? styles.statusGreen : styles.statusYellow
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
            data.risk.includes("High") ? styles.highRiskContainer : styles.lowRiskContainer
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
                  <Text style={data.risk.includes("High") ? styles.highRiskText : styles.lowRiskText}>
                    {data.risk ? data.risk.split(" ")[0] : "Standby"}
                  </Text>
                  {data.risk && (
                    <>
                      <Text style={data.risk.includes("High") ? styles.highRiskSubText : styles.lowRiskSubText}>
                        {data.risk.split(" ").slice(1).join(" ")}
                      </Text>
                      <Text style={styles.riskProbability}>
                        Risk Score: {(data.probability * 100).toFixed(1)}%
                      </Text>
                    </>
                  )}
                </View>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Control Section */}
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

          <TouchableOpacity
            style={[
              styles.scanButton,
              voiceEnabled ? styles.voiceButtonActive : styles.voiceButtonInactive
            ]}
            onPress={toggleVoice}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={styles.scanButtonIconContainer}>
                {voiceEnabled ? (
                  <Volume2 stroke="#ffffff" strokeWidth={2} width={20} height={20} />
                ) : (
                  <VolumeX stroke="#ffffff" strokeWidth={2} width={20} height={20} />
                )}
              </View>
              <Text style={styles.scanButtonText}>
                {voiceEnabled ? "Voice Alerts Enabled" : "Voice Alerts Disabled"}
              </Text>
            </View>
            <View style={styles.buttonGradient} />
          </TouchableOpacity>

          {/* Environment Card */}
          <View style={styles.environmentCard}>
            <View style={styles.environmentHeader}>
              <Text style={styles.environmentTitle}>Current Conditions</Text>
            </View>
            <View style={styles.environmentGrid}>
              <View style={styles.weatherItem}>
                <Thermometer stroke="#3b82f6" width={16} height={16} />
                <Text style={styles.weatherText}>
                  {data.weather["Temperature(F)"]?.toFixed(1) || "--"}°F
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <Droplet stroke="#3b82f6" width={16} height={16} />
                <Text style={styles.weatherText}>
                  {data.weather["Humidity(%)"]?.toFixed(1) || "--"}%
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <Eye stroke="#3b82f6" width={16} height={16} />
                <Text style={styles.weatherText}>
                  {data.weather["Visibility(mi)"]?.toFixed(1) || "--"} mi
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <Wind stroke="#3b82f6" width={16} height={16} />
                <Text style={styles.weatherText}>
                  {data.weather["Wind_Speed(mph)"]?.toFixed(1) || "--"} mph
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <CloudRain stroke="#3b82f6" width={16} height={16} />
                <Text style={styles.weatherText}>
                  {data.weather["Precipitation(in)"]?.toFixed(2) || "--"} in
                </Text>
              </View>
              <View style={styles.weatherItem}>
                {data.daylight_status === "Day" ? (
                  <Sun stroke="#eab308" width={16} height={16} />
                ) : (
                  <Moon stroke="#3b82f6" width={16} height={16} />
                )}
                <Text style={styles.weatherText}>{data.daylight_status || "--"}</Text>
              </View>
              <View style={styles.weatherItem}>
                <MapPin stroke="#3b82f6" width={16} height={16} />
                <Text style={styles.weatherText}>
                  {locationName || "Location Unknown"}
                </Text>
              </View>
            </View>
          </View>

          {/* Alert Card */}
          <View style={[
            styles.alertCard,
            data.risk.includes("High") && styles.highRiskAlert
          ]}>
            <View style={styles.alertContent}>
              <View style={styles.alertIconContainer}>
                {data.risk.includes("High") ? (
                  <AlertCircle stroke="#ef4444" strokeWidth={2} width={20} height={20} />
                ) : (
                  <Info stroke="#3b82f6" strokeWidth={2} width={20} height={20} />
                )}
              </View>
              <Text style={styles.alertText}>
                {data.risk.includes("High")
                  ? "HIGH RISK DETECTED: Proceed with extreme caution"
                  : "Continuous route monitoring active"}
              </Text>
            </View>
          </View>
        </View>

        {/* Safety Tips Section */}
        <View style={styles.safetyTipsSection}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          {data.safety_tips.length > 0 ? (
            data.safety_tips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <View style={styles.tipIcon}>
                  <AlertCircle stroke="#ef4444" width={16} height={16} />
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noTipsText}>No specific tips available.</Text>
          )}
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
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  riskSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  riskDisplay: {
    width: width * 0.85,
    height: null,
    aspectRatio: 1,
    maxWidth: 300,
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
  voiceButtonActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  voiceButtonInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
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
    fontSize: 14,
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
  },
  riskProbability: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  environmentCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  environmentHeader: {
    marginBottom: 16,
  },
  environmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  environmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weatherItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherText: {
    fontSize: 14,
    color: '#e2e8f0',
    marginLeft: 8,
  },
  safetyTipsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  tipIcon: {
    marginRight: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  noTipsText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});