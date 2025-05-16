import * as React from 'react';
import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
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
                backgroundColor: selectedType === 'jobseeker' ? theme.primary : theme.secondary,
                borderColor: selectedType === 'jobseeker' ? theme.primary : theme.border
              }
            ]}
            onPress={() => setSelectedType('jobseeker')}
          >
            <View style={styles.optionIconContainer}>
              {/* Replace with actual icon */}
              <View
                style={[
                  styles.iconPlaceholder,
                  {
                    backgroundColor: selectedType === 'jobseeker' ? theme.secondary : theme.primary
                  }
                ]}
              />
            </View>
            <Text
              style={[
                styles.optionTitle,
                {
                  color: selectedType === 'jobseeker' ? theme.secondary : theme.text
                }
              ]}
            >
              Job Seeker
            </Text>
            <Text
              style={[
                styles.optionDescription,
                {
                  color: selectedType === 'jobseeker' ? theme.secondary : theme.text
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
                backgroundColor: selectedType === 'employer' ? theme.primary : theme.secondary,
                borderColor: selectedType === 'employer' ? theme.primary : theme.border
              }
            ]}
            onPress={() => setSelectedType('employer')}
          >
            <View style={styles.optionIconContainer}>
              {/* Replace with actual icon */}
              <View
                style={[
                  styles.iconPlaceholder,
                  {
                    backgroundColor: selectedType === 'employer' ? theme.secondary : theme.primary
                  }
                ]}
              />
            </View>
            <Text
              style={[
                styles.optionTitle,
                {
                  color: selectedType === 'employer' ? theme.secondary : theme.text
                }
              ]}
            >
              Employer
            </Text>
            <Text
              style={[
                styles.optionDescription,
                {
                  color: selectedType === 'employer' ? theme.secondary : theme.text
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
              opacity: selectedType ? 1 : 0.7
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
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  optionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 16,
  },
  optionIconContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  continueButton: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserTypeScreen; 