import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Import screens
import EmployerHomeScreen from '../screens/employer/HomeScreen';
import PostJobScreen from '../screens/employer/PostJobScreen';
import ManageApplicationsScreen from '../screens/employer/ManageApplicationsScreen';
import ChatScreen from '../screens/employer/ChatScreen';
import ProfileScreen from '../screens/employer/ProfileScreen';
import SettingsScreen from '../screens/employer/SettingsScreen';
import JobSeekerProfileView from '../screens/employer/JobSeekerProfileView';

// Import types
import { EmployerStackParamList } from '../navigation';

const Tab = createBottomTabNavigator<EmployerStackParamList>();

const EmployerTabNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'ManageApplications') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else {
            iconName = 'help-circle-outline';
          }
          
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          paddingHorizontal: 0,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={EmployerHomeScreen} 
        options={{ title: 'Dashboard' }} 
      />
      <Tab.Screen 
        name="ManageApplications" 
        component={ManageApplicationsScreen} 
        options={{ title: 'Applications' }} 
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        initialParams={{ applicantId: '', jobId: '' }}
        options={{ title: 'Messages' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
      <Tab.Screen 
        name="JobSeekerProfileView" 
        component={JobSeekerProfileView} 
        options={{ 
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
          headerShown: true
        }} 
      />
      <Tab.Screen 
        name="PostJob" 
        component={PostJobScreen} 
        options={{ 
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
          headerShown: true
        }} 
        initialParams={{ jobId: undefined }}
      />
    </Tab.Navigator>
  );
};

export default EmployerTabNavigator;
