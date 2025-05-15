// Script to populate the Firebase database with mock data using Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// Mock data for job seekers
const mockJobSeekers = [
  {
    displayName: "John Smith",
    email: "john.smith@example.com",
    photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
    bio: "Experienced software developer with 5+ years in web development. Passionate about creating user-friendly applications.",
    skills: ["JavaScript", "React", "Node.js", "HTML", "CSS"],
    experience: "Senior Developer at Tech Solutions (2018-Present), Junior Developer at WebCraft (2015-2018)",
    education: "Bachelor's in Computer Science, University of Technology (2015)",
    location: "San Francisco, CA",
    phoneNumber: "+1 (555) 123-4567",
    userType: "jobseeker"
  },
  {
    displayName: "Emily Johnson",
    email: "emily.johnson@example.com",
    photoURL: "https://randomuser.me/api/portraits/women/2.jpg",
    bio: "Creative graphic designer with a keen eye for detail and a passion for innovative design solutions.",
    skills: ["Adobe Photoshop", "Illustrator", "InDesign", "UI/UX Design", "Branding"],
    experience: "Lead Designer at Creative Studios (2019-Present), Designer at ArtWorks (2017-2019)",
    education: "BFA in Graphic Design, Art Institute (2017)",
    location: "New York, NY",
    phoneNumber: "+1 (555) 234-5678",
    userType: "jobseeker"
  },
  {
    displayName: "Michael Chen",
    email: "michael.chen@example.com",
    photoURL: "https://randomuser.me/api/portraits/men/3.jpg",
    bio: "Marketing specialist with expertise in digital campaigns and social media strategy.",
    skills: ["Digital Marketing", "Social Media Management", "SEO", "Content Creation", "Analytics"],
    experience: "Marketing Manager at Global Brand (2020-Present), Marketing Coordinator at Local Business (2018-2020)",
    education: "MBA in Marketing, Business School (2018)",
    location: "Chicago, IL",
    phoneNumber: "+1 (555) 345-6789",
    userType: "jobseeker"
  }
];

// Mock data for employers
const mockEmployers = [
  {
    displayName: "Tech Innovations Inc.",
    email: "hr@techinnovations.example.com",
    photoURL: "https://randomuser.me/api/portraits/men/4.jpg",
    bio: "Leading technology company specializing in software solutions for businesses of all sizes.",
    location: "San Francisco, CA",
    phoneNumber: "+1 (555) 456-7890",
    userType: "employer",
    companySize: "50-100 employees",
    industry: "Technology"
  },
  {
    displayName: "Creative Designs Co.",
    email: "jobs@creativedesigns.example.com",
    photoURL: "https://randomuser.me/api/portraits/women/5.jpg",
    bio: "Award-winning design agency creating stunning visual identities for brands worldwide.",
    location: "New York, NY",
    phoneNumber: "+1 (555) 567-8901",
    userType: "employer",
    companySize: "10-50 employees",
    industry: "Design"
  }
];

// Mock job listings
const mockJobs = [
  {
    title: "Frontend Developer",
    location: "San Francisco, CA",
    salary: "$80,000 - $100,000",
    workingDays: "Monday to Friday",
    workingHours: "9:00 AM - 5:00 PM",
    description: "We're looking for a skilled Frontend Developer to join our team. The ideal candidate has experience with React and modern JavaScript frameworks.",
    requirements: ["3+ years of experience with React", "Strong JavaScript skills", "Experience with responsive design", "Bachelor's degree in Computer Science or related field"],
    benefits: ["Health insurance", "401(k) matching", "Flexible working hours", "Remote work options"],
    employerId: "", // Will be populated with actual employer ID
    employerName: "Tech Innovations Inc.",
    applicantsCount: 2
  },
  {
    title: "Graphic Designer",
    location: "New York, NY",
    salary: "$60,000 - $75,000",
    workingDays: "Monday to Friday",
    workingHours: "10:00 AM - 6:00 PM",
    description: "Creative Designs Co. is seeking a talented Graphic Designer to create visual concepts for our clients. You'll work on branding, marketing materials, and digital assets.",
    requirements: ["Portfolio demonstrating design skills", "Proficiency in Adobe Creative Suite", "2+ years of professional design experience", "Bachelor's degree in Graphic Design or related field"],
    benefits: ["Health and dental insurance", "Paid time off", "Creative work environment", "Professional development opportunities"],
    employerId: "", // Will be populated with actual employer ID
    employerName: "Creative Designs Co.",
    applicantsCount: 1
  },
  {
    title: "Marketing Specialist",
    location: "Chicago, IL",
    salary: "$65,000 - $85,000",
    workingDays: "Monday to Friday",
    workingHours: "9:00 AM - 5:00 PM",
    description: "Join our marketing team to develop and implement digital marketing strategies that drive growth and engagement.",
    requirements: ["Experience with digital marketing campaigns", "Knowledge of SEO and content marketing", "Analytical skills for tracking campaign performance", "Bachelor's degree in Marketing or related field"],
    benefits: ["Competitive salary", "Health benefits", "Flexible schedule", "Professional development budget"],
    employerId: "", // Will be populated with actual employer ID
    employerName: "Tech Innovations Inc.",
    applicantsCount: 3
  }
];

