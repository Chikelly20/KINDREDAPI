import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { collection, query, where, orderBy, limit, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationsContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

type JobSeekerHomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'JobSeekerHome'>;

interface Job {
  id: string;
  title: string;
  employerName: string;
  location: string;
  salary: string;
  jobType: string;
  workingHours: string;
  description: string;
  requirements: string[];
  status: 'open' | 'closed';
  createdAt: Date;
  type: string;
}

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  jobSeekerType: string;
  skills: string[];
  experience: string;
  education: string;
  preferredJobType?: string;
  location: string;
  bio: string;
}

const JobSeekerHomeScreen: React.FC = () => {
  const navigation = useNavigation<JobSeekerHomeScreenNavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [forYouJobs, setForYouJobs] = useState<Job[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  const fetchUserProfile = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserProfile;
        setUserProfile({
          id: userDocSnap.id,
          ...userData
        });
      } else {
        console.error('User profile not found in Firestore');
        Alert.alert('Error', 'Could not find your profile. Please contact support.');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load your profile. Please check your connection and try again.');
    }
  }, [user]);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching jobs from Firestore...');
      const jobsRef = collection(db, 'jobs');
      // Remove the 'status' filter to get all jobs
      const jobsQuery = query(
        jobsRef,
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(jobsQuery);
      const jobsData: Job[] = [];

      console.log(`Found ${querySnapshot.size} jobs in Firestore`);
      
      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          console.log(`Processing job: ${doc.id}`, data);
          
          // Create a valid job object with default values for missing fields
          const job: Job = {
            id: doc.id,
            title: data.title || 'Untitled Job',
            employerName: data.employerName || 'Unknown Employer',
            location: data.location || 'Remote',
            salary: data.salary || 'Competitive',
            jobType: data.jobType || 'Full-time',
            workingHours: data.workingHours || 'Standard hours',
            description: data.description || 'No description provided',
            requirements: Array.isArray(data.requirements) ? data.requirements : ['No requirements specified'],
            status: data.status || 'open',
            createdAt: data.createdAt instanceof Date ? data.createdAt : new Date((data.createdAt as any)?.seconds ? (data.createdAt as any).seconds * 1000 : Date.now()),
            type: data.type || data.jobType || 'Full-time'
          };
          
          jobsData.push(job);
        } catch (docError) {
          console.error(`Error processing job document ${doc.id}:`, docError);
        }
      });

      console.log(`Successfully processed ${jobsData.length} jobs`);
      setRecentJobs(jobsData);

      // Find matching jobs for the user profile
      if (userProfile) {
        const matchingJobs = findMatchingJobs(userProfile, jobsData);
        console.log(`Found ${matchingJobs.length} matching jobs for user`);
        setForYouJobs(matchingJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      Alert.alert('Error', 'Failed to load job listings. Please check your connection and try again.');
      setRecentJobs([]);
      setForYouJobs([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userProfile]);

  const findMatchingJobs = (profile: UserProfile, jobs: Job[]): Job[] => {
    if (!profile) return jobs.slice(0, 5);
    console.log('Finding matching jobs for profile:', profile.id);
    console.log('Total jobs to filter:', jobs.length);
    
    // Sort jobs by creation date (newest first)
    const sortedJobs = [...jobs].sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    // Take the 5 most recent jobs
    const recentJobs = sortedJobs.slice(0, 5);
    console.log(`Selected ${recentJobs.length} most recent jobs for For You section`);
    
    return recentJobs;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setIsSearching(false);
      setFilteredJobs([]);
      return;
    }

    setIsSearching(true);
    const lowerCaseQuery = query.toLowerCase();
    const filtered = recentJobs.filter(job => {
      return (
        job.title.toLowerCase().includes(lowerCaseQuery) ||
        job.employerName.toLowerCase().includes(lowerCaseQuery) ||
        job.location.toLowerCase().includes(lowerCaseQuery) ||
        job.jobType.toLowerCase().includes(lowerCaseQuery)
      );
    });
    setFilteredJobs(filtered);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserProfile();
    await fetchJobs();
    setIsRefreshing(false);
  };

  const handleSelectJobType = () => {
    navigation.navigate('JobType');
  };

  const handleViewJobDetails = (jobId: string) => {
    navigation.navigate('JobDetails', { jobId });
  };

  const handleApplyToJob = (jobId: string) => {
    navigation.navigate('JobDetails', { jobId });
    // Note: JobApplication screen would be navigated to from JobDetails when implemented
  };

  // Helper function to format time since job posting
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  };

  const renderJobItem = ({ item }: { item: Job }) => {
    return (
      <View style={[styles.cardWrapper, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity 
          style={styles.forYouCard} 
          onPress={() => handleViewJobDetails(item.id)}
        >
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobCompany}>{item.employerName}</Text>
            <View style={styles.jobInfoRow}>
              <Text style={styles.jobLocation}>
                <MaterialIcons name="location-on" size={16} color={theme.primary} /> {item.location}
              </Text>
              <Text style={styles.jobTime}>
                <MaterialIcons name="access-time" size={14} color="#757575" /> {getTimeAgo(item.createdAt)}
              </Text>
            </View>
          </View>
          
          <View style={styles.jobFooter}>
            <Text style={styles.jobSalary}>{item.salary}</Text>
            <TouchableOpacity 
              style={[styles.jobTypeButton, { backgroundColor: theme.primary }]}
              onPress={() => handleApplyToJob(item.id)}
            >
              <Text style={[styles.jobTypeText, { color: theme.secondary }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderForYouJobItem = ({ item }: { item: Job }) => {
    return (
      <TouchableOpacity 
        style={[styles.forYouCardHorizontal, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        onPress={() => handleViewJobDetails(item.id)}
      >
        <View style={styles.forYouJobHeader}>
          <Text style={styles.forYouJobTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.forYouJobCompany} numberOfLines={1}>{item.employerName}</Text>
          <View style={styles.forYouJobInfoRow}>
            <Text style={styles.forYouJobLocation} numberOfLines={1}>
              <MaterialIcons name="location-on" size={14} color={theme.primary} /> {item.location}
            </Text>
            <Text style={styles.forYouJobTime} numberOfLines={1}>
              <MaterialIcons name="access-time" size={12} color="#757575" /> {getTimeAgo(item.createdAt)}
            </Text>
          </View>
        </View>
        <View style={styles.forYouJobFooter}>
          <Text style={styles.forYouJobSalary} numberOfLines={1}>{item.salary}</Text>
          <TouchableOpacity 
            style={[styles.forYouJobTypeButton, { backgroundColor: theme.primary }]}
            onPress={() => handleApplyToJob(item.id)}
          >
            <Text style={[styles.forYouJobTypeText, { color: theme.secondary }]}>Apply</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    fetchUserProfile();
    fetchJobs();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={[styles.header, { backgroundColor: '#FFFFFF' }]}>
          <View style={styles.profileSection}>
            {userProfile?.photoURL ? (
              <Image 
                source={{ uri: userProfile.photoURL }} 
                style={styles.profilePicture} 
              />
            ) : (
              <View style={[styles.profilePicture, { backgroundColor: theme.primary }]}>
                <Text style={styles.profileInitial}>
                  {userProfile?.displayName?.[0] || 'U'}
                </Text>
              </View>
            )}
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.userName}>
                {userProfile?.displayName || 'User'}
              </Text>
              <Text style={styles.profileType}>
                {userProfile?.jobSeekerType || 'Job Seeker'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationIcon}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={theme.primary} />
              {unreadCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { borderWidth: 1, borderColor: '#E0E0E0' }]}>
              <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search jobs..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
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
            {isSearching ? (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Search Results</Text>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map(job => renderJobItem({ item: job }))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No jobs found matching "{searchQuery}"</Text>
                  </View>
                )}
              </View>
            ) : (
              <>
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>FOR YOU</Text>
                  {forYouJobs.length > 0 ? (
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={forYouJobs}
                      renderItem={renderForYouJobItem}
                      keyExtractor={(item, index) => `for-you-${item.id}-${index}`}
                      contentContainerStyle={styles.forYouListContainer}
                      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                    />
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No personalized jobs found</Text>
                    </View>
                  )}
                </View>

                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>RECENT JOBS</Text>
                  {recentJobs.length > 0 ? (
                    recentJobs.map((job, index) => (
                      <React.Fragment key={`recent-${job.id}-${index}`}>
                        {renderJobItem({ item: job })}
                      </React.Fragment>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No recent jobs found</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  },
  header: {
    padding: 16
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000'
  },
  profileType: {
    fontSize: 14,
    color: '#757575',
    opacity: 0.8
  },
  profileDetail: {
    fontSize: 14,
    color: '#757575',
    opacity: 0.7
  },
  notificationIcon: {
    marginLeft: 16,
    position: 'relative'
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  searchContainer: {
    marginTop: 8
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000'
  },
  contentContainer: {
    flex: 1,
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionContainer: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
    color: '#000000',
    letterSpacing: 0.5
  },
  cardWrapper: {
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden'
  },
  forYouCard: {
    padding: 16
  },
  jobHeader: {
    marginBottom: 12
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000000'
  },
  jobCompany: {
    fontSize: 16,
    marginBottom: 4,
    color: '#000000'
  },
  jobInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2
  },
  jobLocation: {
    fontSize: 14,
    color: '#757575',
    flex: 1
  },
  jobTime: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 8
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  jobSalary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#541484'
  },
  jobTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#541484'
  },
  jobTypeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center'
  },
  forYouListContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  forYouCardHorizontal: {
    width: 250,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4
  },
  forYouJobHeader: {
    marginBottom: 8
  },
  forYouJobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#000000'
  },
  forYouJobCompany: {
    fontSize: 14,
    marginBottom: 2,
    color: '#000000'
  },
  forYouJobInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2
  },
  forYouJobLocation: {
    fontSize: 12,
    color: '#757575',
    flex: 1
  },
  forYouJobTime: {
    fontSize: 10,
    color: '#757575'
  },
  forYouJobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  forYouJobSalary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#541484',
    flex: 1
  },
  forYouJobTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#541484'
  },
  forYouJobTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
});

export default JobSeekerHomeScreen;
