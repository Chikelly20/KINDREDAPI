/**
 * K-Nearest Neighbors (K-NN) implementation for job matching
 * This utility helps find the most relevant jobs for job seekers
 * and the most suitable candidates for employers
 */

import { Job, JobSeeker, MatchingResult, JobMatch, CandidateMatch } from '../models/types';
import { calculateDistance, calculateLocationMatchScore, geocodeAddress, Coordinates } from './geocoding';

/**
 * Calculate detailed similarity score between a job and a job seeker
 * @param job The job posting
 * @param jobSeeker The job seeker profile
 * @returns Detailed matching result with scores for different criteria
 */
export const calculateDetailedSimilarity = async (job: Job, jobSeeker: JobSeeker): Promise<MatchingResult> => {
  // Initialize match details
  const matchDetails = {
    skillsMatch: 0,
    locationMatch: 0,
    experienceMatch: 0,
    descriptionMatch: 0
  };
  
  let totalScore = 0;
  let maxPossibleScore = 0;
  let distance: number | undefined = undefined;
  
  // Calculate skill match (most important factor)
  const jobSkills = job.requirements || [];
  const seekerSkills = jobSeeker.skills || [];
  
  if (jobSkills.length > 0 && seekerSkills.length > 0) {
    const matchingSkills = seekerSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
    
    matchDetails.skillsMatch = matchingSkills.length / Math.max(jobSkills.length, 1);
    totalScore += matchDetails.skillsMatch * 0.5; // 50% weight for skills
    maxPossibleScore += 0.5;
  }
  
  // Location match using precise proximity
  if (job.location && jobSeeker.location) {
    // Get coordinates for job and job seeker if not already available
    let jobCoords = job.coordinates;
    let seekerCoords = jobSeeker.coordinates;
    
    if (!jobCoords) {
      jobCoords = await geocodeAddress(job.location);
    }
    
    if (!seekerCoords) {
      seekerCoords = await geocodeAddress(jobSeeker.location);
    }
    
    // Calculate distance and match score if coordinates are available
    if (jobCoords && seekerCoords) {
      distance = calculateDistance(jobCoords, seekerCoords);
      
      // Use job seeker's max distance preference or default to 50km
      const maxDistance = jobSeeker.maxDistance || 50;
      
      matchDetails.locationMatch = calculateLocationMatchScore(distance, maxDistance);
      totalScore += matchDetails.locationMatch * 0.2; // 20% weight for location
    } else {
      // Fall back to string matching if geocoding fails
      if (job.location.toLowerCase().includes(jobSeeker.location.toLowerCase()) ||
          jobSeeker.location.toLowerCase().includes(job.location.toLowerCase())) {
        matchDetails.locationMatch = 0.7; // Not as good as precise matching
        totalScore += matchDetails.locationMatch * 0.2;
      }
    }
    
    maxPossibleScore += 0.2;
  }
  
  // Experience/bio match (check if bio contains relevant keywords from job description)
  if (job.description && jobSeeker.bio) {
    const jobKeywords = extractKeywords(job.description);
    const bioKeywords = extractKeywords(jobSeeker.bio);
    
    const matchingKeywords = jobKeywords.filter(keyword => 
      bioKeywords.includes(keyword)
    );
    
    if (jobKeywords.length > 0) {
      matchDetails.descriptionMatch = matchingKeywords.length / jobKeywords.length;
      totalScore += matchDetails.descriptionMatch * 0.2; // 20% weight for description match
    }
    maxPossibleScore += 0.2;
  }
  
  // Experience match
  if (job.description && jobSeeker.experience) {
    const jobKeywords = extractKeywords(job.description);
    const experienceKeywords = extractKeywords(jobSeeker.experience);
    
    const matchingKeywords = jobKeywords.filter(keyword => 
      experienceKeywords.includes(keyword)
    );
    
    if (jobKeywords.length > 0) {
      matchDetails.experienceMatch = matchingKeywords.length / jobKeywords.length;
      totalScore += matchDetails.experienceMatch * 0.1; // 10% weight for experience match
    }
    maxPossibleScore += 0.1;
  }
  
  // Normalize score if we have any criteria
  const normalizedScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
  
  return {
    score: normalizedScore,
    matchPercentage: Math.round(normalizedScore * 100),
    matchDetails,
    distance
  };
};

