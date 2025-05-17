import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Text, StyleSheet, Platform, View, Dimensions } from 'react-native';

// Get screen width for precise tab sizing
// Calculate window width for tab sizing
// Dividing by 4 instead of 5 since we're hiding the Profile tab
const windowWidth = Dimensions.get('window').width;

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
          // Use a consistent size for all icons
          const iconSize = 24;
          let iconName: any = "help-circle";
          
          if (route.name === 'Home') iconName = "home";
          else if (route.name === 'ManageApplications') iconName = "briefcase";
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
          else if (route.name === 'ManageApplications') label = 'Applications';
          else if (route.name === 'Chat') label = 'Chat';
          else if (route.name === 'Profile') label = 'Profile';
          else if (route.name === 'Settings') label = 'Setting';
          
          return (
            <View style={styles.labelContainer}>
              <Text style={[styles.tabBarLabel, { color }]}>{label}</Text>
            </View>
          );
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: 'gray',

        tabBarItemStyle: {
          width: windowWidth / 4, // Divide screen width by number of visible tabs (4)
          justifyContent: 'center',
          alignItems: 'center',
          height: 60,
          paddingVertical: 0,
        },
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
        component={EmployerHomeScreen} 
        options={{ 
          title: 'Home',
          headerShown: false
        }} 
      />
      <Tab.Screen 
        name="ManageApplications" 
        component={ManageApplicationsScreen} 
        options={{ 
          title: 'Applications',
          headerShown: false
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
          headerTitle: 'My Profile',
          tabBarButton: () => null, // Hide this tab from the tab bar
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
  iconContainer: {
    height: 28,
    width: windowWidth / 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  labelContainer: {
    height: 20,
    width: windowWidth / 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default EmployerTabNavigator;
