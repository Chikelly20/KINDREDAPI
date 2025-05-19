import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  JobSeekerHome: undefined;
  JobDetails: { jobId: string };
  Profile: undefined;
  Notifications: undefined;
  Search: undefined;
  JobType: undefined;
};

export type JobSeekerHomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'JobSeekerHome'>;
