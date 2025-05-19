import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Text, StyleSheet, Platform, View, Dimensions, SafeAreaView } from 'react-native';

// Get screen width for precise tab sizing
// We have 4 visible tabs: Home, Applications, Chat, and Setting
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
  
  return (
    // @ts-ignore - Workaround for TypeScript error with 'id' property
    // This is a known issue with React Navigation's type definitions
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Use a consistent size for all icons
          const iconSize = 24;
          
          if (route.name === 'Home') {
            return (
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="home" size={iconSize} color={color} />
              </View>
            );
          } else if (route.name === 'ManageApplications') {
            return (
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="briefcase" size={iconSize} color={color} />
              </View>
            );
          } else if (route.name === 'Chat') {
            return (
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="chat" size={iconSize} color={color} />
              </View>
            );
          } else if (route.name === 'Settings') {
            return (
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="cog" size={iconSize} color={color} />
              </View>
            );
          }
          
          return (
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="help-circle" size={iconSize} color={color} />
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
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          height: 60,
          paddingVertical: 8,
          paddingHorizontal: 16,
          minWidth: 80,
          maxWidth: 120,
        },
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          height: 60,
          paddingTop: 0,
          paddingBottom: 0,
          borderTopWidth: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: 16,
          width: '100%',
        },
        tabBarIconStyle: {
          width: 24,
          height: 24,
          margin: 4,
        },
        tabBarBackground: () => (
          <SafeAreaView style={{ backgroundColor: theme.background, flex: 1 }} />
        ),
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          textAlign: 'center',
          lineHeight: 16,
          marginBottom: 2,
        },
        tabBarIconContainerStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          height: 32,
          width: 32,
          margin: 4,
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
          headerShown: false
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          title: 'Settings',
          headerShown: false
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
    height: 32,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelContainer: {
    height: 24,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default EmployerTabNavigator;
