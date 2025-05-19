export interface JobPost {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  salary: string;
  location: string;
  employerId: string;
  employerName: string;
  jobType: string;
  createdAt: Date;
  skills: string[];
  contactInfo: string;
}
