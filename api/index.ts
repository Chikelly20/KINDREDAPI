/**
 * K-NN Job Matching API
 * Main entry point for the job matching API
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { matchCandidatesForJob, matchJobsForJobSeeker, calculateMatchScore } from './routes/jobMatching';

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.post('/jobs/match-candidates', matchCandidatesForJob);
app.post('/jobseekers/match-jobs', matchJobsForJobSeeker);
app.post('/match', calculateMatchScore);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'K-NN Job Matching API is running' });
});

// Documentation endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'K-NN Job Matching API',
    version: '1.0.0',
    description: 'API for matching jobs and candidates using K-Nearest Neighbors algorithm',
    endpoints: [
      {
        path: '/jobs/match-candidates',
        method: 'POST',
        description: 'Find matching candidates for a job',
        body: {
          jobId: 'string (required)',
          k: 'number (optional, default: 5)'
        }
      },
      {
        path: '/jobseekers/match-jobs',
        method: 'POST',
        description: 'Find matching jobs for a job seeker',
        body: {
          jobSeekerId: 'string (required)',
          k: 'number (optional, default: 5)'
        }
      },
      {
        path: '/match',
        method: 'POST',
        description: 'Calculate match score between a job and job seeker',
        body: {
          job: 'Job object (required)',
          jobSeeker: 'JobSeeker object (required)'
        }
      }
    ]
  });
});

// Export for serverless environments
export default app;

// Start server if running directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`K-NN Job Matching API running on port ${PORT}`);
  });
}
