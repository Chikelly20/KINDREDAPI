import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { Platform } from 'react-native';
import CustomTabBar from '../components/CustomTabBar';

// Import screens
import HomeScreen from '../screens/jobseeker/HomeScreen';
import ChatScreen from '../screens/jobseeker/ChatScreen';
import SettingsScreen from '../screens/jobseeker/SettingsScreen';
import JobDetailsScreen from '../screens/jobseeker/JobDetailsScreen';
import JobSeekerProfileStack from './JobSeekerProfileStack';

// Import types
import { JobSeekerStackParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<JobSeekerStackParamList>();

const JobSeekerTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      // @ts-ignore - Adding id to fix navigation type error
      id="jobseeker-tabs"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: theme.secondary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Home',
          headerTitle: 'KINDRED'
        }} 
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ 
          title: 'Chat',
          headerTitle: 'Messages'
        }} 
        initialParams={{ jobId: '', employerId: '' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={JobSeekerProfileStack} 
        options={{ 
          title: 'Profile',
          headerTitle: 'My Profile',
          headerShown: false
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          title: 'Settings',
          headerTitle: 'Settings'
        }}
      />
      <Tab.Screen 
        name="JobDetails" 
        component={JobDetailsScreen}
        options={{
          tabBarButton: () => null,
          headerTitle: 'Job Details',
        }} 
      />
    </Tab.Navigator>
  );
};



export default JobSeekerTabNavigator;