// Mock applications/chats
const mockApplications = [
  {
    jobId: "", // Will be populated with actual job ID
    jobTitle: "Frontend Developer",
    jobSeekerId: "", // Will be populated with actual job seeker ID
    jobSeekerName: "John Smith",
    employerId: "", // Will be populated with actual employer ID
    employerName: "Tech Innovations Inc.",
    status: "applied",
    messages: [
      {
        senderId: "", // Will be populated with job seeker ID
        senderName: "John Smith",
        content: "Hello, I'm very interested in the Frontend Developer position. I have 5 years of experience with React.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        senderId: "", // Will be populated with employer ID
        senderName: "Tech Innovations Inc.",
        content: "Hi John, thanks for your interest! Your experience sounds great. When would you be available for an interview?",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        senderId: "", // Will be populated with job seeker ID
        senderName: "John Smith",
        content: "I'm available any day next week in the afternoon. Looking forward to discussing the opportunity!",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ]
  },
  {
    jobId: "", // Will be populated with actual job ID
    jobTitle: "Graphic Designer",
    jobSeekerId: "", // Will be populated with actual job seeker ID
    jobSeekerName: "Emily Johnson",
    employerId: "", // Will be populated with actual employer ID
    employerName: "Creative Designs Co.",
    status: "applied",
    messages: [
      {
        senderId: "", // Will be populated with job seeker ID
        senderName: "Emily Johnson",
        content: "Hello, I'd like to apply for the Graphic Designer position. I've attached my portfolio for your review.",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        senderId: "", // Will be populated with employer ID
        senderName: "Creative Designs Co.",
        content: "Hi Emily, thank you for your application. Your portfolio looks impressive! Can we schedule a call to discuss your experience?",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        senderId: "", // Will be populated with job seeker ID
        senderName: "Emily Johnson",
        content: "That sounds great! I'm available tomorrow between 1-5pm or anytime on Friday.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ]
  },
  {
    jobId: "", // Will be populated with actual job ID
    jobTitle: "Marketing Specialist",
    jobSeekerId: "", // Will be populated with actual job seeker ID
    jobSeekerName: "Michael Chen",
    employerId: "", // Will be populated with actual employer ID
    employerName: "Tech Innovations Inc.",
    status: "applied",
    messages: [
      {
        senderId: "", // Will be populated with job seeker ID
        senderName: "Michael Chen",
        content: "I'm interested in the Marketing Specialist position. I have experience with digital marketing and social media campaigns.",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        senderId: "", // Will be populated with employer ID
        senderName: "Tech Innovations Inc.",
        content: "Hi Michael, thanks for your interest. Could you tell us more about your experience with SEO and content marketing?",
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
      },
      {
        senderId: "", // Will be populated with job seeker ID
        senderName: "Michael Chen",
        content: "I've managed SEO strategies for several companies, improving their search rankings by an average of 30%. I've also created content marketing plans that increased engagement by 25%.",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        senderId: "", // Will be populated with employer ID
        senderName: "Tech Innovations Inc.",
        content: "That's impressive! We'd like to schedule an interview. Are you available next Monday or Tuesday?",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        senderId: "", // Will be populated with job seeker ID
        senderName: "Michael Chen",
        content: "Tuesday would work perfectly for me. What time works best for you?",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ]
  }
];

// Function to check if users already exist
async function checkExistingUsers() {
  const jobSeekerEmails = mockJobSeekers.map(js => js.email);
  const employerEmails = mockEmployers.map(emp => emp.email);
  
  const usersRef = db.collection('users');
  const existingUsers = {};
  
  // Check for existing job seekers
  for (const email of jobSeekerEmails) {
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        existingUsers[email] = doc.id;
        console.log(`Found existing job seeker: ${email} with ID: ${doc.id}`);
      });
    }
  }
  
  // Check for existing employers
  for (const email of employerEmails) {
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        existingUsers[email] = doc.id;
        console.log(`Found existing employer: ${email} with ID: ${doc.id}`);
      });
    }
  }
  
  return existingUsers;
}

