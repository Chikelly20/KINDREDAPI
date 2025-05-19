import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { View, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Navigation from './src/navigation';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { JobSeekerProfilesProvider } from './src/context/JobSeekerProfilesContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import firebase from './src/services/firebase';

// Enable screens for better navigation performance
enableScreens();

// Prevent auto-hiding of splash screen
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);

  // Prepare app and load resources
  useEffect(() => {
    async function prepare() {
      try {
        // Check Firebase initialization
        if (firebase.apps.length) {
          console.log('Firebase has been initialized');
        } else {
          console.error('Firebase has not been initialized');
        }
        
        // Simulate some loading time (remove in production)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide splash screen
      await SplashScreen.hideAsync();
      setSplashVisible(false);
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      {splashVisible && (
        <View style={styles.splashContainer}>
          <Image 
            source={require('./assets/splash.png')} 
            style={styles.splashImage} 
            resizeMode="contain"
          />
        </View>
      )}
      <ThemeProvider>
        <AuthProvider>
          <JobSeekerProfilesProvider>
            <NotificationsProvider>
              <Navigation />
              <StatusBar style="light" />
            </NotificationsProvider>
          </JobSeekerProfilesProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  splashImage: {
    width: '80%',
    height: '80%',
  },
});