/**
 * Extract keywords from text by removing stop words and normalizing
 * @param text Text to extract keywords from
 * @returns Array of keywords
 */
const extractKeywords = (text: string): string[] => {
  if (!text) return [];
  
  // Common stop words to filter out
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
    'be', 'been', 'being', 'to', 'of', 'for', 'with', 'by', 'about', 
    'against', 'between', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'from', 'up', 'down', 'in', 'out', 'on', 'off',
    'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
    'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
    'just', 'don', 'should', 'now'
  ]);
  
  // Normalize text: lowercase, remove punctuation, split into words
  const words = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .split(/\s+/);
  
  // Filter out stop words and words less than 3 characters
  return words
    .filter(word => !stopWords.has(word) && word.length > 2)
    .map(word => word.trim());
};

/**
 * Find the K nearest neighbors (most similar jobs) for a job seeker
 * @param jobSeeker The job seeker to find matches for
 * @param jobs List of all available jobs
 * @param k Number of nearest neighbors to return
 * @param maxDistance Optional maximum distance in kilometers
 * @returns Array of jobs sorted by similarity (highest first)
 */
export const findMatchingJobsForJobSeeker = async (
  jobSeeker: JobSeeker,
  jobs: Job[],
  k: number = 5,
  maxDistance?: number
): Promise<JobMatch[]> => {
  // Calculate similarity scores for all jobs
  const scoredJobsPromises = jobs.map(async job => ({
    job,
    ...(await calculateDetailedSimilarity(job, jobSeeker))
  }));
  
  // Wait for all similarity calculations to complete
  const scoredJobs = await Promise.all(scoredJobsPromises);
  
  // Filter by maximum distance if specified
  const filteredJobs = maxDistance
    ? scoredJobs.filter(job => job.distance === undefined || job.distance <= maxDistance)
    : scoredJobs;
  
  // Sort by score (descending) and take top k
  return filteredJobs
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
};

/**
 * Find the K nearest neighbors (most suitable candidates) for a job
 * @param job The job to find candidates for
 * @param jobSeekers List of all available job seekers
 * @param k Number of nearest neighbors to return
 * @param maxDistance Optional maximum distance in kilometers
 * @returns Array of job seekers sorted by similarity (highest first)
 */
export const findMatchingCandidatesForJob = async (
  job: Job,
  jobSeekers: JobSeeker[],
  k: number = 5,
  maxDistance?: number
): Promise<CandidateMatch[]> => {
  // Calculate similarity scores for all job seekers
  const scoredCandidatesPromises = jobSeekers.map(async jobSeeker => ({
    jobSeeker,
    ...(await calculateDetailedSimilarity(job, jobSeeker))
  }));
  
  // Wait for all similarity calculations to complete
  const scoredCandidates = await Promise.all(scoredCandidatesPromises);
  
  // Filter by maximum distance if specified
  const filteredCandidates = maxDistance
    ? scoredCandidates.filter(candidate => candidate.distance === undefined || candidate.distance <= maxDistance)
    : scoredCandidates;
  
  // Sort by score (descending) and take top k
  return filteredCandidates
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
};

/**
 * Filter jobs by precise proximity to a location
 * @param jobs List of jobs to filter
 * @param coordinates Reference coordinates (usually job seeker's location)
 * @param maxDistance Maximum distance in kilometers
 * @returns Promise resolving to filtered jobs with calculated distances
 */
export const filterJobsByProximity = async (
  jobs: Job[],
  coordinates: Coordinates,
  maxDistance: number
): Promise<Array<Job & { distance: number }>> => {
  // Process jobs in parallel
  const jobsWithDistancePromises = jobs.map(async job => {
    // Get job coordinates if not already available
    const jobCoords = job.coordinates || await geocodeAddress(job.location);
    
    // Skip jobs that couldn't be geocoded
    if (!jobCoords) return null;
    
    // Calculate distance
    const distance = calculateDistance(coordinates, jobCoords);
    
    // Include job with its distance
    return { ...job, distance };
  });
  
  // Wait for all distance calculations to complete
  const jobsWithDistance = (await Promise.all(jobsWithDistancePromises))
    .filter((job): job is (Job & { distance: number }) => job !== null);
  
  // Filter by maximum distance
  return jobsWithDistance.filter(job => job.distance <= maxDistance);
};
