import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Text, StyleSheet, Platform } from 'react-native';

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

const EmployerTabNavigator: React.FC = () => {
  const { theme } = useTheme();
  
  // Using 'as any' to bypass the TypeScript error with the 'id' property
  // This is a known issue with React Navigation's TypeScript definitions
  return (
    <Tab.Navigator
      // @ts-ignore - Workaround for 'Property id is missing' TypeScript error
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
          } else if (route.name === 'ManageApplications') {
            return <FontAwesome5 name="briefcase" size={size} color={color} />;
          } else if (route.name === 'Chat') {
            return <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;
          } else if (route.name === 'Settings') {
            return <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />;
          }
          return <Ionicons name="help-circle-outline" size={size} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          let label = '';
          if (route.name === 'Home') label = 'Home';
          else if (route.name === 'ManageApplications') label = 'Applications';
          else if (route.name === 'Chat') label = 'Chat';
          else if (route.name === 'Profile') label = 'Profile';
          else if (route.name === 'Settings') label = 'Settings';
          
          return <Text style={[styles.tabBarLabel, { color }]}>{label}</Text>;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: Platform.OS === 'ios' ? 15 : 5,
          paddingHorizontal: 10,
          borderTopWidth: 1,
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
        component={EmployerHomeScreen} 
        options={{ 
          title: 'Home',
          headerTitle: 'Dashboard'
        }} 
      />
      <Tab.Screen 
        name="ManageApplications" 
        component={ManageApplicationsScreen} 
        options={{ 
          title: 'Applications',
          headerTitle: 'Manage Applications'
        }} 
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        initialParams={{ applicantId: '', jobId: '' }}
        options={{ 
          title: 'Chat',
          headerTitle: 'Messages'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Profile',
          headerTitle: 'My Profile'
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

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 3,
  },
});

export default EmployerTabNavigator;
