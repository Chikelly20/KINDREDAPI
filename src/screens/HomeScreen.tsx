import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

const HomeScreen = () => {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <View style={[styles.welcomeCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.welcomeTitle, { color: theme.text }]}>
            Welcome, {user?.displayName || 'User'}!
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.text }]}>
            {user?.userType === 'jobseeker'
              ? 'Find your perfect job'
              : user?.userType === 'employer'
              ? 'Find the perfect candidates'
              : 'Please complete your profile'}
          </Text>

          {!user?.userType && (
            <TouchableOpacity
              style={[styles.completeProfileButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('UserType')}
            >
              <Text style={styles.buttonText}>Complete Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.card }]}
            onPress={() => {
              if (user?.userType === 'employer') {
                navigation.navigate('EmployerHome');
              } else if (user?.userType === 'jobseeker') {
                navigation.navigate('JobSeekerHome');
              } else {
                navigation.navigate('UserType');
              }
            }}
          >
            <FontAwesome name="search" size={24} color={theme.primary} />
            <Text style={[styles.actionTitle, { color: theme.text }]}>
              {user?.userType === 'employer' ? 'Find Candidates' : 'Find Jobs'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.card }]}
            onPress={() => {
              if (user?.userType === 'employer') {
                navigation.navigate('EmployerHome');
              } else if (user?.userType === 'jobseeker') {
                navigation.navigate('JobSeekerHome');
              } else {
                navigation.navigate('UserType');
              }
            }}
          >
            <FontAwesome name="comments" size={24} color={theme.primary} />
            <Text style={[styles.actionTitle, { color: theme.text }]}>Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.card }]}
            onPress={() => {
              if (user?.userType === 'employer') {
                navigation.navigate('EmployerHome');
              } else if (user?.userType === 'jobseeker') {
                navigation.navigate('JobSeekerHome');
              } else {
                navigation.navigate('UserType');
              }
            }}
          >
            <FontAwesome name="user" size={24} color={theme.primary} />
            <Text style={[styles.actionTitle, { color: theme.text }]}>Profile</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: theme.primary }]}
          onPress={handleSignOut}
        >
          <Text style={[styles.signOutText, { color: theme.primary }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  completeProfileButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  actionCard: {
    width: '30%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  signOutButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    marginTop: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 