import { useAuth } from '@/context/AuthContext';
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
  Info,
  Lock,
  Mail,
  Phone,
  User
} from 'react-native-feather';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Test credentials for easy login
const TEST_CREDENTIALS = {
  email: 'test@driveshield.ai',
  password: 'password123'
};

export default function AuthManager() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  // Animation values
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Reset animations when screen changes
    logoScale.value = 0.8;
    logoOpacity.value = 0;
    formTranslateY.value = 50;
    formOpacity.value = 0;

    // Animate entrance
    logoScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    logoOpacity.value = withTiming(1, { duration: 800 });
    
    setTimeout(() => {
      formTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });
      formOpacity.value = withTiming(1, { duration: 600 });
    }, 300);
  }, [currentScreen]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
    opacity: formOpacity.value,
  }));

  const handleLogin = async () => {
    console.log('Login button pressed');
    
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Check test credentials
    if (email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
      setIsLoading(true);
      
      setTimeout(async () => {
        setIsLoading(false);
        const userData = {
          id: 'test_user_123',
          email: TEST_CREDENTIALS.email,
          name: 'Test User',
          avatar: undefined,
          loginMethod: 'email' as const,
        };
        await login(userData);
        Alert.alert('Login Successful!', 'Welcome to DriveShield AI!');
      }, 1500);
      return;
    }

    // Invalid credentials
    Alert.alert(
      'Invalid Credentials', 
      `Please use the test credentials:\nEmail: ${TEST_CREDENTIALS.email}\nPassword: ${TEST_CREDENTIALS.password}`
    );
  };

  const handleGoogleLogin = async () => {
    console.log('Google login pressed');
    setIsLoading(true);
    
    setTimeout(async () => {
      setIsLoading(false);
      const userData = {
        id: 'google_user_456',
        email: 'user@gmail.com',
        name: 'Google User',
        avatar: undefined,
        loginMethod: 'google' as const,
      };
      await login(userData);
      Alert.alert('Google Login Successful!', 'Welcome to DriveShield AI!');
    }, 1500);
  };

  const handleSignUp = async () => {
    console.log('Sign up button pressed');
    
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!acceptedTerms) {
      Alert.alert('Error', 'Please accept the Terms and Conditions');
      return;
    }

    setIsLoading(true);
    
    setTimeout(async () => {
      setIsLoading(false);
      const userData = {
        id: 'new_user_' + Date.now(),
        email: email,
        name: fullName,
        avatar: undefined,
        loginMethod: 'email' as const,
      };
      await login(userData);
      Alert.alert('Account Created!', 'Welcome to DriveShield AI!');
    }, 2000);
  };

  const handleUseTestCredentials = () => {
    setEmail(TEST_CREDENTIALS.email);
    setPassword(TEST_CREDENTIALS.password);
    Alert.alert('Test Credentials Filled!', 'Now tap "Sign In" to login');
  };

  const navigateToSignUp = () => {
    console.log('🔄 Navigating to Sign Up');
    setCurrentScreen('signup');
    // Clear form
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhone('');
    setAcceptedTerms(false);
  };

  const navigateToLogin = () => {
    console.log('🔄 Navigating to Login');
    setCurrentScreen('login');
    // Clear form
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhone('');
    setAcceptedTerms(false);
  };

  const renderLoginScreen = () => (
    <SafeAreaView style={styles.container}>
      {/* Background */}
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
          {/* Logo Section */}
          <Animated.View style={[styles.logoSection, logoAnimatedStyle]}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIconContainer}>
                <Crosshair stroke="#3b82f6" strokeWidth={2.5} width={48} height={48} />
              </View>
              <View style={styles.logoGlow} />
            </View>
            <Text style={styles.title}>DRIVESHIELD AI</Text>
            <Text style={styles.subtitle}>Welcome back to safety</Text>
          </Animated.View>

          {/* Test Credentials Card */}
          <View style={styles.testCredentialsCard}>
            <View style={styles.testCredentialsHeader}>
              <Info stroke="#3b82f6" strokeWidth={2} width={16} height={16} />
              <Text style={styles.testCredentialsTitle}>Test Login</Text>
            </View>
            <Text style={styles.testCredentialsText}>
              Email: {TEST_CREDENTIALS.email}{'\n'}
              Password: {TEST_CREDENTIALS.password}
            </Text>
            <TouchableOpacity 
              style={styles.fillCredentialsButton}
              onPress={handleUseTestCredentials}
              activeOpacity={0.7}
            >
              <Text style={styles.fillCredentialsText}>Fill Credentials</Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
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
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Lock stroke="#64748b" strokeWidth={2} width={20} height={20} />
              </View>
              <TextInput
                style={[styles.textInput, { paddingRight: 50 }]}
                placeholder="Password"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff stroke="#64748b" strokeWidth={2} width={20} height={20} />
                ) : (
                  <Eye stroke="#64748b" strokeWidth={2} width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[styles.signInButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.signInButtonText}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
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

            {/* Google Button */}
            <TouchableOpacity 
              style={[styles.googleButton, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <View style={styles.googleIcon}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity 
                onPress={navigateToSignUp}
                activeOpacity={0.7}
              >
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  const renderSignUpScreen = () => (
    <SafeAreaView style={styles.container}>
      {/* Background */}
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
            onPress={navigateToLogin}
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
              />
            </View>

            {/* Phone Input */}
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
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff stroke="#64748b" strokeWidth={2} width={20} height={20} />
                ) : (
                  <Eye stroke="#64748b" strokeWidth={2} width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
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
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                {showConfirmPassword ? (
                  <EyeOff stroke="#64748b" strokeWidth={2} width={20} height={20} />
                ) : (
                  <Eye stroke="#64748b" strokeWidth={2} width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>

            {/* Terms Checkbox */}
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
              style={[styles.signInButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.signInButtonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
                {!isLoading && (
                  <ArrowRight stroke="#ffffff" strokeWidth={2} width={20} height={20} />
                )}
              </View>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Already have an account? </Text>
              <TouchableOpacity 
                onPress={navigateToLogin}
                activeOpacity={0.7}
              >
                <Text style={styles.signUpLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  console.log('📱 Current screen:', currentScreen);

  return currentScreen === 'signup' ? renderSignUpScreen() : renderLoginScreen();
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
    top: height * 0.7,
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
    justifyContent: 'center',
    minHeight: height,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
    zIndex: 2,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
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
  testCredentialsCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  testCredentialsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testCredentialsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 6,
  },
  testCredentialsText: {
    fontSize: 13,
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 12,
    lineHeight: 18,
  },
  fillCredentialsButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  fillCredentialsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
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
  signInButton: {
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
  signInButtonText: {
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  signUpLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
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
});