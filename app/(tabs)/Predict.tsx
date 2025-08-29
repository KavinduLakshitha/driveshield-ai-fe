import { getStatusIndicator, useAccessibility } from '@/context/AccessibilityContext';
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

  // Get accessibility context
  const { getColors, getFontSizes, settings } = useAccessibility();
  const colors = getColors();
  const fonts = getFontSizes();

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

      // Stop any ongoing speech
      Speech.stop();

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
    const isHighRisk = data.risk.includes("High");
    const iconColor = isHighRisk ? colors.error : (data.risk ? colors.success : colors.primary);
    
    if (isHighRisk) {
      return <AlertTriangle stroke={iconColor} strokeWidth={2.5} width={32} height={32} />;
    } else if (data.risk) {
      return <CheckCircle stroke={iconColor} strokeWidth={2.5} width={32} height={32} />;
    } else {
      return <RotateCw stroke={iconColor} strokeWidth={2.5} width={32} height={32} />;
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    // Stop any current speech when disabling
    if (voiceEnabled) {
      Speech.stop();
    }
  };

  // Get status indicators for colorblind support
  const systemStatusIndicator = getStatusIndicator(
    data.risk.includes("High") ? 'danger' : (data.risk ? 'success' : 'warning'), 
    settings.colorBlindMode
  );

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: fonts.title,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: fonts.medium,
      color: colors.textSecondary,
      fontWeight: '400',
    },
    statusCard: {
      position: 'relative',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: settings.highContrast ? 2 : 1,
      borderColor: settings.highContrast ? colors.textSecondary : 'rgba(148, 163, 184, 0.1)',
      overflow: 'hidden',
    },
    statusText: {
      color: colors.text,
      fontSize: fonts.medium,
      fontWeight: '600',
    },
    statusLabel: {
      fontSize: fonts.small,
      color: colors.textSecondary,
      fontWeight: '500',
      marginBottom: 8,
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
      backgroundColor: `${colors.error}14`,
      borderWidth: settings.highContrast ? 3 : 2,
      borderColor: settings.highContrast ? colors.error : `${colors.error}4D`,
    },
    lowRiskContainer: {
      backgroundColor: `${colors.success}14`,
      borderWidth: settings.highContrast ? 3 : 2,
      borderColor: settings.highContrast ? colors.success : `${colors.success}4D`,
    },
    loadingText: {
      color: colors.text,
      fontSize: fonts.medium,
      fontWeight: '500',
      marginTop: 16,
    },
    highRiskText: {
      fontSize: fonts.title + 12,
      color: colors.error,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 8,
    },
    lowRiskText: {
      fontSize: fonts.title + 12,
      color: colors.success,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 8,
    },
    highRiskSubText: {
      fontSize: fonts.large,
      color: colors.error,
      fontWeight: '600',
      textAlign: 'center',
    },
    lowRiskSubText: {
      fontSize: fonts.large,
      color: colors.success,
      fontWeight: '600',
      textAlign: 'center',
    },
    riskProbability: {
      fontSize: fonts.medium,
      color: colors.text,
      fontWeight: '500',
      textAlign: 'center',
      marginTop: 8,
    },
    scanButton: {
      position: 'relative',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: settings.highContrast ? 2 : 1,
      overflow: 'hidden',
    },
    scanButtonActive: {
      backgroundColor: `${colors.success}1A`,
      borderColor: settings.highContrast ? colors.success : `${colors.success}4D`,
    },
    scanButtonInactive: {
      backgroundColor: `${colors.primary}1A`,
      borderColor: settings.highContrast ? colors.primary : `${colors.primary}4D`,
    },
    voiceButtonActive: {
      backgroundColor: `${colors.success}1A`,
      borderColor: settings.highContrast ? colors.success : `${colors.success}4D`,
    },
    voiceButtonInactive: {
      backgroundColor: `${colors.error}1A`,
      borderColor: settings.highContrast ? colors.error : `${colors.error}4D`,
    },
    scanButtonText: {
      color: colors.text,
      fontSize: fonts.medium,
      fontWeight: '600',
    },
    environmentCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: settings.highContrast ? 2 : 1,
      borderColor: settings.highContrast ? colors.textSecondary : 'rgba(148, 163, 184, 0.1)',
    },
    environmentTitle: {
      fontSize: fonts.large,
      fontWeight: '600',
      color: colors.text,
    },
    weatherText: {
      fontSize: fonts.medium,
      color: colors.text,
      marginLeft: 8,
    },
    alertCard: {
      backgroundColor: `${colors.primary}14`,
      borderRadius: 12,
      padding: 16,
      borderWidth: settings.highContrast ? 2 : 1,
      borderColor: settings.highContrast ? colors.primary : `${colors.primary}33`,
    },
    highRiskAlert: {
      backgroundColor: `${colors.error}14`,
      borderColor: settings.highContrast ? colors.error : `${colors.error}4D`,
    },
    alertText: {
      color: colors.text,
      fontSize: fonts.medium,
      fontWeight: '500',
      flex: 1,
      lineHeight: 20,
    },
    sectionTitle: {
      fontSize: fonts.title - 2,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    tipCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.error}14`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: settings.highContrast ? 2 : 1,
      borderColor: settings.highContrast ? colors.error : `${colors.error}33`,
    },
    tipText: {
      fontSize: fonts.medium,
      color: colors.text,
      flex: 1,
    },
    noTipsText: {
      fontSize: fonts.medium,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
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
          { backgroundColor: `${colors.secondary}08` }
        ]} />
        <View style={[
          styles.wave, 
          styles.wave3,
          { backgroundColor: settings.colorBlindMode ? `${colors.info}06` : 'rgba(236, 72, 153, 0.025)' }
        ]} />
        <View style={[
          styles.wave, 
          styles.wave4,
          { backgroundColor: `${colors.success}04` }
        ]} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={[
              styles.logoIconContainer,
              { backgroundColor: `${colors.primary}26` }
            ]}>
              <Crosshair stroke={colors.primary} strokeWidth={2.5} width={24} height={24} />
            </View>
            <Text style={dynamicStyles.title}>AI PREDICTION</Text>
          </View>
          <Text style={dynamicStyles.subtitle}>Real-time Risk Analysis</Text>
        </View>

        {/* Status Card */}
        <View style={dynamicStyles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={dynamicStyles.statusLabel}>System Status</Text>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot,
                data.risk.includes("High") ? { backgroundColor: colors.error, shadowColor: colors.error } :
                data.risk ? { backgroundColor: colors.success, shadowColor: colors.success } : 
                { backgroundColor: colors.warning, shadowColor: colors.warning }
              ]} />
              {systemStatusIndicator.needsPattern && (
                <Text style={[
                  styles.statusPattern, 
                  { 
                    color: data.risk.includes("High") ? colors.error : (data.risk ? colors.success : colors.warning),
                    fontSize: fonts.medium
                  }
                ]}>
                  {systemStatusIndicator.pattern}
                </Text>
              )}
              <Text style={dynamicStyles.statusText}>{networkStatus.message}</Text>
            </View>
          </View>
          <View style={[
            styles.statusWave,
            { backgroundColor: `${colors.primary}06` }
          ]} />
        </View>

        {/* Main Risk Display */}
        <View style={styles.riskSection}>
          <Animated.View style={[
            dynamicStyles.riskDisplay,
            { transform: [{ scale: pulseAnim }] },
            data.risk.includes("High") ? dynamicStyles.highRiskContainer : dynamicStyles.lowRiskContainer
          ]}>
            <View style={[
              styles.riskGradient,
              { backgroundColor: `${colors.primary}06` }
            ]} />
            
            {loading ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={dynamicStyles.loadingText}>Analyzing Route...</Text>
              </View>
            ) : (
              <View style={styles.riskContent}>
                <View style={[
                  styles.riskIcon,
                  { backgroundColor: `${colors.text}1A` }
                ]}>
                  {getRiskIcon()}
                </View>
                
                <View style={styles.riskTextContainer}>
                  <Text style={data.risk.includes("High") ? dynamicStyles.highRiskText : dynamicStyles.lowRiskText}>
                    {data.risk ? data.risk.split(" ")[0] : "Standby"}
                  </Text>
                  {data.risk && (
                    <>
                      <Text style={data.risk.includes("High") ? dynamicStyles.highRiskSubText : dynamicStyles.lowRiskSubText}>
                        {data.risk.split(" ").slice(1).join(" ")}
                      </Text>
                      <Text style={dynamicStyles.riskProbability}>
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
              dynamicStyles.scanButton,
              autoScan ? dynamicStyles.scanButtonActive : dynamicStyles.scanButtonInactive,
              loading && styles.scanButtonDisabled
            ]}
            onPress={toggleAutoScan}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={styles.scanButtonIconContainer}>
                {autoScan ? (
                  <RotateCw stroke={colors.text} strokeWidth={2} width={20} height={20} />
                ) : (
                  <Pause stroke={colors.text} strokeWidth={2} width={20} height={20} />
                )}
              </View>
              <Text style={dynamicStyles.scanButtonText}>
                {autoScan ? "Auto Scanning Active" : "Tap to Enable Auto Scan"}
              </Text>
            </View>
            <View style={[
              styles.buttonGradient,
              { backgroundColor: `${colors.text}04` }
            ]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              dynamicStyles.scanButton,
              voiceEnabled ? dynamicStyles.voiceButtonActive : dynamicStyles.voiceButtonInactive
            ]}
            onPress={toggleVoice}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={styles.scanButtonIconContainer}>
                {voiceEnabled ? (
                  <Volume2 stroke={colors.text} strokeWidth={2} width={20} height={20} />
                ) : (
                  <VolumeX stroke={colors.text} strokeWidth={2} width={20} height={20} />
                )}
              </View>
              <Text style={dynamicStyles.scanButtonText}>
                {voiceEnabled ? "Voice Alerts Enabled" : "Voice Alerts Disabled"}
              </Text>
            </View>
            <View style={[
              styles.buttonGradient,
              { backgroundColor: `${colors.text}04` }
            ]} />
          </TouchableOpacity>

          {/* Environment Card */}
          <View style={dynamicStyles.environmentCard}>
            <View style={styles.environmentHeader}>
              <Text style={dynamicStyles.environmentTitle}>Current Conditions</Text>
            </View>
            <View style={styles.environmentGrid}>
              <View style={styles.weatherItem}>
                <Thermometer stroke={colors.primary} width={16} height={16} />
                <Text style={dynamicStyles.weatherText}>
                  {data.weather["Temperature(F)"]?.toFixed(1) || "--"}°F
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <Droplet stroke={colors.primary} width={16} height={16} />
                <Text style={dynamicStyles.weatherText}>
                  {data.weather["Humidity(%)"]?.toFixed(1) || "--"}%
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <Eye stroke={colors.primary} width={16} height={16} />
                <Text style={dynamicStyles.weatherText}>
                  {data.weather["Visibility(mi)"]?.toFixed(1) || "--"} mi
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <Wind stroke={colors.primary} width={16} height={16} />
                <Text style={dynamicStyles.weatherText}>
                  {data.weather["Wind_Speed(mph)"]?.toFixed(1) || "--"} mph
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <CloudRain stroke={colors.primary} width={16} height={16} />
                <Text style={dynamicStyles.weatherText}>
                  {data.weather["Precipitation(in)"]?.toFixed(2) || "--"} in
                </Text>
              </View>
              <View style={styles.weatherItem}>
                {data.daylight_status === "Day" ? (
                  <Sun stroke={colors.warning} width={16} height={16} />
                ) : (
                  <Moon stroke={colors.primary} width={16} height={16} />
                )}
                <Text style={dynamicStyles.weatherText}>{data.daylight_status || "--"}</Text>
              </View>
              <View style={styles.weatherItem}>
                <MapPin stroke={colors.primary} width={16} height={16} />
                <Text style={dynamicStyles.weatherText}>
                  {locationName || "Location Unknown"}
                </Text>
              </View>
            </View>
          </View>

          {/* Alert Card */}
          <View style={[
            dynamicStyles.alertCard,
            data.risk.includes("High") && dynamicStyles.highRiskAlert
          ]}>
            <View style={styles.alertContent}>
              <View style={styles.alertIconContainer}>
                {data.risk.includes("High") ? (
                  <AlertCircle stroke={colors.error} strokeWidth={2} width={20} height={20} />
                ) : (
                  <Info stroke={colors.primary} strokeWidth={2} width={20} height={20} />
                )}
              </View>
              <Text style={dynamicStyles.alertText}>
                {data.risk.includes("High")
                  ? "HIGH RISK DETECTED: Proceed with extreme caution"
                  : "Continuous route monitoring active"}
              </Text>
            </View>
          </View>
        </View>

        {/* Safety Tips Section */}
        <View style={styles.safetyTipsSection}>
          <Text style={dynamicStyles.sectionTitle}>Safety Tips</Text>
          {data.safety_tips.length > 0 ? (
            data.safety_tips.map((tip, index) => (
              <View key={index} style={dynamicStyles.tipCard}>
                <View style={styles.tipIcon}>
                  <AlertCircle stroke={colors.error} width={16} height={16} />
                </View>
                <Text style={dynamicStyles.tipText}>{tip}</Text>
              </View>
            ))
          ) : (
            <Text style={dynamicStyles.noTipsText}>No specific tips available.</Text>
          )}
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Elements */}
      <View style={styles.floatingElements}>
        <View style={[
          styles.floatingDot, 
          styles.dot1,
          { backgroundColor: `${colors.primary}26` }
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    top: height * 0.05,
    left: -width * 0.3,
    transform: [{ rotate: '20deg' }],
  },
  wave2: {
    width: width * 1.4,
    height: width * 1.4,
    top: height * 0.3,
    right: -width * 0.2,
    transform: [{ rotate: '-30deg' }],
  },
  wave3: {
    width: width * 1.8,
    height: width * 1.8,
    top: height * 0.6,
    left: -width * 0.4,
    transform: [{ rotate: '40deg' }],
  },
  wave4: {
    width: width * 1.2,
    height: width * 1.2,
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
  logoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statusHeader: {
    zIndex: 2,
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
  statusPattern: {
    marginRight: 8,
    fontWeight: 'bold',
  },
  statusWave: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 100,
    top: 0,
    right: 0,
    zIndex: 1,
  },
  riskSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  riskGradient: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -100,
    right: -100,
    zIndex: 1,
  },
  loadingContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  riskContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  riskIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  riskTextContainer: {
    alignItems: 'center',
  },
  controlSection: {
    marginBottom: 24,
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
  buttonGradient: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: -75,
    right: -75,
    zIndex: 1,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconContainer: {
    marginRight: 12,
  },
  environmentHeader: {
    marginBottom: 16,
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
  safetyTipsSection: {
    marginBottom: 24,
  },
  tipIcon: {
    marginRight: 12,
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
    top: '20%',
    right: '15%',
  },
  dot2: {
    width: 12,
    height: 12,
    top: '70%',
    left: '10%',
  },
  dot3: {
    width: 10,
    height: 10,
    top: '50%',
    right: '8%',
  },
});