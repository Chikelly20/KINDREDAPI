// Navigation type definitions

// Root Stack Param List (main navigation)
export type RootStackParamList = {
  Splash: undefined;
  GetStarted: undefined;
  Login: undefined;
  Signup: { userType?: 'jobseeker' | 'employer' };
  UserType: undefined;
  Home: undefined;
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
};
