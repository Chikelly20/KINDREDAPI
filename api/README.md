# K-NN Job Matching API

A K-Nearest Neighbors (K-NN) based job matching API for the KINDRED-FRESH application.

## Overview

This API implements the K-NN algorithm to provide intelligent job matching between job seekers and job postings. It helps:

- Job seekers find the most relevant job opportunities based on their skills and experience
- Employers identify the most suitable candidates for their job postings
- Calculate detailed match scores between jobs and candidates

## API Structure

```
api/
├── models/          # Type definitions
│   └── types.ts
├── utils/           # Algorithm implementation
│   └── knn.ts
├── services/        # Data access layer
│   └── firestore.ts
├── routes/          # API route handlers
│   └── jobMatching.ts
└── index.ts         # Main entry point
```

## API Endpoints

### 1. Match Candidates to Job

`POST /jobs/match-candidates`

**Request Body:**
```json
{
  "jobId": "job123",
  "k": 5
}
```

**Response:**
```json
{
  "success": true,
  "job": { /* job details */ },
  "matchingCandidates": [
    {
      "jobSeeker": { /* job seeker details */ },
      "score": 0.85,
      "matchPercentage": 85,
      "matchDetails": {
        "skillsMatch": 0.9,
        "locationMatch": 1,
        "experienceMatch": 0.7,
        "descriptionMatch": 0.6
      }
    }
    // More candidates...
  ],
  "totalCandidates": 5
}
```

### 2. Match Jobs to Job Seeker

`POST /jobseekers/match-jobs`

**Request Body:**
```json
{
  "jobSeekerId": "seeker123",
  "k": 5
}
```

**Response:**
```json
{
  "success": true,
  "jobSeeker": { /* job seeker details */ },
  "matchingJobs": [
    {
      "job": { /* job details */ },
      "score": 0.85,
      "matchPercentage": 85,
      "matchDetails": {
        "skillsMatch": 0.9,
        "locationMatch": 1,
        "experienceMatch": 0.7,
        "descriptionMatch": 0.6
      }
    }
    // More jobs...
  ],
  "totalJobs": 5
}
```

### 3. Direct Match

`POST /match`

**Request Body:**
```json
{
  "job": {
    "title": "Frontend Developer",
    "location": "San Francisco, CA",
    "description": "We're looking for a skilled Frontend Developer...",
    "requirements": ["React", "JavaScript", "CSS"]
    // Other job details...
  },
  "jobSeeker": {
    "skills": ["React", "Vue", "JavaScript"],
    "location": "San Francisco",
    "experience": "5 years of frontend development..."
    // Other job seeker details...
  }
}
```

**Response:**
```json
{
  "success": true,
  "job": { /* job details */ },
  "jobSeeker": { /* job seeker details */ },
  "match": {
    "score": 0.85,
    "matchPercentage": 85,
    "matchDetails": {
      "skillsMatch": 0.9,
      "locationMatch": 1,
      "experienceMatch": 0.7,
      "descriptionMatch": 0.6
    }
  }
}
```

## Algorithm Details

The K-NN algorithm implementation uses the following features for matching:

- **Skills Match (50%)**: Compares job requirements with job seeker skills
- **Location Match (20%)**: Checks if the job location matches the job seeker's location
- **Description Match (20%)**: Analyzes keywords in job description and job seeker's bio
- **Experience Match (10%)**: Compares job requirements with job seeker's experience

The algorithm uses text processing techniques like stop word removal and keyword extraction to improve matching accuracy.

## Integration with KINDRED-FRESH

This API is designed to be integrated directly with the KINDRED-FRESH application. You can:

1. Deploy it as a standalone API service
2. Integrate it directly into your existing backend
3. Use it as a serverless function

## Usage Examples

```typescript
// Example: Find matching jobs for a job seeker
async function getRecommendedJobs(jobSeekerId) {
  try {
    const response = await fetch('/api/jobseekers/match-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobSeekerId }),
    });
    
    const data = await response.json();
    return data.matchingJobs;
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    throw error;
  }
}
```
