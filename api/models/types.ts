/**
 * Type definitions for the K-NN job matching algorithm
 */

export interface Job {
  id: string;
  title: string;
  location: string;
  salary: string;
  workingDays: string;
  workingHours: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  employerId: string;
  employerName: string;
  applicantsCount: number;
  createdAt: string;
}

export interface JobSeeker {
  id: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  location?: string;
  phoneNumber?: string;
  resumeURL?: string;
}

export interface MatchingResult {
  score: number;
  matchPercentage: number;
  matchDetails: {
    skillsMatch: number;
    locationMatch: number;
    experienceMatch: number;
    descriptionMatch: number;
  };
}

export interface JobMatch extends MatchingResult {
  job: Job;
}

export interface CandidateMatch extends MatchingResult {
  jobSeeker: JobSeeker;
}
