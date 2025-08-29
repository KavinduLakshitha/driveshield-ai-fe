import { useAccessibility } from '@/context/AccessibilityContext';
import { useAuth } from '@/context/AuthContext';
import React from 'react';
import {
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    Bell,
    ChevronRight,
    Droplet,
    Eye,
    HelpCircle,
    LogOut,
    Mail,
    Settings,
    Shield,
    User
} from 'react-native-feather';

const { width } = Dimensions.get('window');

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  textColor?: string;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

function SettingsItem({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  showChevron = true, 
  textColor = '#ffffff',
  showSwitch = false,
  switchValue = false,
  onSwitchChange
}: SettingsItemProps) {
  return (
    <TouchableOpacity 
      style={styles.settingsItem} 
      onPress={onPress}
      disabled={showSwitch}
      activeOpacity={showSwitch ? 1 : 0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.settingsIcon}>
          {icon}
        </View>
        <View style={styles.settingsTextContainer}>
          <Text style={[styles.settingsTitle, { color: textColor }]}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingsSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#374151', true: '#3b82f6' }}
            thumbColor={switchValue ? '#ffffff' : '#9ca3af'}
            ios_backgroundColor="#374151"
            style={styles.switchStyle}
          />
        ) : (
          showChevron && (
            <ChevronRight stroke="#64748b" strokeWidth={2} width={20} height={20} />
          )
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { settings, updateSetting, getColors, getFontSizes } = useAccessibility();
  
  // Get current accessibility-aware colors and fonts
  const colors = getColors();
  const fonts = getFontSizes();

  const handleColorBlindMode = async (enabled: boolean) => {
    await updateSetting('colorBlindMode', enabled);
    if (enabled) {
      Alert.alert(
        'Colorblind Support Enabled',
        'The app now uses:\n\n• Enhanced contrast colors\n• Pattern-based indicators (✓, ⚠, ✕)\n• Alternative color schemes\n• Better differentiation for safety alerts\n\nThese changes help distinguish colors more easily.',
        [{ text: 'Got it!' }]
      );
    } else {
      Alert.alert('Colorblind Support Disabled', 'Returned to standard color scheme.');
    }
  };

  const handleHighContrast = async (enabled: boolean) => {
    await updateSetting('highContrast', enabled);
    Alert.alert(
      enabled ? 'High Contrast Enabled' : 'High Contrast Disabled',
      enabled 
        ? 'Interface elements now have maximum contrast for better visibility.'
        : 'Returned to standard contrast levels.'
    );
  };

  const handleLargeText = async (enabled: boolean) => {
    await updateSetting('largeText', enabled);
    Alert.alert(
      enabled ? 'Large Text Enabled' : 'Large Text Disabled',
      enabled 
        ? 'Text throughout the app is now displayed in larger sizes for better readability.'
        : 'Returned to standard text sizes.'
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Notification settings coming soon!');
  };

  const handleSecurity = () => {
    Alert.alert('Security', 'Security settings coming soon!');
  };

  const handleHelp = () => {
    Alert.alert('Help & Support', 'Help center coming soon!');
  };

  const handleAppSettings = () => {
    Alert.alert('App Settings', 'App settings coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Waves */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.wave, styles.wave1]} />
        <View style={[styles.wave, styles.wave2]} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <User stroke="#3b82f6" strokeWidth={2} width={32} height={32} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              <View style={styles.loginMethodBadge}>
                {user?.loginMethod === 'google' ? (
                  <Text style={styles.loginMethodText}>Google Account</Text>
                ) : (
                  <>
                    <Mail stroke="#64748b" strokeWidth={1.5} width={12} height={12} />
                    <Text style={styles.loginMethodText}>Email Account</Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          
          <View style={styles.settingsGroup}>
            <SettingsItem
              icon={<Droplet stroke={colors.success} strokeWidth={2} width={20} height={20} />}
              title="Colorblind Support"
              subtitle="Enhanced colors and patterns for accessibility"
              showSwitch={true}
              switchValue={settings.colorBlindMode}
              onSwitchChange={handleColorBlindMode}
              showChevron={false}
            />
            
            <SettingsItem
              icon={<Eye stroke={colors.primary} strokeWidth={2} width={20} height={20} />}
              title="High Contrast"
              subtitle="Increase contrast for better visibility"
              showSwitch={true}
              switchValue={settings.highContrast}
              onSwitchChange={handleHighContrast}
              showChevron={false}
            />

            <SettingsItem
              icon={<Settings stroke={colors.secondary} strokeWidth={2} width={20} height={20} />}
              title="Large Text"
              subtitle="Increase text size throughout the app"
              showSwitch={true}
              switchValue={settings.largeText}
              onSwitchChange={handleLargeText}
              showChevron={false}
            />
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <View style={styles.settingsGroup}>
            <SettingsItem
              icon={<Bell stroke="#3b82f6" strokeWidth={2} width={20} height={20} />}
              title="Notifications"
              subtitle="Manage alert preferences"
              onPress={handleNotifications}
            />
            
            <SettingsItem
              icon={<Shield stroke="#22c55e" strokeWidth={2} width={20} height={20} />}
              title="Security & Privacy"
              subtitle="Manage your security settings"
              onPress={handleSecurity}
            />
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingsGroup}>
            <SettingsItem
              icon={<Settings stroke="#8b5cf6" strokeWidth={2} width={20} height={20} />}
              title="App Preferences"
              subtitle="Customize your app experience"
              onPress={handleAppSettings}
            />
            
            <SettingsItem
              icon={<HelpCircle stroke="#eab308" strokeWidth={2} width={20} height={20} />}
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={handleHelp}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={[styles.settingsGroup, styles.dangerGroup]}>
            <SettingsItem
              icon={<LogOut stroke="#ef4444" strokeWidth={2} width={20} height={20} />}
              title="Logout"
              subtitle="Sign out of your account"
              onPress={handleLogout}
              showChevron={false}
              textColor="#ef4444"
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>DriveShield AI</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Smart road hazard detection powered by AI
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    height: '100%',
    top: 0,
    left: -width * 0.5,
  },
  wave: {
    position: 'absolute',
    borderRadius: width,
  },
  wave1: {
    width: width * 1.5,
    height: width * 1.5,
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
    top: '10%',
    left: -width * 0.2,
    transform: [{ rotate: '25deg' }],
  },
  wave2: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: 'rgba(139, 92, 246, 0.02)',
    top: '60%',
    right: -width * 0.3,
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
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '400',
  },
  profileCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  loginMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  loginMethodText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
    marginLeft: 4,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsGroup: {
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  dangerGroup: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
    minHeight: 60,
},
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16, // Ensure there's space between text and switch
    },
    settingsItemRight: {
    flexShrink: 0, // Prevent the right side from shrinking
    minWidth: 50,
    alignItems: 'flex-end',
    },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
    },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
    flexWrap: 'wrap',
    },
    settingsSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    flexWrap: 'wrap',
    lineHeight: 16,
    },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 20,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
  switchStyle: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },
    settingsTextContainer: {
    flex: 1, // Allow text container to expand
    flexShrink: 1, // Allow text to shrink if needed
    },
});