import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { EmployerStackParamList } from '../../types/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<EmployerStackParamList, 'Profile'>;

interface EmployerProfile {
  companyName: string;
  industry: string;
  location: string;
  about: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUserProfile } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<EmployerProfile>({
    companyName: '',
    industry: '',
    location: '',
    about: '',
    website: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;
      
      try {
        setIsLoading(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.employerProfile) {
            setProfile(userData.employerProfile);
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
      
      await updateDoc(doc(db, 'users', user.uid), {
        employerProfile: profile
      });
      
      // Use type assertion to avoid TypeScript errors
      await updateUserProfile({
        // @ts-ignore - employerProfile is handled by Firestore but not in the TypeScript interface
        employerProfile: profile
      });
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Company Profile</Text>
          
          {!isEditing ? (
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.primary }]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={[styles.editButtonText, { color: theme.secondary }]}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.primary }]}
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={theme.secondary} />
              ) : (
                <Text style={[styles.editButtonText, { color: theme.secondary }]}>Save</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        
        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.profileImageContainer}>
            <View style={[styles.profileImage, { backgroundColor: theme.primary }]}>
              <Text style={[styles.profileInitial, { color: theme.secondary }]}>
                {profile.companyName ? profile.companyName[0]?.toUpperCase() : 'C'}
              </Text>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            {isEditing ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Company Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
                    value={profile.companyName}
                    onChangeText={(text) => setProfile({ ...profile, companyName: text })}
                    placeholder="Enter company name"
                    placeholderTextColor={theme.textLight}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Industry</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
                    value={profile.industry}
                    onChangeText={(text) => setProfile({ ...profile, industry: text })}
                    placeholder="Enter industry"
                    placeholderTextColor={theme.textLight}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Location</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
                    value={profile.location}
                    onChangeText={(text) => setProfile({ ...profile, location: text })}
                    placeholder="Enter location"
                    placeholderTextColor={theme.textLight}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>About</Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
                    value={profile.about}
                    onChangeText={(text) => setProfile({ ...profile, about: text })}
                    placeholder="Tell us about your company"
                    placeholderTextColor={theme.textLight}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Website</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
                    value={profile.website}
                    onChangeText={(text) => setProfile({ ...profile, website: text })}
                    placeholder="Enter website URL"
                    placeholderTextColor={theme.textLight}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Contact Email</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
                    value={profile.contactEmail}
                    onChangeText={(text) => setProfile({ ...profile, contactEmail: text })}
                    placeholder="Enter contact email"
                    placeholderTextColor={theme.textLight}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Contact Phone</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.secondary, color: theme.text, borderColor: theme.border }]}
                    value={profile.contactPhone}
                    onChangeText={(text) => setProfile({ ...profile, contactPhone: text })}
                    placeholder="Enter contact phone"
                    placeholderTextColor={theme.textLight}
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.companyName, { color: theme.text }]}>
                  {profile.companyName || 'Your Company'}
                </Text>
                
                {profile.industry && (
                  <View style={styles.infoRow}>
                    <Ionicons name="business-outline" size={18} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.text }]}>{profile.industry}</Text>
                  </View>
                )}
                
                {profile.location && (
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={18} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.text }]}>{profile.location}</Text>
                  </View>
                )}
                
                {profile.website && (
                  <View style={styles.infoRow}>
                    <Ionicons name="globe-outline" size={18} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.text }]}>{profile.website}</Text>
                  </View>
                )}
                
                {profile.contactEmail && (
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={18} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.text }]}>{profile.contactEmail}</Text>
                  </View>
                )}
                
                {profile.contactPhone && (
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={18} color={theme.primary} />
                    <Text style={[styles.infoText, { color: theme.text }]}>{profile.contactPhone}</Text>
                  </View>
                )}
                
                {profile.about && (
                  <View style={styles.aboutSection}>
                    <Text style={[styles.aboutTitle, { color: theme.text }]}>About</Text>
                    <Text style={[styles.aboutText, { color: theme.text }]}>{profile.about}</Text>
                  </View>
                )}
              </>
            )}
          </View>
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
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontWeight: '600',
  },
  profileCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginTop: 8,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
  },
  aboutSection: {
    marginTop: 16,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    minHeight: 120,
  },
});

export default ProfileScreen;
