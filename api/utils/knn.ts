/**
 * K-Nearest Neighbors (K-NN) implementation for job matching
 * This utility helps find the most relevant jobs for job seekers
 * and the most suitable candidates for employers
 */

import { Job, JobSeeker, MatchingResult, JobMatch, CandidateMatch } from '../models/types';

/**
 * Calculate detailed similarity score between a job and a job seeker
 * @param job The job posting
 * @param jobSeeker The job seeker profile
 * @returns Detailed matching result with scores for different criteria
 */
export const calculateDetailedSimilarity = (job: Job, jobSeeker: JobSeeker): MatchingResult => {
  // Initialize match details
  const matchDetails = {
    skillsMatch: 0,
    locationMatch: 0,
    experienceMatch: 0,
    descriptionMatch: 0
  };
  
  let totalScore = 0;
  let maxPossibleScore = 0;
  
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
  
  // Location match
  if (job.location && jobSeeker.location) {
    // Simple string match for now, could be enhanced with geocoding
    if (job.location.toLowerCase().includes(jobSeeker.location.toLowerCase()) ||
        jobSeeker.location.toLowerCase().includes(job.location.toLowerCase())) {
      matchDetails.locationMatch = 1;
      totalScore += 0.2; // 20% weight for location
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
    matchDetails
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
 * @returns Array of jobs sorted by similarity (highest first)
 */
export const findMatchingJobsForJobSeeker = (
  jobSeeker: JobSeeker,
  jobs: Job[],
  k: number = 5
): JobMatch[] => {
  // Calculate similarity scores for all jobs
  const scoredJobs = jobs.map(job => ({
    job,
    ...calculateDetailedSimilarity(job, jobSeeker)
  }));
  
  // Sort by score (descending) and take top k
  return scoredJobs
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
};

/**
 * Find the K nearest neighbors (most suitable candidates) for a job
 * @param job The job to find candidates for
 * @param jobSeekers List of all available job seekers
 * @param k Number of nearest neighbors to return
 * @returns Array of job seekers sorted by similarity (highest first)
 */
export const findMatchingCandidatesForJob = (
  job: Job,
  jobSeekers: JobSeeker[],
  k: number = 5
): CandidateMatch[] => {
  // Calculate similarity scores for all job seekers
  const scoredCandidates = jobSeekers.map(jobSeeker => ({
    jobSeeker,
    ...calculateDetailedSimilarity(job, jobSeeker)
  }));
  
  // Sort by score (descending) and take top k
  return scoredCandidates
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
};
