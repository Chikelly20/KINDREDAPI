import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Platform, Text, View, StyleSheet, Dimensions } from 'react-native';

// Get screen width for precise tab sizing
const windowWidth = Dimensions.get('window').width;

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
      // @ts-ignore - Workaround for 'Property id is missing' TypeScript error
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Use a consistent size for all icons
          const iconSize = 24;
          let iconName: any = "help-circle";
          
          if (route.name === 'Home') iconName = "home";
          else if (route.name === 'Chat') iconName = "chat";
          else if (route.name === 'Profile') iconName = "account";
          else if (route.name === 'Settings') iconName = "cog";
          
          return (
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />
            </View>
          );
        },
        tabBarLabel: ({ focused, color }) => {
          let label = '';
          if (route.name === 'Home') label = 'Home';
          else if (route.name === 'Chat') label = 'Chat';
          else if (route.name === 'Profile') label = 'Profile';
          else if (route.name === 'Settings') label = 'Setting';
          
          return (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={[styles.tabBarLabel, { color }]}>{label}</Text>
            </View>
          );
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          height: 60,
          paddingTop: 0,
          paddingBottom: 0,
          borderTopWidth: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
        },
        tabBarItemStyle: {
          width: windowWidth / 5, // Divide screen width by number of tabs
          justifyContent: 'center',
          alignItems: 'center',
          height: 60,
          paddingVertical: 0,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
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
          title: 'Setting',
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

const styles = StyleSheet.create({
  iconContainer: {
    height: 28,
    width: windowWidth / 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  labelContainer: {
    height: 20,
    width: windowWidth / 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default JobSeekerTabNavigator;
