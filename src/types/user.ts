import { FirebaseTimestamp } from '../config/firebase';

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  location: string;
  bio: string;
  skills: string[];
  experience: string;
  education: string;
  preferences: {
    jobType: 'formal' | 'informal';
    location: string;
    salary: string;
    workingDays: string[];
    workingHours: string;
  };
  profileType: 'formal' | 'informal';
  createdAt: typeof FirebaseTimestamp;
  updatedAt: typeof FirebaseTimestamp;
}
