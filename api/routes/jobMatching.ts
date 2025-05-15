/**
 * Job matching API routes
 * Implements endpoints for job-candidate matching using K-NN algorithm
 */

import { Request, Response } from 'express';
import { getJobById, getJobSeekerById, getAllJobs, getAllJobSeekers } from '../services/firestore';
import { findMatchingJobsForJobSeeker, findMatchingCandidatesForJob, calculateDetailedSimilarity } from '../utils/knn';
import { Job, JobSeeker } from '../models/types';

/**
 * Find matching candidates for a job
 * @param req Express request object with jobId in body
 * @param res Express response object
 */
export const matchCandidatesForJob = async (req: Request, res: Response) => {
  try {
    const { jobId, k = 5 } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Get the job from Firestore
    const job = await getJobById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get all job seekers from Firestore
    const jobSeekers = await getAllJobSeekers();

    // Find matching candidates using K-NN algorithm
    const matchingCandidates = findMatchingCandidatesForJob(job, jobSeekers, Number(k));

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
    const { jobSeekerId, k = 5 } = req.body;

    if (!jobSeekerId) {
      return res.status(400).json({ error: 'Job seeker ID is required' });
    }

    // Get the job seeker from Firestore
    const jobSeeker = await getJobSeekerById(jobSeekerId);
    if (!jobSeeker) {
      return res.status(404).json({ error: 'Job seeker not found' });
    }

    // Get all jobs from Firestore
    const jobs = await getAllJobs();

    // Find matching jobs using K-NN algorithm
    const matchingJobs = findMatchingJobsForJobSeeker(jobSeeker, jobs, Number(k));

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

    // Calculate match score using K-NN algorithm
    const matchResult = calculateDetailedSimilarity(job as Job, jobSeeker as JobSeeker);

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
