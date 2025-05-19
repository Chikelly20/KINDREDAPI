export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'jobseeker' | 'employer';
  phoneNumber?: string;
  profileCompleted: boolean;
  createdAt: string;
  formalQuestionnaire?: {
    education: string;
    experience: string[];
    skills: string[];
    certifications: string[];
  };
  informalQuestionnaire?: {
    skills: string[];
    availability: string[];
    preferredWork: string[];
  };
}
