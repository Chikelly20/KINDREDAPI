/**
 * Type definitions for the K-NN job matching algorithm
 */

import { Coordinates } from '../utils/geocoding';

export interface Job {
  id: string;
  title: string;
  location: string;
  coordinates?: Coordinates;
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
  coordinates?: Coordinates;
  phoneNumber?: string;
  resumeURL?: string;
  maxDistance?: number; // Maximum distance in km the job seeker is willing to travel
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
  distance?: number; // Distance in kilometers between job and job seeker
}

export interface JobMatch extends MatchingResult {
  job: Job;
}

export interface CandidateMatch extends MatchingResult {
  jobSeeker: JobSeeker;
}
