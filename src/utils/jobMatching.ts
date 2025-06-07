interface SkillVector {
  [key: string]: number;
}

interface JobScore {
  job: any;
  score: number;
}

// Convert text skills to a numeric vector
function createSkillVector(skills: string[]): SkillVector {
  const vector: SkillVector = {};
  skills.forEach(skill => {
    vector[skill.toLowerCase()] = 1;
  });
  return vector;
}

// Calculate cosine similarity between two skill vectors
function calculateCosineSimilarity(vector1: SkillVector, vector2: SkillVector): number {
  const keys = new Set([...Object.keys(vector1), ...Object.keys(vector2)]);
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  keys.forEach(key => {
    const val1 = vector1[key] || 0;
    const val2 = vector2[key] || 0;
    dotProduct += val1 * val2;
    norm1 += val1 * val1;
    norm2 += val2 * val2;
  });

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// Extract skills from job description using keywords
function extractSkillsFromJob(job: any): string[] {
  const skills: string[] = [];
  
  // Extract skills from job title and description
  const text = `${job.title} ${job.description}`.toLowerCase();
  
  // Common skills keywords
  const skillKeywords = [
    'excel', 'word', 'powerpoint', 'communication', 'teamwork', 'leadership',
    'project management', 'customer service', 'sales', 'marketing', 'accounting',
    'programming', 'javascript', 'python', 'java', 'react', 'angular', 'node',
    'database', 'sql', 'nosql', 'mongodb', 'analytics', 'data analysis',
    'problem solving', 'critical thinking', 'time management', 'organization',
    'writing', 'editing', 'research', 'presentation', 'negotiation',
    // Add more relevant skills based on your job market
  ];

  skillKeywords.forEach(skill => {
    if (text.includes(skill)) {
      skills.push(skill);
    }
  });

  return skills;
}

// Find best matching jobs using K-NN
// Enhanced: Hard-filter jobs by jobseeker's profile before K-NN scoring
export function findMatchingJobs(
  userProfile: any,
  jobs: any[],
  k: number = 5
): any[] {
  // DEBUG: Print user profile and jobs
  console.log('[KINDRED DEBUG] findMatchingJobs: userProfile:', JSON.stringify(userProfile, null, 2));
  console.log('[KINDRED DEBUG] findMatchingJobs: incoming jobs:', JSON.stringify(jobs.map(j => ({id: j.id, jobType: j.jobType, title: j.title, categories: j.categories})), null, 2));
  // 1. Hard filter jobs using profile preferences
  let filteredJobs = jobs;

  // Filter by preferred location (case-insensitive exact match)
  if (userProfile.preferredLocation) {
    filteredJobs = filteredJobs.filter(job =>
      job.location && job.location.toLowerCase() === userProfile.preferredLocation.toLowerCase()
    );
  }

  // Flexible filter for informal jobseekers
  if (userProfile.preferredJobType) {
    if (
      userProfile.preferredJobType.toLowerCase() === 'informal' ||
      (userProfile.jobSeekerType && userProfile.jobSeekerType.toLowerCase() === 'informal')
    ) {
      // For informal, match by jobType OR title OR categories (partial, case-insensitive)
      const before = filteredJobs.length;
      // Fallback keyword: preferredJobs[0], or jobSeeking, or first skill
      let keyword = (userProfile.preferredJobs?.[0] || '').toLowerCase();
      if (!keyword && userProfile.jobSeeking) keyword = userProfile.jobSeeking.toLowerCase();
      if (!keyword && Array.isArray(userProfile.skills) && userProfile.skills.length > 0) keyword = userProfile.skills[0].toLowerCase();
      if (keyword) {
        filteredJobs = filteredJobs.filter(job => {
          const jobTypeMatch = job.jobType && job.jobType.toLowerCase() === 'informal';
          const titleMatch = job.title && job.title.toLowerCase().includes(keyword);
          const categoriesMatch = Array.isArray(job.categories) && job.categories.some(cat => cat.toLowerCase().includes(keyword));
          return jobTypeMatch || titleMatch || categoriesMatch;
        });
      } else {
        // If no keyword, show all jobs for informal seekers
        filteredJobs = filteredJobs;
      }
      console.log(`[KINDRED DEBUG] findMatchingJobs: jobs after informal filter (${filteredJobs.length}/${before} remain):`, JSON.stringify(filteredJobs.map(j => ({id: j.id, jobType: j.jobType, title: j.title, categories: j.categories})), null, 2));
    } else {
      // Strict filter for formal
      filteredJobs = filteredJobs.filter(job =>
        job.jobType && job.jobType.toLowerCase() === userProfile.preferredJobType.toLowerCase()
      );
    }
  }

  // (Stub) Add more hard filters as needed, e.g. remote only, certifications, etc.
  // if (userProfile.remoteOnly) { ... }
  // if (userProfile.requiredCertifications) { ... }

  // Extract user skills based on profile type
  let userSkills: string[] = [];
  if (userProfile.skills) {
    userSkills = userProfile.skills;
  } else {
    // Extract skills from other profile fields
    const relevantFields = [
      userProfile.jobSeeking,
      userProfile.experience,
      userProfile.education,
      userProfile.certifications,
      userProfile.interests
    ].filter(Boolean);
    userSkills = relevantFields.reduce((acc: string[], field: string) => {
      const words = field.toLowerCase().split(/[\s,]+/);
      return [...acc, ...words];
    }, []);
  }

  const userVector = createSkillVector(userSkills);
  const jobScores: JobScore[] = [];

  // Calculate similarity scores for each job
  filteredJobs.forEach(job => {
    const jobSkills = extractSkillsFromJob(job);
    const jobVector = createSkillVector(jobSkills);
    const similarity = calculateCosineSimilarity(userVector, jobVector);

    // Additional matching factors
    let score = similarity;

    // Location matching (if available)
    if (userProfile.preferredLocation && job.location) {
      score *= userProfile.preferredLocation.toLowerCase() === job.location.toLowerCase() ? 1.2 : 0.8;
    }

    // Salary range matching (if available)
    if (userProfile.expectedSalary && job.salary) {
      const jobSalary = parseInt(job.salary.replace(/[^0-9]/g, ''));
      const userSalary = parseInt(userProfile.expectedSalary.replace(/[^0-9]/g, ''));
      if (!isNaN(jobSalary) && !isNaN(userSalary)) {
        score *= Math.abs(jobSalary - userSalary) < 5000 ? 1.2 : 0.8;
      }
    }

    // Work schedule matching (if available)
    if (userProfile.preferredWorkingHours && job.workingHours) {
      score *= userProfile.preferredWorkingHours === job.workingHours ? 1.2 : 0.8;
    }

    jobScores.push({ job, score });
  });

  // Sort by score and return top k matches
  return jobScores
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(item => item.job);
}
