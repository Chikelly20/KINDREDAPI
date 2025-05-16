import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, setDoc } from 'firebase/firestore';
import { auth } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { JobSeekerStackParamList } from '../../navigation';
import { db } from '../../services/firebase';

type Props = NativeStackScreenProps<JobSeekerStackParamList, 'InformalQuestionnaire'>;

interface InformalQuestionnaireData {
  jobSeeking: string;
  workExperience: string;
}

const InformalQuestionnaireScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<InformalQuestionnaireData>({
    jobSeeking: '',
    workExperience: '',
  });

  const updateFormField = (field: keyof InformalQuestionnaireData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Get the current user directly from Firebase auth
    const currentUser = auth.currentUser;
    
    if (!currentUser?.uid) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    // Simple validation check
    if (!formData.jobSeeking || !formData.workExperience) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      // Save questionnaire data to Firestore
      await setDoc(
        doc(db, 'users', currentUser.uid), 
        { 
          informalQuestionnaire: formData,
          profileType: 'informal',
          profileCompleted: true
        },
        { merge: true } // Use merge as a separate parameter as intended
      );
      
      // Navigate to job seeker home screen with reset to prevent going back
      navigation.reset({
        index: 0,
        routes: [{ name: 'JobSeekerHome' }]
      });
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: theme.text }]}>
              Informal Job Profile
            </Text>
            <Text style={[styles.subtitle, { color: theme.text }]}>
              Tell us about the informal work you're looking for
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>
                What kind of jobs are you looking for? <Text style={{ color: theme.primary }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.secondary,
                    borderColor: theme.border,
                    color: theme.text
                  }
                ]}
                placeholder="E.g. Delivery, Housekeeping, Gardening, Babysitting"
                placeholderTextColor={theme.text}
                value={formData.jobSeeking}
                onChangeText={(text) => updateFormField('jobSeeking', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>
                List your working experience <Text style={{ color: theme.primary }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.secondary,
                    borderColor: theme.border,
                    color: theme.text
                  }
                ]}
                placeholder="Describe any previous experience you have in these types of jobs"
                placeholderTextColor={theme.text}
                value={formData.workExperience}
                onChangeText={(text) => updateFormField('workExperience', text)}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.primary }
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.secondary} size="small" />
              ) : (
                <Text style={[styles.submitButtonText, { color: theme.secondary }]}>
                  Submit
                </Text>
              )}
            </TouchableOpacity>
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
  headerContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  submitButton: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    alignSelf: 'flex-end',
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InformalQuestionnaireScreen; 