import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { EmployerStackParamList } from '../../navigation';
import { collection, query, where, getDocs, orderBy, DocumentData } from 'firebase/firestore';
import { db, userAPI } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<EmployerStackParamList, 'ManageApplications'>;

interface ChatData {
  employerId: string;
  jobSeekerId: string;
  jobId: string;
  jobTitle: string;
  jobSeekerName: string;
  createdAt: any;
  lastMessage: string;
  lastMessageAt: any;
  updatedAt: any;
}

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantName: string;
  createdAt: any;
  lastMessage: string;
  lastMessageAt: any;
}

const ManageApplicationsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter(
        app => 
          app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.applicantName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredApplications(filtered);
    }
  }, [searchQuery, applications]);

  const fetchApplications = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      
      // Fetch all applications (chats) for this employer
      const chatsRef = collection(db, 'chats');
      const chatsQuery = query(
        chatsRef,
        where('employerId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(chatsQuery);
      const fetchedApplications: JobApplication[] = [];
      const applicantIds: string[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as ChatData;
        const applicantId = data.jobSeekerId || '';
        
        if (applicantId && !applicantIds.includes(applicantId)) {
          applicantIds.push(applicantId);
        }
        
        fetchedApplications.push({
          id: doc.id,
          jobId: data.jobId || '',
          jobTitle: data.jobTitle || 'Job Position',
          applicantId: applicantId,
          applicantName: data.jobSeekerName || 'Applicant',
          createdAt: data.createdAt,
          lastMessage: data.lastMessage || 'No messages yet',
          lastMessageAt: data.lastMessageAt
        });
      });
      
      // We no longer need to copy profiles to public_users
      // This was causing permission errors
      console.log(`Found ${applicantIds.length} job seekers in applications`);
      
      // Instead, we'll use the JobSeekerProfilesContext to manage profiles
      
      setApplications(fetchedApplications);
      setFilteredApplications(fetchedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      Alert.alert('Error', 'Failed to load applications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewChat = (applicantId: string, jobId: string, jobTitle: string) => {
    // Navigate to Chat screen with necessary parameters
    // Note: Based on the navigation type, we only pass applicantId and jobId
    navigation.navigate('Chat', { 
      applicantId, 
      jobId
    });
  };

  const handleViewProfile = (applicantId: string) => {
    // Navigate to the JobSeekerProfileView screen with the applicant ID
    navigation.navigate('JobSeekerProfileView', { userId: applicantId });
  };

  const renderApplicationItem = ({ item }: { item: JobApplication }) => {
    const applicationDate = item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date';
    const lastMessageDate = item.lastMessageAt ? new Date(item.lastMessageAt.seconds * 1000).toLocaleDateString() : '';
    
    return (
      <View
        style={[
          styles.applicationCard,
          {
            backgroundColor: theme.secondary,
            borderColor: theme.border,
            shadowColor: theme.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2
          }
        ]}
      >
        <View style={styles.applicationHeader}>
          <View style={styles.applicantInfo}>
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
            <View>
              <Text style={[styles.applicantName, { color: theme.text }]}>
                {item.applicantName}
              </Text>
              <Text style={[styles.applicationDate, { color: theme.textLight }]}>
                Applied on {applicationDate}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.textLight} />
        </View>
        
        <View
          style={[
            styles.jobTitleContainer,
            { backgroundColor: theme.card }
          ]}
        >
          <Text style={[styles.jobTitle, { color: theme.text }]}>
            {item.jobTitle}
          </Text>
        </View>
        
        {item.lastMessage && (
          <View style={styles.messagePreviewContainer}>
            <Text style={[styles.messagePreviewLabel, { color: theme.textLight }]}>
              Last message:
            </Text>
            <Text style={[styles.messagePreview, { color: theme.text }]} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {lastMessageDate && (
              <Text style={[styles.messageDate, { color: theme.textLight }]}>
                {lastMessageDate}
              </Text>
            )}
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => handleViewProfile(item.applicantId)}
          >
            <Ionicons name="person" size={16} color={theme.secondary} />
            <Text style={[styles.buttonText, { color: theme.secondary }]}>View Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => handleViewChat(item.applicantId, item.jobId, item.jobTitle)}
          >
            <Ionicons name="chatbubble" size={16} color={theme.secondary} />
            <Text style={[styles.buttonText, { color: theme.secondary }]}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
          Applications
        </Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.secondary, borderColor: theme.border }
          ]}
        >
          <Ionicons name="search-outline" size={20} color={theme.textLight} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search applications..."
            placeholderTextColor={theme.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredApplications}
          renderItem={renderApplicationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textLight }]}>
                {searchQuery
                  ? 'No applications match your search'
                  : 'No applications received yet'}
              </Text>
              {searchQuery ? (
                <TouchableOpacity
                  style={[styles.clearSearchButton, { borderColor: theme.primary }]}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={[styles.clearSearchText, { color: theme.primary }]}>
                    Clear Search
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />
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
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  applicationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  applicantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  applicationDate: {
    fontSize: 12,
  },
  jobTitleContainer: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  messagePreviewContainer: {
    marginTop: 8,
  },
  messagePreviewLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 14,
  },
  messageDate: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  clearSearchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ManageApplicationsScreen;
