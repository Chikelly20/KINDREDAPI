import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { EmployerStackParamList } from '../../types/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<EmployerStackParamList, 'Home'>;

interface JobPost {
  id: string;
  title: string;
  location: string;
  salary: string;
  workingDays: string;
  workingHours: string;
  description: string;
  createdAt: string;
  applicantsCount: number;
}

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantName: string;
  createdAt: string;
  lastMessage: string;
  lastMessageAt: string;
}

const EmployerHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [myJobs, setMyJobs] = useState<JobPost[]>([]);
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);

  const fetchData = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      
      // Fetch jobs posted by the employer
      const jobsRef = collection(db, 'jobs');
      let fetchedJobs: JobPost[] = [];
      
      try {
        // Try the compound query first (requires index)
        const jobsQuery = query(
          jobsRef, 
          where('employerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const jobsSnapshot = await getDocs(jobsQuery);
        
        jobsSnapshot.forEach((doc) => {
          fetchedJobs.push({
            id: doc.id,
            ...doc.data() as Omit<JobPost, 'id'>
          });
        });
      } catch (indexError) {
        console.log('Index error, using fallback query:', indexError);
        
        // Fallback: Get all jobs by this employer without sorting
        const fallbackQuery = query(
          jobsRef, 
          where('employerId', '==', user.uid)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const unsortedJobs: JobPost[] = [];
        
        fallbackSnapshot.forEach((doc) => {
          unsortedJobs.push({
            id: doc.id,
            ...doc.data() as Omit<JobPost, 'id'>
          });
        });
        
        // Sort in memory instead
        fetchedJobs = unsortedJobs.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // descending order
        });
        
        // Show a message to the user about creating the index only once
        const hasShownIndexAlert = await AsyncStorage.getItem('hasShownJobsIndexAlert');
        if (!hasShownIndexAlert) {
          Alert.alert(
            'Performance Notice',
            'For better performance, please create the suggested index in your Firebase console.',
            [{ text: 'OK' }]
          );
          await AsyncStorage.setItem('hasShownJobsIndexAlert', 'true');
        }
      }
      
      setMyJobs(fetchedJobs);
      
      // Fetch recent applications
      const chatsRef = collection(db, 'chats');
      let fetchedApplications: JobApplication[] = [];
      
      try {
        // Try the compound query first (requires index)
        const chatsQuery = query(
          chatsRef,
          where('employerId', '==', user.uid),
          orderBy('updatedAt', 'desc')
        );
        
        const chatsSnapshot = await getDocs(chatsQuery);
        
        chatsSnapshot.forEach((doc) => {
          const chatData = doc.data();
          
          fetchedApplications.push({
            id: doc.id,
            jobId: chatData.jobId,
            jobTitle: chatData.jobTitle || 'Job Position',
            applicantId: chatData.jobSeekerId,
            applicantName: chatData.jobSeekerName || 'Applicant',
            createdAt: chatData.createdAt?.toDate?.() || new Date().toISOString(),
            lastMessage: chatData.lastMessage || '',
            lastMessageAt: chatData.lastMessageAt?.toDate?.() || new Date().toISOString(),
          });
        });
      } catch (indexError) {
        console.log('Index error for chats, using fallback query:', indexError);
        
        // Fallback: Get all chats for this employer without sorting
        const fallbackQuery = query(
          chatsRef, 
          where('employerId', '==', user.uid)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const unsortedApplications: JobApplication[] = [];
        
        fallbackSnapshot.forEach((doc) => {
          const chatData = doc.data();
          
          unsortedApplications.push({
            id: doc.id,
            jobId: chatData.jobId,
            jobTitle: chatData.jobTitle || 'Job Position',
            applicantId: chatData.jobSeekerId,
            applicantName: chatData.jobSeekerName || 'Applicant',
            createdAt: chatData.createdAt?.toDate?.() || new Date().toISOString(),
            lastMessage: chatData.lastMessage || '',
            lastMessageAt: chatData.lastMessageAt?.toDate?.() || new Date().toISOString(),
          });
        });
        
        // Sort in memory instead
        fetchedApplications = unsortedApplications.sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return dateB - dateA; // descending order
        });
        
        // Show a message to the user about creating the index only once
        const hasShownChatsIndexAlert = await AsyncStorage.getItem('hasShownChatsIndexAlert');
        if (!hasShownChatsIndexAlert) {
          Alert.alert(
            'Performance Notice',
            'For better chat performance, please create the suggested index in your Firebase console.',
            [{ text: 'OK' }]
          );
          await AsyncStorage.setItem('hasShownChatsIndexAlert', 'true');
        }
      }
      
      setRecentApplications(fetchedApplications);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handlePostJob = () => {
    navigation.navigate({
      name: 'PostJob',
      params: {}
    });
  };

  const handleManageApplications = () => {
    navigation.navigate({
      name: 'ManageApplications',
      params: undefined
    });
  };

  const handleViewChat = (applicantId: string, jobId: string) => {
    navigation.navigate('Chat', { applicantId, jobId });
  };

  const renderJobItem = ({ item }: { item: JobPost }) => (
    <View 
      style={[
        styles.jobCard, 
        { 
          backgroundColor: theme.secondary,
          borderColor: theme.border,
          
        }
      ]}
    >
      <View style={styles.jobHeader}>
        <Text style={[styles.jobTitle, { color: theme.text }]}>{item.title}</Text>
        <View 
          style={[
            styles.applicantsBadge, 
            { backgroundColor: theme.primary }
          ]}
        >
          <Text style={[styles.applicantsCount, { color: theme.secondary }]}>
            {item.applicantsCount || 0} applicants
          </Text>
        </View>
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
      </View>
      
      <Text style={[styles.jobDescription, { color: theme.text }]} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.jobActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.card, borderColor: theme.border }
          ]}
          onPress={() => handleManageApplications()}
        >
          <Text style={[styles.actionButtonText, { color: theme.text }]}>View Applicants</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.primary }
          ]}
          onPress={() => navigation.navigate({
            name: 'PostJob',
            params: { jobId: item.id }
          })}
        >
          <Text style={[styles.actionButtonText, { color: theme.secondary }]}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderApplicationItem = ({ item }: { item: JobApplication }) => (
    <TouchableOpacity
      style={[
        styles.applicationCard,
        {
          backgroundColor: theme.secondary,
          borderColor: theme.border,
          
        }
      ]}
      onPress={() => handleViewChat(item.applicantId, item.jobId)}
    >
      <View style={styles.applicationUserInfo}>
        <View 
          style={[
            styles.applicantAvatar,
            { backgroundColor: theme.primary }
          ]}
        >
          <Text style={[styles.avatarInitial, { color: theme.secondary }]}>
            {item.applicantName.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.applicationTextContainer}>
          <Text style={[styles.applicantName, { color: theme.text }]}>
            {item.applicantName}
          </Text>
          <Text style={[styles.jobPositionText, { color: theme.text }]}>
            {item.jobTitle}
          </Text>
          {item.lastMessage ? (
            <Text style={[styles.lastMessageText, { color: theme.text }]} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          ) : null}
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={theme.text} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: theme.text }]}>
            {user?.displayName || 'Employer'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.postJobButton, { backgroundColor: theme.primary,  }]}
          onPress={handlePostJob}
        >
          <Text style={[styles.postJobButtonText, { color: theme.secondary }]}>Post Job</Text>
        </TouchableOpacity>
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
            <Text style={[styles.sectionTitle, { color: theme.text }]}>My Job Postings</Text>
            {myJobs.length > 0 ? (
              <FlatList
                data={myJobs}
                renderItem={renderJobItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View 
                style={[
                  styles.emptyStateContainer, 
                  { backgroundColor: theme.card, borderColor: theme.border }
                ]}
              >
                <Text style={[styles.emptyStateText, { color: theme.text }]}>
                  You haven't posted any jobs yet.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
                  onPress={handlePostJob}
                >
                  <Text style={[styles.emptyStateButtonText, { color: theme.secondary }]}>
                    Create Your First Job Post
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Applications</Text>
              {recentApplications.length > 0 && (
                <TouchableOpacity onPress={handleManageApplications}>
                  <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {recentApplications.length > 0 ? (
              <FlatList
                data={recentApplications.slice(0, 5)}
                renderItem={renderApplicationItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View 
                style={[
                  styles.emptyStateContainer, 
                  { 
                    backgroundColor: theme.card, 
                    borderColor: theme.border,
                    padding: 24
                  }
                ]}
              >
                <Text style={[styles.emptyStateText, { color: theme.text }]}>
                  No applications received yet.
                </Text>
              </View>
            )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  welcomeText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  postJobButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postJobButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  jobCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  applicantsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  applicantsCount: {
    fontSize: 12,
    fontWeight: 'bold',
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
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  applicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  applicationUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  applicantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  applicationTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobPositionText: {
    fontSize: 14,
  },
  lastMessageText: {
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EmployerHomeScreen; 