/**
 * Job matching API routes
 * Implements endpoints for job-candidate matching using K-NN algorithm
 * with precise proximity-based filtering
 */

import { Request, Response } from 'express';
import { getJobById, getJobSeekerById, getAllJobs, getAllJobSeekers } from '../services/firestore';
import { 
  findMatchingJobsForJobSeeker, 
  findMatchingCandidatesForJob, 
  calculateDetailedSimilarity,
  filterJobsByProximity 
} from '../utils/knn';
import { Job, JobSeeker } from '../models/types';
import { geocodeAddress } from '../utils/geocoding';

/**
 * Find matching candidates for a job
 * @param req Express request object with jobId in body
 * @param res Express response object
 */
export const matchCandidatesForJob = async (req: Request, res: Response) => {
  try {
    const { jobId, k = 5, maxDistance } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Get the job from Firestore
    const job = await getJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Geocode the job location if coordinates aren't available
    if (job.location && !job.coordinates) {
      job.coordinates = await geocodeAddress(job.location);
    }

    // Get all job seekers from Firestore
    const jobSeekers = await getAllJobSeekers();

    // Find matching candidates using K-NN algorithm with precise proximity
    const matchingCandidates = await findMatchingCandidatesForJob(
      job, 
      jobSeekers, 
      Number(k),
      maxDistance ? Number(maxDistance) : undefined
    );

    // Return the results
    return res.status(200).json({
      success: true,
      job,
      matchingCandidates,
      totalCandidates: matchingCandidates.length
    });
  } catch (error) {
    console.error('Error in matchCandidatesForJob:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Find matching jobs for a job seeker
 * @param req Express request object with jobSeekerId in body
 * @param res Express response object
 */
export const matchJobsForJobSeeker = async (req: Request, res: Response) => {
  try {
    const { jobSeekerId, k = 5, maxDistance } = req.body;

    if (!jobSeekerId) {
      return res.status(400).json({ error: 'Job seeker ID is required' });
    }

    // Get the job seeker from Firestore
    const jobSeeker = await getJobSeekerById(jobSeekerId);
    if (!jobSeeker) {
      return res.status(404).json({ error: 'Job seeker not found' });
    }

    // Geocode the job seeker's location if coordinates aren't available
    if (jobSeeker.location && !jobSeeker.coordinates) {
      jobSeeker.coordinates = await geocodeAddress(jobSeeker.location);
    }

    // Get all jobs from Firestore
    const jobs = await getAllJobs();

    // Use provided maxDistance or job seeker's preference or default
    const proximityDistance = maxDistance ? Number(maxDistance) : (jobSeeker.maxDistance || undefined);

    // Find matching jobs using K-NN algorithm with precise proximity
    const matchingJobs = await findMatchingJobsForJobSeeker(
      jobSeeker, 
      jobs, 
      Number(k),
      proximityDistance
    );

    // Return the results
    return res.status(200).json({
      success: true,
      jobSeeker,
      matchingJobs,
      totalJobs: matchingJobs.length
    });
  } catch (error) {
    console.error('Error in matchJobsForJobSeeker:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Calculate direct match score between a job and job seeker
 * @param req Express request object with job and jobSeeker objects
 * @param res Express response object
 */
export const calculateMatchScore = async (req: Request, res: Response) => {
  try {
    const { job, jobSeeker } = req.body;

    if (!job || !jobSeeker) {
      return res.status(400).json({ 
        error: 'Both job and jobSeeker objects are required',
        required: {
          job: 'Job object with title, description, requirements, etc.',
          jobSeeker: 'JobSeeker object with skills, experience, etc.'
        }
      });
    }

    // Geocode locations if coordinates aren't available
    if (job.location && !job.coordinates) {
      job.coordinates = await geocodeAddress(job.location);
    }
    
    if (jobSeeker.location && !jobSeeker.coordinates) {
      jobSeeker.coordinates = await geocodeAddress(jobSeeker.location);
    }

    // Calculate match score using K-NN algorithm with precise proximity
    const matchResult = await calculateDetailedSimilarity(job as Job, jobSeeker as JobSeeker);

    // Return the results
    return res.status(200).json({
      success: true,
      job,
      jobSeeker,
      match: matchResult
    });
  } catch (error) {
    console.error('Error in calculateMatchScore:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Filter jobs by proximity to a location
 * @param req Express request object with location coordinates and max distance
 * @param res Express response object
 */
export const filterJobsByDistance = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, maxDistance = 50 } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        error: 'Coordinates are required',
        required: {
          latitude: 'Latitude coordinate (number)',
          longitude: 'Longitude coordinate (number)',
          maxDistance: 'Maximum distance in kilometers (optional, default: 50)'
        }
      });
    }

    // Get all jobs from Firestore
    const jobs = await getAllJobs();

    // Filter jobs by proximity
    const nearbyJobs = await filterJobsByProximity(
      jobs,
      { latitude: Number(latitude), longitude: Number(longitude) },
      Number(maxDistance)
    );

    // Return the results
    return res.status(200).json({
      success: true,
      nearbyJobs,
      totalJobs: nearbyJobs.length,
      filters: {
        coordinates: { latitude, longitude },
        maxDistance
      }
    });
  } catch (error) {
    console.error('Error in filterJobsByDistance:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
