// components/ui/TabBarBackground.tsx
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabBarBackground() {
  if (Platform.OS === 'ios') {
    // Use blur effect on iOS for a more native feel
    return (
      <>
        <BlurView
          intensity={95}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay} />
      </>
    );
  }

  // Solid background for Android
  return <View style={styles.androidBackground} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 36, 0.8)', // Your app's dark blue with transparency
  },
  androidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 36, 0.95)', // Slightly more opaque for Android
  },
});