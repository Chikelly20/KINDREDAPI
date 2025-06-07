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
import { findMatchingJobs } from '../../utils/jobMatching';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationsContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

type JobSeekerHomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'JobSeekerHome'>;

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Job {
  id: string;
  title: string;
  employerName: string;
  location: string;
  coordinates?: Coordinates;
  salary: string;
  jobType: string;
  workingHours: string;
  description: string;
  requirements: string[];
  status: 'open' | 'closed';
  createdAt: Date;
  type: string;
  distance?: number; // Distance in kilometers from user's location
}

interface UserProfile {
  id: string;
  displayName?: string; // From auth
  email?: string; // From auth
  photoURL?: string; // From auth
  jobSeekerType?: 'formal' | 'informal'; // From root of user doc

  // Fields from jobSeekerProfile (EditProfileScreen data)
  fullName?: string;
  location?: string;
  phone?: string;
  skills?: string[]; // Primary skills array
  experience?: string; // Primary experience text
  education?: string; // Primary education text
  bio?: string;
  resume?: string;
  certifications?: string[]; // Certifications as an array
  availability?: string;
  preferredJobs?: string[]; // Preferred job titles/types as an array
  interests?: string; // If collected in jobSeekerProfile
  expectedSalary?: string; // If collected
  preferredWorkingHours?: string; // If collected

  // Fields from formalQuestionnaire
  formal_jobSeeking?: string;
  formal_previousRoles?: string;
  formal_qualifications?: string;
  formal_languages?: string;
  formal_references?: string;

  // Fields from informalQuestionnaire
  informal_jobSeeking?: string;
  informal_workExperience?: string;

  profileCompleted?: boolean;
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
  const [proximityFilter, setProximityFilter] = useState<number | null>(null);
  const [showProximityFilter, setShowProximityFilter] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const docData = userDocSnap.data(); // Raw data from Firestore

        const mergedProfile: UserProfile = {
          id: userDocSnap.id,
          displayName: user?.displayName || docData.displayName,
          email: user?.email || docData.email,
          photoURL: user?.photoURL || docData.photoURL,
          jobSeekerType: docData.jobSeekerType,
          profileCompleted: docData.profileCompleted,

          // From jobSeekerProfile, with fallbacks or defaults
          fullName: docData.jobSeekerProfile?.fullName || user?.displayName || '',
          location: docData.jobSeekerProfile?.location || '',
          phone: docData.jobSeekerProfile?.phone || '',
          skills: docData.jobSeekerProfile?.skills || [],
          experience: docData.jobSeekerProfile?.experience || '',
          education: docData.jobSeekerProfile?.education || '',
          bio: docData.jobSeekerProfile?.bio || '',
          resume: docData.jobSeekerProfile?.resume,
          certifications: docData.jobSeekerProfile?.certifications || [],
          availability: docData.jobSeekerProfile?.availability,
          preferredJobs: docData.jobSeekerProfile?.preferredJobs || [],
          interests: docData.jobSeekerProfile?.interests,
          expectedSalary: docData.jobSeekerProfile?.expectedSalary,
          preferredWorkingHours: docData.jobSeekerProfile?.preferredWorkingHours,

          // From formalQuestionnaire
          formal_jobSeeking: docData.formalQuestionnaire?.jobSeeking,
          formal_previousRoles: docData.formalQuestionnaire?.previousRoles,
          formal_qualifications: docData.formalQuestionnaire?.qualifications,
          formal_languages: docData.formalQuestionnaire?.languages,
          formal_references: docData.formalQuestionnaire?.references,

          // From informalQuestionnaire
          informal_jobSeeking: docData.informalQuestionnaire?.jobSeeking,
          informal_workExperience: docData.informalQuestionnaire?.workExperience,
        };
        
        setUserProfile(mergedProfile);
        
