import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { EmployerStackParamList } from '../../navigation';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, limit, getDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';

type Props = NativeStackScreenProps<EmployerStackParamList, 'JobSeekerProfileView'>;

interface JobSeekerProfile {
  id: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  experience?: string;
  education?: string;
}

const JobSeekerProfileView: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params || {};
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // First try to get the complete user profile from the users collection
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Create a complete profile with all available information
            setProfile({
              id: userId,
              displayName: userData.displayName || 'Job Seeker',
              photoURL: userData.photoURL,
              bio: userData.bio || 'No bio provided',
              skills: userData.skills || [],
              location: userData.location || 'Location not provided',
              experience: userData.experience || 'Experience not provided',
              education: userData.education || 'Education not provided'
            });
            
            setLoading(false);
            return;
          }
        } catch (userError) {
          console.warn('Error fetching from users collection:', userError);
          // Continue to fallback approach
        }
        
        // If we couldn't get the user profile, try to get basic info from chats
        try {
          const chatsRef = collection(db, 'chats');
          const chatsQuery = query(chatsRef, where('jobSeekerId', '==', userId), limit(1));
          const chatsSnapshot = await getDocs(chatsQuery);
          
          if (!chatsSnapshot.empty) {
            const chatDoc = chatsSnapshot.docs[0];
            const chatData = chatDoc.data();
            
            // Create a basic profile with the information from chat
            setProfile({
              id: userId,
              displayName: chatData.jobSeekerName || 'Job Seeker',
              bio: 'This job seeker has applied to your job posting.',
              skills: ['Interested in your job posting'],
              location: 'Location information not available',
              experience: 'Experience information not available',
              education: 'Education information not available'
            });
            
            setLoading(false);
            return;
          }
        } catch (chatError) {
          console.warn('Error fetching from chats collection:', chatError);
          // Continue to fallback approach
        }
        
        // Fallback profile if nothing else works
        setProfile({
          id: userId,
          displayName: 'Job Seeker',
          bio: 'No additional information available for this job seeker.',
          skills: ['Applied to your job posting'],
          location: 'Location information not available',
          experience: 'Experience information not available',
          education: 'Education information not available'
        });
      } catch (err) {
        console.error('Error loading job seeker profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const handleContactJobSeeker = () => {
    // Navigate to the chat screen with this job seeker
    if (userId) {
      navigation.navigate('Chat', { applicantId: userId, jobId: '' });
    } else {
      Alert.alert('Error', 'Unable to start chat. User ID is missing.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Job Seeker Profile
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Job Seeker Profile
          </Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            {error || 'Failed to load profile'}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.retryButtonText, { color: theme.secondary }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // At this point we know profile is defined
  const profileData = profile;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Job Seeker Profile
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileHeader}>
          {profileData.photoURL ? (
            <Image
              source={{ uri: profileData.photoURL }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.primary }]}>
              <Text style={[styles.profileImagePlaceholderText, { color: theme.secondary }]}>
                {(profileData.displayName || 'User').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>
              {profileData.displayName || 'Job Seeker'}
            </Text>
            {profileData.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color={theme.textLight} />
                <Text style={[styles.locationText, { color: theme.textLight }]}>
                  {profileData.location}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {profileData.bio && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
            <Text style={[styles.bioText, { color: theme.text }]}>{profileData.bio}</Text>
          </View>
        )}
        
        {profileData.skills && profileData.skills.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Skills</Text>
            <View style={styles.skillsContainer}>
              {profileData.skills.map((skill, index) => (
                <View
                  key={index}
                  style={[styles.skillBadge, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
                >
                  <Text style={[styles.skillText, { color: theme.primary }]}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {profileData.experience && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Experience</Text>
            <Text style={[styles.sectionText, { color: theme.text }]}>{profileData.experience}</Text>
          </View>
        )}
        
        {profileData.education && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Education</Text>
            <Text style={[styles.sectionText, { color: theme.text }]}>{profileData.education}</Text>
          </View>
        )}
        
        <View style={styles.contactContainer}>
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: theme.primary }]}
            onPress={handleContactJobSeeker}
          >
            <Ionicons name="chatbubble" size={20} color={theme.secondary} />
            <Text style={[styles.contactButtonText, { color: theme.secondary }]}>
              Message Job Seeker
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  contactContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JobSeekerProfileView;
