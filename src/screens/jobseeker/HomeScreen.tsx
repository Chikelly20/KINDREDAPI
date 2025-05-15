import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { JobSeekerStackParamList } from '../../types/navigation';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<JobSeekerStackParamList, 'Home'>;

interface JobPost {
  id: string;
  title: string;
  employerId: string;
  employerName: string;
  location: string;
  salary: string;
  workingDays: string;
  workingHours: string;
  description: string;
  createdAt: string;
  contactInfo: string;
}

const JobSeekerHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [forYouJobs, setForYouJobs] = useState<JobPost[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobPost[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileType, setProfileType] = useState<'formal' | 'informal' | null>(null);

  const fetchUserProfile = async () => {
    if (!user?.uid) return;
    
    try {
      // Fetch user profile data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check which questionnaire the user has completed
        if (userData.formalQuestionnaire) {
          setProfileType('formal');
          setProfileData(userData.formalQuestionnaire);
        } else if (userData.informalQuestionnaire) {
          setProfileType('informal');
          setProfileData(userData.informalQuestionnaire);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all job posts
      const jobsRef = collection(db, 'jobs');
      const recentJobsQuery = query(
        jobsRef, 
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(recentJobsQuery);
      const fetchedJobs: JobPost[] = [];
      
      querySnapshot.forEach((doc) => {
        fetchedJobs.push({
          id: doc.id,
          ...doc.data() as Omit<JobPost, 'id'>
        });
      });
      
      // For demonstration purposes, we're showing the same jobs in both sections
      // In a real app, you would implement the skill-based matching here
      setForYouJobs(fetchedJobs.slice(0, 5));
      setRecentJobs(fetchedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      Alert.alert('Error', 'Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchJobs();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUserProfile();
    fetchJobs();
  };

  const handleSearch = () => {
    // Implement search functionality
    Alert.alert('Search', `Searching for: ${searchQuery}`);
  };

  const handleApplyJob = (jobId: string, employerId: string) => {
    navigation.navigate('Chat', { jobId, employerId });
  };

  const renderForYouItem = ({ item }: { item: JobPost }) => (
    <View 
      style={[
        styles.forYouCard, 
        { 
          backgroundColor: theme.secondary,
          borderColor: theme.border,
          
        }
      ]}
    >
      <View style={styles.jobHeader}>
        <Text style={[styles.jobTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.employerName, { color: theme.text }]}>
          {item.employerName}
        </Text>
      </View>
      
      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={theme.primary} />
          <Text style={[styles.detailText, { color: theme.text }]}>{item.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color={theme.primary} />
          <Text style={[styles.detailText, { color: theme.text }]}>{item.salary}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.primary} />
          <Text style={[styles.detailText, { color: theme.text }]}>{item.workingDays}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={theme.primary} />
          <Text style={[styles.detailText, { color: theme.text }]}>{item.workingHours}</Text>
        </View>
      </View>
      
      <Text style={[styles.jobDescription, { color: theme.text }]} numberOfLines={2}>
        {item.description}
      </Text>
      
      <TouchableOpacity
        style={[styles.applyButton, { backgroundColor: theme.primary }]}
        onPress={() => handleApplyJob(item.id, item.employerId)}
      >
        <Text style={[styles.applyButtonText, { color: theme.secondary }]}>Apply</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecentJobItem = ({ item }: { item: JobPost }) => (
    <View 
      style={[
        styles.recentJobCard, 
        { 
          backgroundColor: theme.secondary,
          borderColor: theme.border,
          
        }
      ]}
    >
      <View style={styles.recentJobHeader}>
        <View>
          <Text style={[styles.jobTitle, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.employerName, { color: theme.text }]}>
            {item.employerName}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.smallApplyButton, { backgroundColor: theme.primary }]}
          onPress={() => handleApplyJob(item.id, item.employerId)}
        >
          <Text style={[styles.smallApplyButtonText, { color: theme.secondary }]}>Apply</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.recentJobDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={theme.primary} />
          <Text style={[styles.detailText, { color: theme.text, fontSize: 14 }]}>{item.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={14} color={theme.primary} />
          <Text style={[styles.detailText, { color: theme.text, fontSize: 14 }]}>{item.salary}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View 
            style={[
              styles.profilePicture, 
              { backgroundColor: theme.primary, borderColor: theme.secondary }
            ]}
          >
            <Text style={[styles.profileInitial, { color: theme.secondary }]}>
              {user?.displayName?.charAt(0) || 'U'}
            </Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.displayName || 'User'}
            </Text>
            {profileType && (
              <Text style={[styles.profileType, { color: theme.text }]}>
                {profileType === 'formal' ? 'Professional Job Seeker' : 'Casual Job Seeker'}
              </Text>
            )}
            {profileData && profileType === 'formal' && (
              <Text style={[styles.profileDetail, { color: theme.text }]}>
                {profileData.jobSeeking}
              </Text>
            )}
            {profileData && profileType === 'informal' && (
              <Text style={[styles.profileDetail, { color: theme.text }]}>
                {profileData.jobSeeking}
              </Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.notificationIcon, { backgroundColor: theme.secondary,  }]}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View 
          style={[
            styles.searchBar, 
            { backgroundColor: theme.secondary, borderColor: theme.border }
          ]}
        >
          <Ionicons name="search-outline" size={20} color={theme.text} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search for jobs..."
            placeholderTextColor={theme.text}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>For You</Text>
            <FlatList
              data={forYouJobs}
              renderItem={renderForYouItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.forYouList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.text }]}>
                    No jobs found matching your profile.
                  </Text>
                </View>
              }
            />
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Jobs</Text>
            <FlatList
              data={recentJobs}
              renderItem={renderRecentJobItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.text }]}>
                    No recent jobs available.
                  </Text>
                </View>
              }
            />
          </View>
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  profileType: {
    fontSize: 14,
    marginLeft: 12,
    fontStyle: 'italic',
  },
  profileDetail: {
    fontSize: 12,
    marginLeft: 12,
    marginTop: 2,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 16,
  },
  forYouList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  forYouCard: {
    width: 300,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
  },
  jobHeader: {
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  employerName: {
    fontSize: 14,
  },
  jobDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  applyButton: {
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  recentJobCard: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  recentJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recentJobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallApplyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  smallApplyButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default JobSeekerHomeScreen; 