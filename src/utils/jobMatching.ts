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
export function findMatchingJobs(
  userProfile: any,
  jobs: any[],
  k: number = 5
): any[] {
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
  jobs.forEach(job => {
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
