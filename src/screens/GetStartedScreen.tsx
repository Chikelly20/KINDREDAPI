import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Define the navigation prop type
type RootStackParamList = {
  Splash: undefined;
  GetStarted: undefined;
  Login: undefined;
  Signup: undefined;
  UserType: undefined;
  Home: undefined;
};

type GetStartedScreenNavigationProp = NavigationProp<RootStackParamList>;

const GetStartedScreen = () => {
  const navigation = useNavigation<GetStartedScreenNavigationProp>();
  const { theme } = useTheme();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    // Always navigate to UserType screen first for user to select their role
    navigation.navigate('UserType');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/splash.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={[styles.title, { color: theme.primary }]}>Kindred</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>
        Connecting job seekers with employers
      </Text>

      <View style={styles.featuresContainer}>
        <View style={[styles.featureItem, { backgroundColor: theme.card }]}>
          <FontAwesome name="search" size={24} color={theme.primary} />
          <Text style={[styles.featureTitle, { color: theme.text }]}>Find Jobs</Text>
          <Text style={[styles.featureDescription, { color: theme.text }]}>
            Discover formal and informal job opportunities
          </Text>
        </View>

        <View style={[styles.featureItem, { backgroundColor: theme.card }]}>
          <FontAwesome name="users" size={24} color={theme.primary} />
          <Text style={[styles.featureTitle, { color: theme.text }]}>Connect</Text>
          <Text style={[styles.featureDescription, { color: theme.text }]}>
            Connect directly with employers or job seekers
          </Text>
        </View>

        <View style={[styles.featureItem, { backgroundColor: theme.card }]}>
          <FontAwesome name="briefcase" size={24} color={theme.primary} />
          <Text style={[styles.featureTitle, { color: theme.text }]}>Get Hired</Text>
          <Text style={[styles.featureDescription, { color: theme.text }]}>
            Find the perfect job that matches your skills
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleSignup}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.outlineButton, { borderColor: theme.primary }]}
          onPress={handleLogin}
        >
          <Text style={[styles.buttonText, { color: theme.primary }]}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 36,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 36,
    gap: 16,
  },
  featureItem: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  featureDescription: {
    textAlign: 'center',
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 16,
    gap: 12,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GetStartedScreen; 