import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { JobSeekerStackParamList } from '../../types/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';

// We're using any for navigation props since this component is used in a nested navigator
type Props = NativeStackScreenProps<any>;

interface JobSeekerProfile {
  fullName: string;
  location: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
  bio: string;
  // Formal job seeker specific fields
  resume?: string;
  certifications?: string[];
  // Informal job seeker specific fields
  availability?: string;
  preferredJobs?: string[];
}

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUserProfile } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<JobSeekerProfile>({
    fullName: '',
    location: '',
    phone: '',
    skills: [],
    experience: '',
    education: '',
    bio: '',
    resume: '',
    certifications: [],
    availability: '',
    preferredJobs: []
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [certificationsInput, setCertificationsInput] = useState('');
  const [preferredJobsInput, setPreferredJobsInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;
      
      try {
        setIsLoading(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.jobSeekerProfile) {
            setProfile(userData.jobSeekerProfile);
            
            // Initialize input fields for arrays
            if (userData.jobSeekerProfile.skills) {
              setSkillsInput(userData.jobSeekerProfile.skills.join(', '));
            }
            if (userData.jobSeekerProfile.certifications) {
              setCertificationsInput(userData.jobSeekerProfile.certifications.join(', '));
            }
            if (userData.jobSeekerProfile.preferredJobs) {
              setPreferredJobsInput(userData.jobSeekerProfile.preferredJobs.join(', '));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    
    try {
      setIsSaving(true);
      
      // Process comma-separated inputs into arrays
      const updatedProfile = {
        ...profile,
        skills: skillsInput.split(',').map(skill => skill.trim()).filter(Boolean),
        certifications: certificationsInput.split(',').map(cert => cert.trim()).filter(Boolean),
        preferredJobs: preferredJobsInput.split(',').map(job => job.trim()).filter(Boolean)
      };
      
      await updateDoc(doc(db, 'users', user.uid), {
        jobSeekerProfile: updatedProfile
      });
      
      // Update user profile in auth context
      await updateUserProfile({
        // @ts-ignore - jobSeekerProfile is handled by Firestore but not in the TypeScript interface
        jobSeekerProfile: updatedProfile
      });
      
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
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
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Edit Profile
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSaveProfile}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.secondary} />
          ) : (
            <Text style={[styles.saveButtonText, { color: theme.secondary }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/* Basic Information */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
              value={profile.fullName}
              onChangeText={(text) => setProfile({ ...profile, fullName: text })}
              placeholder="Enter your full name"
              placeholderTextColor={theme.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
              value={profile.location}
              onChangeText={(text) => setProfile({ ...profile, location: text })}
              placeholder="Enter your location"
              placeholderTextColor={theme.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
              value={profile.phone}
              onChangeText={(text) => setProfile({ ...profile, phone: text })}
              placeholder="Enter your phone number"
              placeholderTextColor={theme.textLight}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Bio</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
              value={profile.bio}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              placeholder="Tell us about yourself"
              placeholderTextColor={theme.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Skills (comma-separated)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
              value={skillsInput}
              onChangeText={setSkillsInput}
              placeholder="e.g. Communication, Teamwork, Leadership"
              placeholderTextColor={theme.textLight}
            />
          </View>

          {/* Education and Experience */}
          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Education & Experience</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Education</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
              value={profile.education}
              onChangeText={(text) => setProfile({ ...profile, education: text })}
              placeholder="Enter your educational background"
              placeholderTextColor={theme.textLight}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Experience</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
              value={profile.experience}
              onChangeText={(text) => setProfile({ ...profile, experience: text })}
              placeholder="Describe your work experience"
              placeholderTextColor={theme.textLight}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Formal Job Seeker Fields */}
          {user?.jobSeekerType === 'formal' && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Professional Details</Text>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Resume Link</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
                  value={profile.resume}
                  onChangeText={(text) => setProfile({ ...profile, resume: text })}
                  placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                  placeholderTextColor={theme.textLight}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Certifications (comma-separated)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
                  value={certificationsInput}
                  onChangeText={setCertificationsInput}
                  placeholder="e.g. Project Management, First Aid, Teaching"
                  placeholderTextColor={theme.textLight}
                />
              </View>
            </>
          )}

          {/* Informal Job Seeker Fields */}
          {user?.jobSeekerType === 'informal' && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Work Preferences</Text>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Availability</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
                  value={profile.availability}
                  onChangeText={(text) => setProfile({ ...profile, availability: text })}
                  placeholder="e.g. Weekdays, Evenings, Weekends"
                  placeholderTextColor={theme.textLight}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Preferred Jobs (comma-separated)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
                  value={preferredJobsInput}
                  onChangeText={setPreferredJobsInput}
                  placeholder="e.g. Cleaning, Gardening, Babysitting"
                  placeholderTextColor={theme.textLight}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: '600',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 100,
  },
});

export default EditProfileScreen;
