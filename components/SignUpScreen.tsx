import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
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
    ArrowRight,
    Crosshair,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Phone,
    Shield,
    User
} from 'react-native-feather';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface SignUpScreenProps {
  onSignUpSuccess: () => void;
  onBackToLogin: () => void;
}

export default function SignUpScreen({ onSignUpSuccess, onBackToLogin }: SignUpScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Animation values
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Animate logo entrance
    logoScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    logoOpacity.value = withTiming(1, { duration: 800 });
    
    // Animate form entrance with delay
    setTimeout(() => {
      formTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });
      formOpacity.value = withTiming(1, { duration: 600 });
    }, 300);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
    opacity: formOpacity.value,
  }));

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!acceptedTerms) {
      Alert.alert('Error', 'Please accept the Terms and Conditions');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    console.log('Sign up button pressed');
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success', 
        'Account created successfully! Welcome to DriveShield AI!', 
        [{ text: 'OK', onPress: onSignUpSuccess }]
      );
    }, 2000);
  };

  const handleGoogleSignUp = async () => {
    console.log('Google sign up pressed');
    
    setIsLoading(true);
    
    // Simulate Google sign up
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success', 
        'Google account created successfully!', 
        [{ text: 'OK', onPress: onSignUpSuccess }]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Background */}
      <View style={styles.backgroundContainer} pointerEvents="none">
        <View style={[styles.wave, styles.wave1]} />
        <View style={[styles.wave, styles.wave2]} />
        <View style={[styles.wave, styles.wave3]} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBackToLogin}
            activeOpacity={0.7}
          >
            <ArrowLeft stroke="#94a3b8" strokeWidth={2} width={24} height={24} />
          </TouchableOpacity>

          {/* Logo Section */}
          <Animated.View style={[styles.logoSection, logoAnimatedStyle]}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIconContainer}>
                <Crosshair stroke="#3b82f6" strokeWidth={2.5} width={48} height={48} />
              </View>
              <View style={styles.logoGlow} />
            </View>
            <Text style={styles.title}>Join DriveShield</Text>
            <Text style={styles.subtitle}>Create your account for safer journeys</Text>
          </Animated.View>

          {/* Sign Up Form */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <User stroke="#64748b" strokeWidth={2} width={20} height={20} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Full Name"
                placeholderTextColor="#64748b"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Mail stroke="#64748b" strokeWidth={2} width={20} height={20} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Email address"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Phone Input (Optional) */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Phone stroke="#64748b" strokeWidth={2} width={20} height={20} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Phone Number (Optional)"
                placeholderTextColor="#64748b"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Lock stroke="#64748b" strokeWidth={2} width={20} height={20} />
              </View>
              <TextInput
                style={[styles.textInput, { paddingRight: 50 }]}
                placeholder="Password (min. 6 characters)"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff stroke="#64748b" strokeWidth={2} width={20} height={20} />
                ) : (
                  <Eye stroke="#64748b" strokeWidth={2} width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Lock stroke="#64748b" strokeWidth={2} width={20} height={20} />
              </View>
              <TextInput
                style={[styles.textInput, { paddingRight: 50 }]}
                placeholder="Confirm Password"
                placeholderTextColor="#64748b"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showConfirmPassword ? (
                  <EyeOff stroke="#64748b" strokeWidth={2} width={20} height={20} />
                ) : (
                  <Eye stroke="#64748b" strokeWidth={2} width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.termsText}>
                <Text style={styles.termsTextNormal}>I agree to the </Text>
                <Text style={styles.termsTextLink}>Terms of Service</Text>
                <Text style={styles.termsTextNormal}> and </Text>
                <Text style={styles.termsTextLink}>Privacy Policy</Text>
              </View>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity 
              style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.signUpButtonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
                {!isLoading && (
                  <ArrowRight stroke="#ffffff" strokeWidth={2} width={20} height={20} />
                )}
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign Up Button */}
            <TouchableOpacity 
              style={[styles.googleButton, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <View style={styles.googleIcon}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Sign up with Google</Text>
              </View>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity 
                onPress={onBackToLogin}
                activeOpacity={0.7}
              >
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Security Badge */}
          <View style={styles.securityBadge} pointerEvents="none">
            <Shield stroke="#22c55e" strokeWidth={2} width={16} height={16} />
            <Text style={styles.securityText}>Your data is encrypted and secure</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
    backgroundColor: 'rgba(34, 197, 94, 0.025)',
    top: height * 0.8,
    left: -width * 0.1,
    transform: [{ rotate: '45deg' }],
  },
  keyboardContainer: {
    flex: 1,
    zIndex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
    zIndex: 2,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 2,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
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
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 30,
    zIndex: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '400',
    height: 56,
  },
  eyeButton: {
    padding: 8,
    position: 'absolute',
    right: 8,
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  termsTextNormal: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  termsTextLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    lineHeight: 20,
  },
  signUpButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },
  dividerText: {
    fontSize: 14,
    color: '#64748b',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285f4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  signInLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    marginTop: 20,
  },
  securityText: {
    fontSize: 12,
    color: '#22c55e',
    marginLeft: 6,
    fontWeight: '500',
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  floatingDot: {
    position: 'absolute',
    borderRadius: 50,
  },
  dot1: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    top: '15%',
    right: '10%',
  },
  dot2: {
    width: 8,
    height: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    top: '85%',
    left: '8%',
  },
  dot3: {
    width: 10,
    height: 10,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    top: '50%',
    right: '15%',
  },
});