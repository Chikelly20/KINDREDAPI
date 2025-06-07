import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { EmployerStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<EmployerStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { signOut, user, deleteAccount } = useAuth();
  const { theme, toggleTheme, themeType } = useTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      // Navigation will be handled by the AuthContext
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
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
  
  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your employer account? This will permanently remove all your job postings and company data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => setIsDeleteModalVisible(true), style: 'destructive' }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        
        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="person-outline" size={22} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Company Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={22} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Notifications</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.secondary}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed-outline" size={22} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={toggleTheme}
          >
            <View style={styles.settingInfo}>
              <Ionicons 
                name={themeType === 'dark' ? 'moon-outline' : 'sunny-outline'} 
                size={22} 
                color={theme.primary} 
              />
              <Text style={[styles.settingText, { color: theme.text }]}>
                {themeType === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <Switch
              value={themeType === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.secondary}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="language-outline" size={22} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Language</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: theme.textLight }]}>English</Text>
              <Ionicons name="chevron-forward" size={22} color={theme.text} />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Support</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle-outline" size={22} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="document-text-outline" size={22} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="shield-outline" size={22} color={theme.primary} />
              <Text style={[styles.settingText, { color: theme.text }]}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.error }]}>Danger Zone</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
            onPress={confirmDeleteAccount}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="trash-outline" size={22} color={theme.error} />
              <Text style={[styles.settingText, { color: theme.error }]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.error} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: theme.error }]}
          onPress={confirmSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator color={theme.secondary} size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={22} color={theme.secondary} />
              <Text style={[styles.signOutText, { color: theme.secondary }]}>Sign Out</Text>
            </>
          )}
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
                Please enter your password to confirm account deletion. This will permanently remove all your job postings and company data.
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
        
        <Text style={[styles.versionText, { color: theme.textLight }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 16,
    marginRight: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
    fontSize: 14,
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
