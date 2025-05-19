import { FirebaseTimestamp } from '../config/firebase';

export interface JobPost {
  id: string;
  title: string;
  description: string;
  employerName: string;
  location: string;
  salary: string;
  workingDays: string;
  workingHours: string;
  createdAt: typeof FirebaseTimestamp;
  employerId: string;
  jobType: 'formal' | 'informal';
  type: 'formal' | 'informal';
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  status: 'open' | 'closed';
}
