import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JobSeekerStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';

// We're using any for navigation props since this component is used in a nested navigator
type Props = NativeStackScreenProps<any>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={50} color={theme.primary} />
          </View>
          
          <Text style={[styles.userName, { color: theme.text }]}>
            {user?.displayName || 'User'}
          </Text>
          
          <Text style={[styles.userEmail, { color: theme.text }]}>
            {user?.email || 'No email provided'}
          </Text>
          
          <View style={styles.userTypeContainer}>
            <Text style={[styles.userTypeLabel, { backgroundColor: theme.primary, color: theme.secondary }]}>
              {user?.jobSeekerType === 'formal' ? 'Formal Job Seeker' : 'Informal Job Seeker'}
            </Text>
          </View>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>My Information</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={24} color={theme.primary} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>My Resume</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="briefcase-outline" size={24} color={theme.primary} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Job Preferences</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="heart-outline" size={24} color={theme.primary} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Saved Jobs</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="person-outline" size={24} color={theme.primary} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="lock-closed-outline" size={24} color={theme.primary} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileCard: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 16,
  },
  userTypeContainer: {
    marginTop: 8,
  },
  userTypeLabel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: '500',
  },
  sectionContainer: {
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
});

export default ProfileScreen;
