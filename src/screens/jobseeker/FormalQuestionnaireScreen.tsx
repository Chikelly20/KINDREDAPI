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
import { RootStackParamList } from '../../navigation';
import { db } from '../../services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'FormalQuestionnaire'>;

interface FormalQuestionnaireData {
  jobSeeking: string;
  previousRoles: string;
  qualifications: string;
  languages: string;
  references: string;
}

const FormalQuestionnaireScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormalQuestionnaireData>({
    jobSeeking: '',
    previousRoles: '',
    qualifications: '',
    languages: '',
    references: '',
  });

  const updateFormField = (field: keyof FormalQuestionnaireData, value: string) => {
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
    if (!formData.jobSeeking || !formData.previousRoles || !formData.qualifications) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      // Save questionnaire data to Firestore
      await setDoc(
        doc(db, 'users', currentUser.uid), 
        { 
          formalQuestionnaire: formData,
          profileType: 'formal',
          profileCompleted: true,
        }, 
        { merge: true }
      );
      
      // Navigate to job seeker home screen
      navigation.navigate('JobSeekerHome');
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
              Formal Job Profile
            </Text>
            <Text style={[styles.subtitle, { color: theme.text }]}>
              Please complete your professional profile
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>
                What job are you looking for? <Text style={{ color: theme.primary }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.secondary,
                    borderColor: theme.border,
                    color: theme.text
                  }
                ]}
                placeholder="E.g. Software Developer, Marketing Manager"
                placeholderTextColor={theme.text}
                value={formData.jobSeeking}
                onChangeText={(text) => updateFormField('jobSeeking', text)}
                multiline
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>
                List your previous work roles <Text style={{ color: theme.primary }}>*</Text>
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
                placeholder="List your job titles, companies, and dates"
                placeholderTextColor={theme.text}
                value={formData.previousRoles}
                onChangeText={(text) => updateFormField('previousRoles', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>
                What are your qualifications? <Text style={{ color: theme.primary }}>*</Text>
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
                placeholder="List your degrees, certifications, and skills"
                placeholderTextColor={theme.text}
                value={formData.qualifications}
                onChangeText={(text) => updateFormField('qualifications', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>
                Do you speak any languages other than English?
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.secondary,
                    borderColor: theme.border,
                    color: theme.text
                  }
                ]}
                placeholder="List languages and proficiency levels"
                placeholderTextColor={theme.text}
                value={formData.languages}
                onChangeText={(text) => updateFormField('languages', text)}
                multiline
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.text }]}>
                Can you provide professional references?
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
                placeholder="List name, relationship, contact details"
                placeholderTextColor={theme.text}
                value={formData.references}
                onChangeText={(text) => updateFormField('references', text)}
                multiline
                numberOfLines={4}
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
    marginBottom: 20,
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
    minHeight: 100,
    paddingTop: 12,
  },
  submitButton: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'flex-end',
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FormalQuestionnaireScreen; 