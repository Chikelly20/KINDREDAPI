/**
 * Firestore service for the K-NN job matching API
 * Handles data access to Firebase Firestore database
 */

import { getFirestore, DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import '../config/firebase'; // This will initialize Firebase

const firestore = getFirestore();
import { Job, JobSeeker } from '../models/types';

/**
 * Get all jobs from Firestore
 * @returns Promise with array of jobs
 */
export const getAllJobs = async (): Promise<Job[]> => {
  try {
    const jobsSnapshot = await firestore.collection('jobs').get();
    return jobsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as Job));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

/**
 * Get a specific job by ID
 * @param jobId The ID of the job to fetch
 * @returns Promise with job data or null if not found
 */
export const getJobById = async (jobId: string): Promise<Job | null> => {
  try {
    const jobDoc = await firestore.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists) {
      return null;
    }
    return {
      id: jobDoc.id,
      ...jobDoc.data()
    } as Job;
  } catch (error: any) {
    console.error(`Error fetching job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Get all job seekers from Firestore
 * @returns Promise with array of job seekers
 */
export const getAllJobSeekers = async (): Promise<JobSeeker[]> => {
  try {
    const jobSeekersSnapshot = await firestore.collection('users')
      .where('userType', '==', 'jobseeker')
      .get();
    
    return jobSeekersSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as JobSeeker));
  } catch (error: any) {
    console.error('Error fetching job seekers:', error);
    throw error;
  }
};

/**
 * Get a specific job seeker by ID
 * @param jobSeekerId The ID of the job seeker to fetch
 * @returns Promise with job seeker data or null if not found
 */
export const getJobSeekerById = async (jobSeekerId: string): Promise<JobSeeker | null> => {
  try {
    const jobSeekerDoc = await firestore.collection('users').doc(jobSeekerId).get();
    if (!jobSeekerDoc.exists) {
      return null;
    }
    return {
      id: jobSeekerDoc.id,
      ...jobSeekerDoc.data()
    } as JobSeeker;
  } catch (error: any) {
    console.error(`Error fetching job seeker ${jobSeekerId}:`, error);
    throw error;
  }
};

/**
 * Get jobs posted by a specific employer
 * @param employerId The ID of the employer
 * @returns Promise with array of jobs
 */
export const getJobsByEmployerId = async (employerId: string): Promise<Job[]> => {
  try {
    const jobsSnapshot = await firestore.collection('jobs')
      .where('employerId', '==', employerId)
      .get();
    
    return jobsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data()
    } as Job));
  } catch (error: any) {
    console.error(`Error fetching jobs for employer ${employerId}:`, error);
    throw error;
  }
};