// Main function to populate the database
async function populateDatabase() {
  try {
    console.log('Starting database population...');
    
    // Check for existing users
    const existingUsers = await checkExistingUsers();
    const userIds = {};
    
    // Add job seekers
    for (const jobSeeker of mockJobSeekers) {
      if (existingUsers[jobSeeker.email]) {
        userIds[jobSeeker.email] = existingUsers[jobSeeker.email];
        console.log(`Using existing job seeker: ${jobSeeker.displayName}`);
      } else {
        const newUserId = `jobseeker_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        await db.collection('users').doc(newUserId).set({
          ...jobSeeker,
          createdAt: FieldValue.serverTimestamp()
        });
        userIds[jobSeeker.email] = newUserId;
        console.log(`Added job seeker: ${jobSeeker.displayName}`);
      }
    }
    
    // Add employers
    for (const employer of mockEmployers) {
      if (existingUsers[employer.email]) {
        userIds[employer.email] = existingUsers[employer.email];
        console.log(`Using existing employer: ${employer.displayName}`);
      } else {
        const newUserId = `employer_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        await db.collection('users').doc(newUserId).set({
          ...employer,
          createdAt: FieldValue.serverTimestamp()
        });
        userIds[employer.email] = newUserId;
        console.log(`Added employer: ${employer.displayName}`);
      }
    }
    
    // Map employer names to IDs
    const employerNameToId = {};
    for (const employer of mockEmployers) {
      employerNameToId[employer.displayName] = userIds[employer.email];
    }
    
    // Add jobs
    const jobIds = {};
    for (const job of mockJobs) {
      const employerId = employerNameToId[job.employerName];
      if (employerId) {
        job.employerId = employerId;
        const jobId = `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        await db.collection('jobs').doc(jobId).set({
          ...job,
          createdAt: FieldValue.serverTimestamp()
        });
        jobIds[job.title] = jobId;
        console.log(`Added job: ${job.title}`);
      } else {
        console.log(`Could not find employer ID for ${job.employerName}`);
      }
    }
    
    // Add applications/chats
    for (const application of mockApplications) {
      // Set job ID
      application.jobId = jobIds[application.jobTitle];
      
      // Set employer ID
      application.employerId = employerNameToId[application.employerName];
      
      // Find job seeker ID
      const jobSeekerInfo = mockJobSeekers.find(js => js.displayName === application.jobSeekerName);
      if (jobSeekerInfo) {
        application.jobSeekerId = userIds[jobSeekerInfo.email];
        
        // Update message sender IDs
        application.messages.forEach(message => {
          if (message.senderName === application.jobSeekerName) {
            message.senderId = application.jobSeekerId;
          } else {
            message.senderId = application.employerId;
          }
        });
        
        // Create chat document
        const chatId = `chat_${application.jobSeekerId}_${application.employerId}_${application.jobId}`;
        
        // Get the last message
        const lastMessage = application.messages[application.messages.length - 1];
        
        await db.collection('chats').doc(chatId).set({
          jobId: application.jobId,
          jobTitle: application.jobTitle,
          jobSeekerId: application.jobSeekerId,
          jobSeekerName: application.jobSeekerName,
          employerId: application.employerId,
          employerName: application.employerName,
          status: application.status,
          lastMessage: lastMessage.content,
          lastMessageAt: lastMessage.timestamp,
          createdAt: application.messages[0].timestamp,
          updatedAt: lastMessage.timestamp
        });
        
        // Add messages to the chat
        for (let i = 0; i < application.messages.length; i++) {
          const message = application.messages[i];
          const messageId = `message_${Date.now()}_${Math.floor(Math.random() * 1000)}_${i}`;
          
          await db.collection('chats').doc(chatId).collection('messages').doc(messageId).set({
            senderId: message.senderId,
            senderName: message.senderName,
            content: message.content,
            timestamp: message.timestamp,
            read: true
          });
        }
        
        console.log(`Added application/chat for ${application.jobSeekerName} to ${application.jobTitle}`);
      } else {
        console.log(`Could not find job seeker info for ${application.jobSeekerName}`);
      }
    }
    
    console.log('Database population completed successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

// Run the population script
populateDatabase();
