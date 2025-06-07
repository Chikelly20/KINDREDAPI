import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const SignupScreen: React.FC<Props> = ({ navigation, route }) => {
  const userType = route.params?.userType;
  const { signUp, signInWithGoogle } = useAuth();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!userType) {
      Alert.alert('Error', 'Please select a user type first');
      navigation.navigate('UserType');
      return;
    }

    try {
      setIsLoading(true);
      // Pass the userType to signUp to store it with the user profile
      await signUp(email, password, name, userType);
      
      // Navigate to the appropriate screen based on user type
      if (userType === 'jobseeker') {
        // For job seekers, always navigate to JobType screen first
        // This ensures they complete the job type selection process
        navigation.reset({
          index: 0,
          routes: [{ name: 'JobType' }]
        });
      } else if (userType === 'employer') {
        // For employers, navigate directly to the employer home screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'EmployerHome' }]
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignup = async () => {
    if (!userType) {
      Alert.alert('Error', 'Please select a user type first');
      navigation.navigate('UserType');
      return;
    }

    try {
      setIsGoogleLoading(true);
      await signInWithGoogle(userType);
      
      // Navigate to the appropriate screen based on user type
      if (userType === 'jobseeker') {
        // For job seekers, always navigate to JobType screen first
        navigation.reset({
          index: 0,
          routes: [{ name: 'JobType' }]
        });
      } else if (userType === 'employer') {
        // For employers, navigate directly to the employer home screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'EmployerHome' }]
        });
      }
    } catch (error) {
      console.error('Google sign-up error:', error);
      // Error handling is already done in the AuthContext
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Text style={[styles.appName, { color: theme.primary }]}>KINDRED</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.text }]}>
              Sign up to get started
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.secondary,
                    borderColor: theme.border,
                    color: theme.text
                  }
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={theme.text}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.secondary,
                    borderColor: theme.border,
                    color: theme.text
                  }
                ]}
                placeholder="Enter your email"
                placeholderTextColor={theme.text}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.secondary,
                    borderColor: theme.border,
                    color: theme.text
                  }
                ]}
                placeholder="Enter your password"
                placeholderTextColor={theme.text}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.secondary,
                    borderColor: theme.border,
                    color: theme.text
                  }
                ]}
                placeholder="Confirm your password"
                placeholderTextColor={theme.text}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.primary }
              ]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.secondary} size="small" />
              ) : (
                <Text style={[styles.buttonText, { color: theme.secondary }]}>Sign Up</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.text }]}>OR</Text>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>
            
            <TouchableOpacity
              style={[
                styles.googleButton,
                { backgroundColor: theme.secondary, borderColor: theme.border }
              ]}
              onPress={handleGoogleSignup}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color={theme.primary} size="small" />
              ) : (
                <>
                  <Image 
                    source={require('../../assets/google-logo.png')} 
                    style={styles.googleIcon} 
                    resizeMode="contain"
                  />
                  <Text style={[styles.googleButtonText, { color: theme.text }]}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.text }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: theme.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  }
});

export default SignupScreen;