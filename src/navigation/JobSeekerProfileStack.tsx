import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';

// Import screens
import ProfileScreen from '../screens/jobseeker/ProfileScreen';
import EditProfileScreen from '../screens/jobseeker/EditProfileScreen';

// Create a separate type for the profile stack to avoid naming conflicts
type JobSeekerProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<JobSeekerProfileStackParamList>();

const JobSeekerProfileStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background }
      }}
    >
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};

export default JobSeekerProfileStack;
