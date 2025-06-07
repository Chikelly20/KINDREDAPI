import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JobSeekerStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<JobSeekerStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { signOut, deleteAccount } = useAuth();
  const { theme, toggleTheme, themeType } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled by the auth state change in the navigation container
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unexpected error occurred');
      }
    }
  };
  
  const handleDeleteAccount = async () => {
    // Reset error state
    setPasswordError('');
    
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await deleteAccount(password);
      // If successful, the auth state will change and user will be redirected
    } catch (error) {
      // Error handling is done in the AuthContext
      console.error('Delete account error:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalVisible(false);
      setPassword('');
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: handleSignOut, style: 'destructive' }
      ]
    );
  };
  
  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => setIsDeleteModalVisible(true), style: 'destructive' }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Ionicons name="moon-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={themeType === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Ionicons name="notifications-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Ionicons name="mail-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Email Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile Options</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('JobType')}
          >
            <Ionicons name="briefcase-outline" size={24} color={theme.primary} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Change Job Type</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('FormalQuestionnaire')}
          >
            <Ionicons name="document-outline" size={24} color={theme.primary} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Formal Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('InformalQuestionnaire')}
          >
            <Ionicons name="clipboard-outline" size={24} color={theme.primary} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Informal Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Privacy</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Ionicons name="location-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Location Services</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>About Kindred</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={24} color={theme.primary} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-outline" size={24} color={theme.primary} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.dangerZone}>
          <Text style={[styles.dangerZoneTitle, { color: theme.error }]}>Danger Zone</Text>
          
          <TouchableOpacity 
            style={[styles.deleteAccountButton, { borderColor: theme.error }]}
            onPress={confirmDeleteAccount}
          >
            <Ionicons name="trash-outline" size={24} color={theme.error} />
            <Text style={[styles.deleteAccountButtonText, { color: theme.error }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: theme.primary }]}
          onPress={confirmSignOut}
        >
          <Text style={[styles.signOutButtonText, { color: theme.secondary }]}>Sign Out</Text>
        </TouchableOpacity>
        
        {/* Delete Account Modal */}
        <Modal
          visible={isDeleteModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Confirm Account Deletion</Text>
              
              <Text style={[styles.modalText, { color: theme.text }]}>
                Please enter your password to confirm account deletion. This action cannot be undone.
              </Text>
              
              <TextInput
                style={[styles.passwordInput, { borderColor: passwordError ? theme.error : theme.border, color: theme.text }]}
                placeholder="Enter your password"
                placeholderTextColor={theme.textLight}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              
              {passwordError ? (
                <Text style={[styles.errorText, { color: theme.error }]}>{passwordError}</Text>
              ) : null}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}
                  onPress={() => {
                    setIsDeleteModalVisible(false);
                    setPassword('');
                    setPasswordError('');
                  }}
                  disabled={isDeleting}
                >
                  <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.deleteButton, { backgroundColor: theme.error }]}
                  onPress={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={theme.secondary} />
                  ) : (
                    <Text style={[styles.modalButtonText, { color: theme.secondary }]}>Delete</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
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
  signOutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dangerZone: {
    marginTop: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderStyle: 'dashed',
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteAccountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  passwordInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    borderWidth: 1,
  },
  deleteButton: {
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  }
});

export default SettingsScreen;
