import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Import screens
import HomeScreen from '../screens/jobseeker/HomeScreen';
import ChatScreen from '../screens/jobseeker/ChatScreen';
import SettingsScreen from '../screens/jobseeker/SettingsScreen';
import JobSeekerProfileStack from './JobSeekerProfileStack';

// Import types
import { JobSeekerStackParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<JobSeekerStackParamList>();

const JobSeekerTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: theme.secondary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Home',
          headerTitle: 'Job Listings'
        }} 
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ 
          title: 'Chat',
          headerTitle: 'Messages',
          tabBarBadge: 3 // Example of notification badge
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
    </Tab.Navigator>
  );
};

export default JobSeekerTabNavigator;
