import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilitySettings {
  colorBlindMode: boolean;
  highContrast: boolean;
  largeText: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => Promise<void>;
  getColors: () => ColorScheme;
  getFontSizes: () => FontSizes;
  isLoading: boolean;
}

interface ColorScheme {
  error: any;
  // Status colors - colorblind friendly alternatives
  success: string;
  warning: string;
  danger: string;
  info: string;
  // UI colors with contrast adjustments
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

interface FontSizes {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
  title: number;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const ACCESSIBILITY_STORAGE_KEY = '@driveshield_accessibility';

// Default colors (current theme)
const defaultColors: ColorScheme = {
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    info: '#3b82f6',
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#0a0f24',
    surface: 'rgba(51, 65, 85, 0.6)',
    text: '#ffffff',
    textSecondary: '#94a3b8',
    error: undefined
};

// Colorblind-friendly colors with patterns/shapes support
const colorBlindColors: ColorScheme = {
    success: '#0d9488', // Teal - distinguishable from red/green
    warning: '#f59e0b', // Amber - stays distinct
    danger: '#dc2626', // Red with higher contrast
    info: '#0ea5e9', // Sky blue - more distinct
    primary: '#0ea5e9',
    secondary: '#7c3aed',
    background: '#0a0f24',
    surface: 'rgba(51, 65, 85, 0.8)', // Higher contrast
    text: '#ffffff',
    textSecondary: '#cbd5e1',
    error: undefined
};

// High contrast color overrides
const highContrastColors: ColorScheme = {
    success: '#00ff88',
    warning: '#ffaa00',
    danger: '#ff3366',
    info: '#0099ff',
    primary: '#0099ff',
    secondary: '#aa55ff',
    background: '#000000',
    surface: 'rgba(255, 255, 255, 0.1)',
    text: '#ffffff',
    textSecondary: '#cccccc',
    error: undefined
};

// Default font sizes
const defaultFontSizes: FontSizes = {
  small: 12,
  medium: 14,
  large: 16,
  xlarge: 18,
  title: 24,
};

// Large text font sizes
const largeFontSizes: FontSizes = {
  small: 16,
  medium: 18,
  large: 20,
  xlarge: 24,
  title: 32,
};

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    colorBlindMode: false,
    highContrast: false,
    largeText: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: keyof AccessibilitySettings, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await AsyncStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  };

  const getColors = (): ColorScheme => {
    let colors = { ...defaultColors };
    
    if (settings.colorBlindMode) {
      colors = { ...colorBlindColors };
    }
    
    if (settings.highContrast) {
      colors = { ...colors, ...highContrastColors };
    }
    
    return colors;
  };

  const getFontSizes = (): FontSizes => {
    return settings.largeText ? largeFontSizes : defaultFontSizes;
  };

  const value: AccessibilityContextType = {
    settings,
    updateSetting,
    getColors,
    getFontSizes,
    isLoading,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Helper hook for getting accessible colors
export function useAccessibleColors() {
  const { getColors } = useAccessibility();
  return getColors();
}

// Helper hook for getting accessible font sizes
export function useAccessibleFonts() {
  const { getFontSizes } = useAccessibility();
  return getFontSizes();
}

// Utility function to create status indicators with colorblind support
export function getStatusIndicator(type: 'success' | 'warning' | 'danger' | 'info', colorBlindMode: boolean) {
  const patterns = {
    success: colorBlindMode ? '✓' : '', // Checkmark pattern
    warning: colorBlindMode ? '⚠' : '', // Warning symbol
    danger: colorBlindMode ? '✕' : '',  // X pattern
    info: colorBlindMode ? 'ℹ' : '',    // Info symbol
  };

  return {
    pattern: patterns[type],
    needsPattern: colorBlindMode,
  };
}