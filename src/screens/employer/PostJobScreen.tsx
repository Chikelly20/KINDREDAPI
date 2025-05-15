import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { EmployerStackParamList } from '../../navigation';
import { Ionicons } from '@expo/vector-icons';
import {
  doc,
  collection,
  addDoc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';

type Props = NativeStackScreenProps<EmployerStackParamList, 'PostJob'>;

interface JobFormData {
  title: string;
  location: string;
  salary: string;
  workingDays: string;
  workingHours: string;
  description: string;
  contactInfo: string;
}

const PostJobScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params || {}; // jobId will be defined for edits, undefined for new jobs
  const { user } = useAuth();
  const { theme } = useTheme();
  
  // Define shadow styles
  const shadows = {
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(!!jobId);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    location: '',
    salary: '',
    workingDays: '',
    workingHours: '',
    description: '',
    contactInfo: '',
  });

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    if (!jobId) return;

    try {
      setIsLoadingJob(true);
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      
      if (jobDoc.exists()) {
        const jobData = jobDoc.data() as JobFormData;
        setFormData({
          title: jobData.title || '',
          location: jobData.location || '',
          salary: jobData.salary || '',
          workingDays: jobData.workingDays || '',
          workingHours: jobData.workingHours || '',
          description: jobData.description || '',
          contactInfo: jobData.contactInfo || '',
        });
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      Alert.alert('Error', 'Failed to load job details. Please try again.');
    } finally {
      setIsLoadingJob(false);
    }
  };

  const updateFormField = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const requiredFields: (keyof JobFormData)[] = [
      'title', 'location', 'salary', 'workingDays', 'workingHours', 'description'
    ];
    
    const emptyFields = requiredFields.filter(field => !formData[field].trim());
    
    if (emptyFields.length > 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }
    
    return true;
  };

  const handleSaveJob = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      const jobData = {
        ...formData,
        employerId: user.uid,
        employerName: user.displayName || 'Employer',
        updatedAt: serverTimestamp(),
        applicantsCount: 0, // Initialize or maintain applicants count
        status: 'active', // Add job status
        categories: formData.title.toLowerCase().split(/[,\s]+/).filter(Boolean), // Add searchable categories
      };
      
      if (jobId) {
        // Update existing job
        await setDoc(
          doc(db, 'jobs', jobId),
          {
            ...jobData,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        
        Alert.alert(
          'Success', 
          'Job updated successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      } else {
        // Create new job
        const docRef = await addDoc(collection(db, 'jobs'), {
          ...jobData,
          createdAt: serverTimestamp(),
        });
        
        // Store the job ID for reference
        const newJobId = docRef.id;
        
        Alert.alert(
          'Success', 
          'Job posted successfully!',
          [
            { 
              text: 'View My Jobs', 
              onPress: () => navigation.goBack() 
            },
            {
              text: 'Post Another Job',
              onPress: () => {
                // Reset the form for a new job
                setFormData({
                  title: '',
                  location: '',
                  salary: '',
                  workingDays: '',
                  workingHours: '',
                  description: '',
                  contactInfo: '',
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error saving job:', error);
      Alert.alert('Error', 'Failed to save job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingJob) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading job details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {jobId ? 'Edit Job' : 'Post New Job'}
        </Text>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={styles.formContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              Job Title <Text style={{ color: theme.error }}>*</Text>
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
              placeholder="e.g. Software Developer, Marketing Manager"
              placeholderTextColor={theme.textLight}
              value={formData.title}
              onChangeText={(value) => updateFormField('title', value)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              Location <Text style={{ color: theme.error }}>*</Text>
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
              placeholder="e.g. New York, Remote"
              placeholderTextColor={theme.textLight}
              value={formData.location}
              onChangeText={(value) => updateFormField('location', value)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              Salary <Text style={{ color: theme.error }}>*</Text>
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
              placeholder="e.g. $50,000 - $70,000 per year"
              placeholderTextColor={theme.textLight}
              value={formData.salary}
              onChangeText={(value) => updateFormField('salary', value)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              Working Days <Text style={{ color: theme.error }}>*</Text>
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
              placeholder="e.g. Monday - Friday"
              placeholderTextColor={theme.textLight}
              value={formData.workingDays}
              onChangeText={(value) => updateFormField('workingDays', value)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              Working Hours <Text style={{ color: theme.error }}>*</Text>
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
              placeholder="e.g. 9:00 AM - 5:00 PM"
              placeholderTextColor={theme.textLight}
              value={formData.workingHours}
              onChangeText={(value) => updateFormField('workingHours', value)}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              Job Description <Text style={{ color: theme.error }}>*</Text>
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
              placeholder="Describe the job responsibilities, requirements, benefits, etc."
              placeholderTextColor={theme.textLight}
              value={formData.description}
              onChangeText={(value) => updateFormField('description', value)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              Contact Information
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
              placeholder="e.g. Email address or phone number"
              placeholderTextColor={theme.textLight}
              value={formData.contactInfo}
              onChangeText={(value) => updateFormField('contactInfo', value)}
            />
          </View>
          
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.primary, ...shadows.medium }
            ]}
            onPress={handleSaveJob}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.secondary} size="small" />
            ) : (
              <Text style={[styles.saveButtonText, { color: theme.secondary }]}>
                {jobId ? 'Update Job' : 'Post Job'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  formContainer: {
    flex: 1,
  },
  formContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
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
  saveButton: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PostJobScreen; 