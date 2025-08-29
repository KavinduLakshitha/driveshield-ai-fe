import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {
    ArrowLeft,
    MapPin,
    Mic,
    Navigation,
    Search,
    Square,
    Target,
    Volume2
} from 'react-native-feather';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface VoiceAssistantProps {
  onBack: () => void;
}

export default function VoiceAssistant({ onBack }: VoiceAssistantProps) {
  const [locationInput, setLocationInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    'Negombo Beach',
    'Colombo Fort Railway Station',
    'Bandaranaike International Airport',
    'Galle Face Green'
  ]);

  // Animation values
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  const waveScale = useSharedValue(0.8);
  const micRotation = useSharedValue(0);
  const inputFocus = useSharedValue(0);

  // Voice visualization animation
  const voiceWave1 = useSharedValue(0);
  const voiceWave2 = useSharedValue(0);
  const voiceWave3 = useSharedValue(0);

  React.useEffect(() => {
    if (isListening) {
      // Start listening animations
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
      
      waveScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1000 }),
          withTiming(0.8, { duration: 1000 })
        ),
        -1,
        false
      );

      // Voice wave animations
      voiceWave1.value = withRepeat(withTiming(1, { duration: 400 }), -1, true);
      voiceWave2.value = withRepeat(withTiming(1, { duration: 600 }), -1, true);
      voiceWave3.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    } else {
      // Reset animations
      pulseScale.value = withSpring(1);
      waveScale.value = withSpring(1);
      voiceWave1.value = withTiming(0, { duration: 200 });
      voiceWave2.value = withTiming(0, { duration: 200 });
      voiceWave3.value = withTiming(0, { duration: 200 });
    }
  }, [isListening]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: waveScale.value }],
  }));

  const inputStyle = useAnimatedStyle(() => ({
    borderColor: inputFocus.value === 1
      ? 'rgba(148, 163, 184, 0.5)'
      : 'rgba(148, 163, 184, 0.2)',
    shadowOpacity: interpolate(inputFocus.value, [0, 1], [0.1, 0.3]),
  }));

  const voiceWave1Style = useAnimatedStyle(() => ({
    transform: [{ scaleY: interpolate(voiceWave1.value, [0, 1], [0.3, 1]) }],
    opacity: interpolate(voiceWave1.value, [0, 1], [0.6, 1]),
  }));

  const voiceWave2Style = useAnimatedStyle(() => ({
    transform: [{ scaleY: interpolate(voiceWave2.value, [0, 1], [0.2, 0.8]) }],
    opacity: interpolate(voiceWave2.value, [0, 1], [0.4, 0.8]),
  }));

  const voiceWave3Style = useAnimatedStyle(() => ({
    transform: [{ scaleY: interpolate(voiceWave3.value, [0, 1], [0.1, 0.6]) }],
    opacity: interpolate(voiceWave3.value, [0, 1], [0.3, 0.6]),
  }));

  const handleVoiceToggle = () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      setIsProcessing(true);
      
      // Simulate voice processing
      setTimeout(() => {
        setIsProcessing(false);
        const mockVoiceResult = "Negombo to Colombo Fort Railway Station";
        setVoiceText(mockVoiceResult);
        setLocationInput(mockVoiceResult);
        Alert.alert('Voice Input Received', mockVoiceResult);
      }, 2000);
    } else {
      // Start listening
      setIsListening(true);
      setVoiceText('');
      Alert.alert('Voice Assistant', 'Listening... Say your destination!');
    }
  };

  const handleSearch = () => {
    if (!locationInput.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    // Add to recent searches if not already there
    if (!recentSearches.includes(locationInput)) {
      setRecentSearches([locationInput, ...recentSearches.slice(0, 3)]);
    }

    Alert.alert(
      'Navigation Request',
      `Navigate to: ${locationInput}\n\nThis will open your preferred navigation app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Navigate', 
          onPress: () => {
            // Here you would integrate with navigation APIs
            console.log('Navigate to:', locationInput);
            Alert.alert('Success', `Starting navigation to ${locationInput}`);
          }
        }
      ]
    );
  };

  const handleRecentSearch = (location: string) => {
    setLocationInput(location);
    inputFocus.value = withTiming(1, { duration: 200 });
    setTimeout(() => {
      inputFocus.value = withTiming(0, { duration: 200 });
    }, 1000);
  };

  const clearInput = () => {
    setLocationInput('');
    setVoiceText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Waves */}
      <View style={styles.backgroundContainer} pointerEvents="none">
        <View style={[styles.wave, styles.wave1]} />
        <View style={[styles.wave, styles.wave2]} />
        <View style={[styles.wave, styles.wave3]} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <ArrowLeft stroke="#94a3b8" strokeWidth={2} width={24} height={24} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>Voice Assistant</Text>
            <Text style={styles.subtitle}>Where would you like to go?</Text>
          </View>
        </View>

        {/* Voice Input Section */}
        <View style={styles.voiceSection}>
          {/* Voice Visualization */}
          <View style={styles.voiceVisualization}>
            <Animated.View style={[styles.voiceWave, waveStyle]}>
              <View style={styles.voiceWaveInner} />
            </Animated.View>
            
            {/* Voice Bars - Only show when listening */}
            {isListening && (
              <View style={styles.voiceBars}>
                <Animated.View style={[styles.voiceBar, styles.voiceBar1, voiceWave1Style]} />
                <Animated.View style={[styles.voiceBar, styles.voiceBar2, voiceWave2Style]} />
                <Animated.View style={[styles.voiceBar, styles.voiceBar3, voiceWave3Style]} />
                <Animated.View style={[styles.voiceBar, styles.voiceBar2, voiceWave2Style]} />
                <Animated.View style={[styles.voiceBar, styles.voiceBar1, voiceWave1Style]} />
              </View>
            )}

            {/* Voice Button */}
            <Animated.View style={pulseStyle}>
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  isListening && styles.voiceButtonActive,
                  isProcessing && styles.voiceButtonProcessing
                ]}
                onPress={handleVoiceToggle}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <Volume2 stroke="#ffffff" strokeWidth={2} width={32} height={32} />
                ) : isListening ? (
                  <Square stroke="#ffffff" strokeWidth={2} width={24} height={24} fill="#ffffff" />
                ) : (
                  <Mic stroke="#ffffff" strokeWidth={2} width={32} height={32} />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Voice Status */}
          <View style={styles.voiceStatus}>
            <Text style={styles.voiceStatusText}>
              {isProcessing 
                ? 'Processing your voice...' 
                : isListening 
                  ? 'Listening... Speak now!' 
                  : 'Tap to speak or type below'
              }
            </Text>
            {voiceText ? (
              <Text style={styles.voiceResultText}>"{voiceText}"</Text>
            ) : null}
          </View>
        </View>

        {/* Manual Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Or type your destination</Text>
          
          <Animated.View style={[styles.inputContainer, inputStyle]}>
            <View style={styles.inputIcon}>
              <MapPin stroke="#64748b" strokeWidth={2} width={20} height={20} />
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Enter destination (e.g., Colombo Fort)"
              placeholderTextColor="#64748b"
              value={locationInput}
              onChangeText={setLocationInput}
              onFocus={() => inputFocus.value = withTiming(1)}
              onBlur={() => inputFocus.value = withTiming(0)}
              multiline
              maxLength={100}
            />
            {locationInput ? (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearInput}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            ) : null}
          </Animated.View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.searchButton, !locationInput && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={!locationInput}
              activeOpacity={0.8}
            >
              <Navigation stroke="#ffffff" strokeWidth={2} width={20} height={20} />
              <Text style={styles.searchButtonText}>Start Navigation</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Searches */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <View style={styles.recentList}>
            {recentSearches.map((location, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentItem}
                onPress={() => handleRecentSearch(location)}
                activeOpacity={0.7}
              >
                <View style={styles.recentIcon}>
                  <Target stroke="#3b82f6" strokeWidth={2} width={16} height={16} />
                </View>
                <Text style={styles.recentText}>{location}</Text>
                <Search stroke="#64748b" strokeWidth={1.5} width={16} height={16} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Elements */}
      <View style={styles.floatingElements} pointerEvents="none">
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
    zIndex: 0,
  },
  wave: {
    position: 'absolute',
    borderRadius: width,
  },
  wave1: {
    width: width * 1.6,
    height: width * 1.6,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    top: height * 0.15,
    left: -width * 0.3,
    transform: [{ rotate: '25deg' }],
  },
  wave2: {
    width: width * 1.3,
    height: width * 1.3,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
    top: height * 0.5,
    right: -width * 0.2,
    transform: [{ rotate: '-35deg' }],
  },
  wave3: {
    width: width * 1.1,
    height: width * 1.1,
    backgroundColor: 'rgba(34, 197, 94, 0.02)',
    top: height * 0.8,
    left: -width * 0.1,
    transform: [{ rotate: '15deg' }],
  },
  scrollContainer: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  voiceSection: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 32,
  },
  voiceVisualization: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  voiceWave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceWaveInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  voiceBars: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 10,
  },
  voiceBar: {
    width: 4,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  voiceBar1: {
    height: 20,
  },
  voiceBar2: {
    height: 30,
  },
  voiceBar3: {
    height: 40,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 15,
  },
  voiceButtonActive: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  voiceButtonProcessing: {
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
  },
  voiceStatus: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  voiceStatusText: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  voiceResultText: {
    fontSize: 14,
    color: '#3b82f6',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
  inputSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
    minHeight: 60,
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  clearButton: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  actionButtons: {
    gap: 12,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchButtonDisabled: {
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    shadowOpacity: 0.1,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  recentSection: {
    marginBottom: 32,
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  recentIcon: {
    marginRight: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 15,
    color: '#e2e8f0',
    fontWeight: '400',
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
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    top: '20%',
    right: '15%',
  },
  dot2: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    top: '70%',
    left: '10%',
  },
  dot3: {
    width: 10,
    height: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    top: '85%',
    right: '20%',
  },
});