        // Geocoding logic (uses mergedProfile.location)
        if (mergedProfile.location) {
          try {
            const coordinates = await geocodeLocation(mergedProfile.location);
            if (coordinates) {
              setUserCoordinates(coordinates);
              console.log('User coordinates set based on merged profile:', coordinates);
            }
          } catch (geocodeError) {
            console.error('Error geocoding user location:', geocodeError);
          }
        }
      } else {
        console.error('User profile not found in Firestore');
        Alert.alert('Error', 'Could not find your profile. Please contact support.');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load your profile. Please check your connection and try again.');
    }
  }, [user]);
  
  // Mock geocoding function - in production, use a real geocoding API
  const geocodeLocation = async (location: string): Promise<Coordinates | null> => {
    // This is a mock implementation with some common locations
    const geocodingMock: Record<string, Coordinates> = {
      'london': { latitude: 51.5074, longitude: -0.1278 },
      'manchester': { latitude: 53.4808, longitude: -2.2426 },
      'birmingham': { latitude: 52.4862, longitude: -1.8904 },
      'leeds': { latitude: 53.8008, longitude: -1.5491 },
      'liverpool': { latitude: 53.4084, longitude: -2.9916 },
      'newcastle': { latitude: 54.9783, longitude: -1.6178 },
      'sheffield': { latitude: 53.3811, longitude: -1.4701 },
      'bristol': { latitude: 51.4545, longitude: -2.5879 },
      'cardiff': { latitude: 51.4816, longitude: -3.1791 },
      'edinburgh': { latitude: 55.9533, longitude: -3.1883 },
      'glasgow': { latitude: 55.8642, longitude: -4.2518 },
      'belfast': { latitude: 54.5973, longitude: -5.9301 },
      'dublin': { latitude: 53.3498, longitude: -6.2603 },
    };
    
    // Normalize the location for lookup
    const normalizedLocation = location.toLowerCase().trim();
    
    // Check for exact matches
    if (geocodingMock[normalizedLocation]) {
      return geocodingMock[normalizedLocation];
    }
    
    // Check for partial matches
    for (const [key, coords] of Object.entries(geocodingMock)) {
      if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
        return coords;
      }
    }
    
    // No match found
    console.log(`Could not geocode location: ${location}`);
    return null;
  };

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
            coordinates: data.coordinates || null,
            salary: data.salary || 'Competitive',
            jobType: data.jobType || 'Full-time',
            workingHours: data.workingHours || 'Standard hours',
            description: data.description || 'No description provided',
            requirements: Array.isArray(data.requirements) ? data.requirements : ['No requirements specified'],
            status: data.status || 'open',
            createdAt: data.createdAt instanceof Date ? data.createdAt : new Date((data.createdAt as any)?.seconds ? (data.createdAt as any).seconds * 1000 : Date.now()),
            type: data.type || data.jobType || 'Full-time'
          };
          
          // If job has location but no coordinates, try to geocode it
          if (job.location && !job.coordinates) {
            geocodeLocation(job.location).then(coords => {
              if (coords) {
                job.coordinates = coords;
                
                // Calculate distance if user coordinates are available
                if (userCoordinates) {
                  job.distance = calculateDistance(userCoordinates, coords);
                }
              }
            }).catch(err => {
              console.error(`Error geocoding job location for ${job.id}:`, err);
            });
          } else if (job.coordinates && userCoordinates) {
            // Calculate distance if both coordinates are available
            job.distance = calculateDistance(userCoordinates, job.coordinates);
          }
          
          jobsData.push(job);
        } catch (docError) {
          console.error(`Error processing job document ${doc.id}:`, docError);
        }
      });

      console.log(`Successfully processed ${jobsData.length} jobs. Raw jobsData:`, JSON.stringify(jobsData.slice(0, 2), null, 2)); // Log first 2 jobs for brevity
      setRecentJobs(jobsData);

      // Find matching jobs for the user profile
      if (userProfile) {
        console.log('Current userProfile state before creating profileForMatching:', JSON.stringify(userProfile, null, 2));
        // Prepare the profile object for findMatchingJobs
        const profileForMatching: any = {
          // Pass direct skills if available; findMatchingJobs will extract from other fields if this is undefined or empty
          skills: (userProfile.skills && userProfile.skills.length > 0) ? userProfile.skills : undefined,
          
          // Fields for skill extraction (if skills above are undefined/empty) and potentially direct use
          jobSeeking: userProfile.jobSeekerType === 'formal' 
            ? userProfile.formal_jobSeeking 
            : userProfile.informal_jobSeeking,
          experience: userProfile.experience || (userProfile.jobSeekerType === 'formal' 
            ? userProfile.formal_previousRoles 
            : userProfile.informal_workExperience),
          education: userProfile.education || userProfile.formal_qualifications,
          // findMatchingJobs expects certifications as a string for skill extraction
          certifications: userProfile.certifications?.join(', ') || undefined, 
          interests: userProfile.interests,

          // Fields for hard filters
          preferredLocation: userProfile.location,
          // findMatchingJobs expects a single string for preferredJobType (fallback to jobSeekerType if preferredJobs is empty)
          preferredJobType: userProfile.preferredJobs?.[0] || userProfile.jobSeekerType, 

          // Fields for scoring
          expectedSalary: userProfile.expectedSalary,
          preferredWorkingHours: userProfile.preferredWorkingHours,
          
          // Pass any other top-level fields from userProfile that findMatchingJobs might expect
          // For example, if findMatchingJobs uses userProfile.displayName directly:
          // displayName: userProfile.displayName,
        };

        const matchingJobs = findMatchingJobs(profileForMatching, jobsData);
        // Log the profile that was actually sent to matching function for easier debugging
        console.log(`PROFILE SENT TO findMatchingJobs:`, JSON.stringify(profileForMatching, null, 2));
        console.log(`JOBS SENT TO findMatchingJobs (${jobsData.length} jobs):`, JSON.stringify(jobsData.slice(0,2), null, 2)); // Log first 2 jobs
        console.log(`MATCHING JOBS RETURNED by findMatchingJobs (${matchingJobs.length} jobs):`, JSON.stringify(matchingJobs.slice(0,2), null, 2)); // Log first 2 matched jobs
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
  }, [userProfile, userCoordinates]);
  
  // Calculate distance between two coordinates using the Haversine formula
  const calculateDistance = (point1: Coordinates, point2: Coordinates): number => {
    const R = 6371; // Earth's radius in kilometers
    
    // Convert latitude and longitude from degrees to radians
    const lat1Rad = (point1.latitude * Math.PI) / 180;
    const lon1Rad = (point1.longitude * Math.PI) / 180;
    const lat2Rad = (point2.latitude * Math.PI) / 180;
    const lon2Rad = (point2.longitude * Math.PI) / 180;
    
    // Haversine formula
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  };

  // Use advanced matching from utils/jobMatching
  // import { findMatchingJobs } from '../../utils/jobMatching';
  // (import statement will be added at the top)
  // The new findMatchingJobs is imported and used below.


  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setIsSearching(false);
      setFilteredJobs([]);
      return;
    }

    setIsSearching(true);
    const lowerCaseQuery = query.toLowerCase();
    let filtered = recentJobs.filter(job => {
      return (
        job.title.toLowerCase().includes(lowerCaseQuery) ||
        job.employerName.toLowerCase().includes(lowerCaseQuery) ||
        job.location.toLowerCase().includes(lowerCaseQuery) ||
        job.jobType.toLowerCase().includes(lowerCaseQuery)
      );
    });
    
    // Apply proximity filter if active
    if (proximityFilter !== null && userCoordinates) {
      filtered = filtered.filter(job => {
        return job.distance !== undefined && job.distance <= proximityFilter;
      });
    }
    
    setFilteredJobs(filtered);
  };
  
  const toggleProximityFilter = () => {
    setShowProximityFilter(!showProximityFilter);
  };
  
  const applyProximityFilter = (distance: number | null) => {
    setProximityFilter(distance);
    
    // If we're already searching, reapply the search with the new filter
    if (isSearching && searchQuery.trim() !== '') {
      handleSearch(searchQuery);
    } else if (distance !== null && userCoordinates) {
      // If we're not searching but have a proximity filter, show all jobs within that distance
      setIsSearching(true);
      const filtered = recentJobs.filter(job => {
        return job.distance !== undefined && job.distance <= distance;
      });
      setFilteredJobs(filtered);
    } else {
      // If proximity filter is cleared and we're not searching, exit search mode
      setIsSearching(false);
      setFilteredJobs([]);
    }
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
              <TouchableOpacity onPress={toggleProximityFilter} style={styles.filterButton}>
                <MaterialIcons 
                  name="filter-list" 
                  size={24} 
                  color={proximityFilter !== null ? theme.primary : theme.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            
            {showProximityFilter && (
              <View style={styles.proximityFilterContainer}>
                <Text style={styles.proximityFilterTitle}>Filter by distance:</Text>
                <View style={styles.proximityButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.proximityButton, proximityFilter === 5 ? { backgroundColor: theme.primary } : {}]}
                    onPress={() => applyProximityFilter(5)}
                  >
                    <Text style={[styles.proximityButtonText, proximityFilter === 5 ? { color: 'white' } : {}]}>5 km</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.proximityButton, proximityFilter === 10 ? { backgroundColor: theme.primary } : {}]}
                    onPress={() => applyProximityFilter(10)}
                  >
                    <Text style={[styles.proximityButtonText, proximityFilter === 10 ? { color: 'white' } : {}]}>10 km</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.proximityButton, proximityFilter === 25 ? { backgroundColor: theme.primary } : {}]}
                    onPress={() => applyProximityFilter(25)}
                  >
                    <Text style={[styles.proximityButtonText, proximityFilter === 25 ? { color: 'white' } : {}]}>25 km</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.proximityButton, proximityFilter === 50 ? { backgroundColor: theme.primary } : {}]}
                    onPress={() => applyProximityFilter(50)}
                  >
                    <Text style={[styles.proximityButtonText, proximityFilter === 50 ? { color: 'white' } : {}]}>50 km</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.proximityButton, { borderColor: theme.border }]}
                    onPress={() => applyProximityFilter(null)}
                  >
                    <Text style={styles.proximityButtonText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {!userCoordinates && (
                  <Text style={styles.proximityWarning}>
                    Unable to determine your location. Please update your profile with a valid location.
                  </Text>
                )}
              </View>
            )}
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
                <Text style={styles.sectionTitle}>
                  {proximityFilter !== null ? 
                    `Jobs within ${proximityFilter} km${searchQuery ? ` matching "${searchQuery}"` : ''}` : 
                    `Search Results for "${searchQuery}"`
                  }
                </Text>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map(job => (
                    <View key={job.id}>
                      {renderJobItem({ item: job })}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {proximityFilter !== null ? 
                        `No jobs found within ${proximityFilter} km${searchQuery ? ` matching "${searchQuery}"` : ''}` : 
                        `No jobs found matching "${searchQuery}"`
                      }
                    </Text>
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
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333333',
  },
  filterButton: {
    padding: 5,
  },
  proximityFilterContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  proximityFilterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  proximityButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  proximityButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  proximityButtonText: {
    fontSize: 12,
    color: '#333333',
  },
  proximityWarning: {
    fontSize: 12,
    color: 'red',
    marginTop: 8,
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
    width: 280,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 180
  },
  forYouJobHeader: {
    marginBottom: 12
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
