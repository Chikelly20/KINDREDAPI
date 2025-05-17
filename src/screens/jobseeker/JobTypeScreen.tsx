import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'JobType'>;

const JobTypeScreen: React.FC<Props> = ({ navigation }) => {
  const { setJobSeekerType } = useAuth();
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState<'formal' | 'informal' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a job type');
      return;
    }

    try {
      setIsLoading(true);
      await setJobSeekerType(selectedType);
      
      // Navigate to the appropriate questionnaire screen
      if (selectedType === 'formal') {
        navigation.navigate('FormalQuestionnaire');
      } else {
        navigation.navigate('InformalQuestionnaire');
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.text }]}>What type of job are you seeking?</Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            Select a job type to continue
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              {
                backgroundColor: theme.secondary,
                borderColor: selectedType === 'formal' ? theme.primary : theme.border,
                borderWidth: selectedType === 'formal' ? 3 : 1,
                shadowColor: theme.text,
                elevation: selectedType === 'formal' ? 8 : 2
              }
            ]}
            onPress={() => setSelectedType('formal')}
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
                <FontAwesome5 
                  name="briefcase" 
                  size={28} 
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
              Formal Jobs
            </Text>
            <Text
              style={[
                styles.optionDescription,
                {
                  color: theme.text
                }
              ]}
            >
              Professional roles requiring specific qualifications and experience
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              {
                backgroundColor: theme.secondary,
                borderColor: selectedType === 'informal' ? theme.primary : theme.border,
                borderWidth: selectedType === 'informal' ? 3 : 1,
                shadowColor: theme.text,
                elevation: selectedType === 'informal' ? 8 : 2
              }
            ]}
            onPress={() => setSelectedType('informal')}
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
                  name="coffee" 
                  size={28} 
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
              Informal Jobs
            </Text>
            <Text
              style={[
                styles.optionDescription,
                {
                  color: theme.text
                }
              ]}
            >
              Casual work, gigs, and temporary positions with flexible requirements
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
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
    marginVertical: 20,
    justifyContent: 'center',
  },
  optionCard: {
    borderRadius: 16,
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
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default JobTypeScreen;
