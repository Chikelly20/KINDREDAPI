import * as React from 'react';
import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { RootStackParamList } from '../../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'UserType'>;

const UserTypeScreen: React.FC<Props> = ({ navigation }) => {
  const { setUserType, user } = useAuth();
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState<'jobseeker' | 'employer' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get screen dimensions for responsive design
  const { width, height } = Dimensions.get('window');

  const handleContinue = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a user type');
      return;
    }

    try {
      setIsLoading(true);
      // Store the user type
      await setUserType(selectedType);
      
      // Check if user is already authenticated
      if (user) {
        // User is already logged in, navigate to the appropriate home screen based on user type
        if (selectedType === 'jobseeker') {
          // If jobseeker, check if they've completed job type selection
          if (user.jobSeekerType) {
            navigation.navigate('JobSeekerHome');
          } else {
            // If they haven't selected job type yet, take them to job type selection
            navigation.navigate('JobType');
          }
        } else if (selectedType === 'employer') {
          navigation.navigate('EmployerHome');
        }
      } else {
        // User is not logged in, continue to signup with the selected user type
        navigation.navigate('Signup', { userType: selectedType });
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={theme.text === '#000000' ? 'dark-content' : 'light-content'}
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.text }]}>What are you looking for?</Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            Select your role to continue
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              {
                backgroundColor: theme.secondary,
                borderColor: selectedType === 'jobseeker' ? theme.primary : theme.border,
                borderWidth: selectedType === 'jobseeker' ? 3 : 1,
                shadowColor: theme.text,
                elevation: selectedType === 'jobseeker' ? 8 : 2,
              }
            ]}
            onPress={() => setSelectedType('jobseeker')}
          >
            <View style={styles.optionIconContainer}>
              <View
                style={[
                  styles.iconPlaceholder,
                  {
                    backgroundColor: theme.primary
                  }
                ]}
              >
                <FontAwesome 
                  name="user" 
                  size={36} 
                  color="#FFFFFF" 
                />
              </View>
            </View>
            <Text
              style={[
                styles.optionTitle,
                {
                  color: theme.text
                }
              ]}
            >
              Job Seeker
            </Text>
            <Text
              style={[
                styles.optionDescription,
                {
                  color: theme.text
                }
              ]}
            >
              Find job opportunities that match your skills and preferences
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              {
                backgroundColor: theme.secondary,
                borderColor: selectedType === 'employer' ? theme.primary : theme.border,
                borderWidth: selectedType === 'employer' ? 3 : 1,
                shadowColor: theme.text,
                elevation: selectedType === 'employer' ? 8 : 2,
              }
            ]}
            onPress={() => setSelectedType('employer')}
          >
            <View style={styles.optionIconContainer}>
              <View
                style={[
                  styles.iconPlaceholder,
                  {
                    backgroundColor: theme.primary
                  }
                ]}
              >
                <FontAwesome 
                  name="briefcase" 
                  size={36} 
                  color="#FFFFFF" 
                />
              </View>
            </View>
            <Text
              style={[
                styles.optionTitle,
                {
                  color: theme.text
                }
              ]}
            >
              Employer
            </Text>
            <Text
              style={[
                styles.optionDescription,
                {
                  color: theme.text
                }
              ]}
            >
              Post jobs and find qualified candidates for your positions
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: theme.primary,
              opacity: selectedType ? 1 : 0.7,
              shadowColor: theme.text,
              elevation: selectedType ? 5 : 0,
            }
          ]}
          onPress={handleContinue}
          disabled={!selectedType || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.secondary} size="small" />
          ) : (
            <Text style={[styles.continueButtonText, { color: theme.secondary }]}>
              Continue
            </Text>
          )}
        </TouchableOpacity>
        

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  headerContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  optionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  optionIconContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  roleIcon: {
    width: 50,
    height: 50,
    tintColor: '#FFFFFF',
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

});

export default UserTypeScreen; 