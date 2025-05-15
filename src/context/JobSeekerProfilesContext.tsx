import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

// Define the job seeker profile interface
export interface JobSeekerProfile {
  id: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  location?: string;
  phoneNumber?: string;
  resumeURL?: string;
  userType?: string;
  [key: string]: any;
}

interface JobSeekerProfilesContextType {
  profiles: Record<string, JobSeekerProfile>;
  loading: boolean;
  error: string | null;
  getProfile: (userId: string) => Promise<JobSeekerProfile | null>;
  refreshProfiles: () => Promise<void>;
}

const JobSeekerProfilesContext = createContext<JobSeekerProfilesContextType | undefined>(undefined);

export const JobSeekerProfilesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Record<string, JobSeekerProfile>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch a profile and add it to the cache
  const getProfile = async (userId: string): Promise<JobSeekerProfile | null> => {
    // If we already have the profile in state, return it
    if (profiles[userId]) {
      return profiles[userId];
    }

    setLoading(true);
    try {
      // Try to get from chats collection to find the job seeker name
      let jobSeekerName = 'Job Seeker';
      try {
        // Query chats where this user is the job seeker
        const chatsRef = collection(db, 'chats');
        const chatsQuery = query(chatsRef, where('jobSeekerId', '==', userId));
        const chatsSnap = await getDocs(chatsQuery);
        
        if (!chatsSnap.empty) {
          // Get the first chat document that has this job seeker
          const chatDoc = chatsSnap.docs[0];
          const chatData = chatDoc.data();
          
          // Use the job seeker name from the chat if available
          if (chatData.jobSeekerName) {
            jobSeekerName = chatData.jobSeekerName;
          }
        }
      } catch (chatError) {
        console.warn('Error fetching job seeker name from chats:', chatError);
        // Continue with default name
      }
      
      // Create a minimal profile with the information we have
      const minimalProfile: JobSeekerProfile = {
        id: userId,
        displayName: jobSeekerName,
        email: '',
        skills: [],
        bio: 'No additional information available for this job seeker.'
      };
      
      // Update the profiles state with the minimal profile
      setProfiles(prev => ({
        ...prev,
        [userId]: minimalProfile
      }));
      
      setLoading(false);
      return minimalProfile;
    } catch (error) {
      console.error('Error in getProfile:', error);
      setError('Failed to load profile');
      setLoading(false);
      return null;
    }
  };

  // Function to refresh profiles (simplified to avoid permission issues)
  const refreshProfiles = async (): Promise<void> => {
    // Just reset the loading and error states
    setLoading(false);
    setError(null);
    return Promise.resolve();
  };

  // No initial load needed
  useEffect(() => {
    // Nothing to do on initial load
  }, []);

  return (
    <JobSeekerProfilesContext.Provider
      value={{
        profiles,
        loading,
        error,
        getProfile,
        refreshProfiles
      }}
    >
      {children}
    </JobSeekerProfilesContext.Provider>
  );
};

// Custom hook to use the context
export const useJobSeekerProfiles = () => {
  const context = useContext(JobSeekerProfilesContext);
  if (context === undefined) {
    throw new Error('useJobSeekerProfiles must be used within a JobSeekerProfilesProvider');
  }
  return context;
};
