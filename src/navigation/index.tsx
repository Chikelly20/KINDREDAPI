import React from 'react';
import { NavigationContainer, Theme as NavigationTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Import actual screens
import SplashScreen from '../screens/SplashScreen';
import GetStartedScreen from '../screens/GetStartedScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import UserTypeScreen from '../screens/auth/UserTypeScreen';
import HomeScreen from '../screens/HomeScreen'; // Re-add HomeScreen import
import JobTypeScreen from '../screens/jobseeker/JobTypeScreen';
import FormalQuestionnaireScreen from '../screens/jobseeker/FormalQuestionnaireScreen';
import InformalQuestionnaireScreen from '../screens/jobseeker/InformalQuestionnaireScreen';

// Import tab navigator
import JobSeekerTabNavigator from './JobSeekerTabNavigator';
import EmployerTabNavigator from './EmployerTabNavigator';

// Define navigation types directly here to avoid import issues
export type RootStackParamList = {
  Splash: undefined;
  GetStarted: undefined;
  Login: undefined;
  Signup: { userType?: 'jobseeker' | 'employer' };
  UserType: undefined;
  Home: undefined; // Add Home screen back to the navigation stack
  JobType: undefined;
  FormalQuestionnaire: undefined;
  InformalQuestionnaire: undefined;
  JobSeekerHome: undefined;
  EmployerHome: undefined;
};

// Job Seeker specific navigation
export type JobSeekerStackParamList = {
  Home: undefined;
  JobType: undefined;
  FormalQuestionnaire: undefined;
  InformalQuestionnaire: undefined;
  JobSeekerHome: undefined;
  Chat: { jobId: string; employerId: string } | undefined;
  Profile: undefined;
  Settings: undefined;
};

// Employer specific navigation
export type EmployerStackParamList = {
  Home: undefined;
  PostJob: { jobId?: string };
  ManageApplications: undefined;
  EmployerHome: undefined;
  Chat: { applicantId: string; jobId: string } | undefined;
  Profile: undefined;
  Settings: undefined;
  JobSeekerProfileView: { userId: string };
};

// Create stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

// Loading screen component
const LoadingScreen = () => {
  const { theme } = useTheme();
  
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: theme.background 
    }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
};

// Main navigation component
const Navigation = () => {
  const { theme, themeType } = useTheme();
  const { user, isLoading } = useAuth();
  
  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // Create a navigation theme based on our app theme
  const navigationTheme: NavigationTheme = {
    ...DefaultTheme,
    dark: themeType === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      notification: theme.primary,
    }
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: theme.secondary,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: theme.background }
        }}
      >
        {user ? (
          // Authenticated user routes
          user.userType === 'jobseeker' ? (
            // Job seeker routes - always include all screens
            <>
              <Stack.Screen 
                name="JobSeekerHome" 
                component={JobSeekerTabNavigator} 
                options={{ 
                  headerShown: false,
                  headerBackVisible: false
                }}
              />
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ headerShown: true, title: 'Kindred' }}
              />
              <Stack.Screen 
                name="JobType" 
                component={JobTypeScreen} 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false // Prevent going back
                }}
              />
              <Stack.Screen 
                name="FormalQuestionnaire" 
                component={FormalQuestionnaireScreen} 
                options={{ 
                  headerShown: true,
                  title: 'Formal Job Profile',
                  headerTintColor: theme.secondary
                }}
              />
              <Stack.Screen 
                name="InformalQuestionnaire" 
                component={InformalQuestionnaireScreen} 
                options={{ 
                  headerShown: true,
                  title: 'Informal Job Profile',
                  headerTintColor: theme.secondary
                }}
              />
              <Stack.Screen 
                name="UserType" 
                component={UserTypeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="EmployerHome" 
                component={EmployerTabNavigator} 
                options={{ headerShown: false }}
              />
            </>
          ) : user.userType === 'employer' ? (
            // Employer routes
            <>
              <Stack.Screen 
                name="EmployerHome" 
                component={EmployerTabNavigator} 
                options={{ 
                  headerShown: false,
                  headerBackVisible: false
                }}
              />
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ headerShown: true, title: 'Kindred' }}
              />
              <Stack.Screen 
                name="UserType" 
                component={UserTypeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="JobSeekerHome" 
                component={JobSeekerTabNavigator} 
                options={{ headerShown: false }}
              />
            </>
          ) : (
            // User hasn't set their type yet
            <>
              <Stack.Screen 
                name="UserType" 
                component={UserTypeScreen}
                options={{ 
                  headerShown: false,
                  gestureEnabled: false // Prevent going back
                }}
              />
              <Stack.Screen 
                name="JobSeekerHome" 
                component={JobSeekerTabNavigator} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="EmployerHome" 
                component={EmployerTabNavigator} 
                options={{ headerShown: false }}
              />
            </>
          )
        ) : (
          // Unauthenticated user routes - clear sequential flow
          <>
            <Stack.Screen 
              name="Splash" 
              component={SplashScreen} 
              options={{ 
                headerShown: false,
                gestureEnabled: false // Prevent going back
              }}
            />
            <Stack.Screen 
              name="GetStarted" 
              component={GetStartedScreen} 
              options={{ 
                headerShown: false,
                gestureEnabled: false // Prevent going back
              }}
            />
            <Stack.Screen 
              name="UserType" 
              component={UserTypeScreen}
              options={{ 
                headerShown: false,
                gestureEnabled: false // Prevent going back
              }}
            />
            <Stack.Screen 
              name="Signup" 
              component={SignupScreen} 
              options={{ 
                headerShown: false,
                gestureEnabled: true // Allow going back to user type selection
              }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ 
                headerShown: false,
                gestureEnabled: true // Allow going back to get started
              }}
            />
            <Stack.Screen 
              name="JobType" 
              component={JobTypeScreen} 
              options={{ 
                headerShown: false,
                gestureEnabled: false // Prevent going back
              }}
            />
            <Stack.Screen 
              name="FormalQuestionnaire" 
              component={FormalQuestionnaireScreen} 
              options={{ 
                headerShown: false,
                gestureEnabled: false // Prevent going back
              }}
            />
            <Stack.Screen 
              name="InformalQuestionnaire" 
              component={InformalQuestionnaireScreen} 
              options={{ 
                headerShown: false,
                gestureEnabled: false // Prevent going back
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;