import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import { auth, db, firestore } from '../services/firebase';
import firebase from 'firebase/compat/app';

type UserType = 'jobseeker' | 'employer' | null;
type JobSeekerType = 'formal' | 'informal' | null;

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  userType: UserType;
  jobSeekerType?: JobSeekerType;
  photoURL?: string | null;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUserType: (userType: UserType) => Promise<void>;
  setJobSeekerType: (jobSeekerType: JobSeekerType) => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
        
        const baseUserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUser({
            ...baseUserData,
            userType: userData?.userType || null,
            jobSeekerType: userData?.jobSeekerType || null
          });
        } else {
          setUser({
            ...baseUserData,
            userType: null
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Create user with email and password
      const result = await auth.createUserWithEmailAndPassword(email, password);
      const currentUser = result.user;
      
      // Safety check
      if (!currentUser) {
        throw new Error('Failed to create user');
      }
      
      // Update the user's profile
      await currentUser.updateProfile({ displayName: name });
      
      // Create user document in Firestore
      await db.collection('users').doc(currentUser.uid).set({
        email,
        displayName: name,
        userType: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Google sign-in removed to fix compatibility issues

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const setUserType = async (userType: UserType) => {
    if (!user) return;
    
    try {
      await db.collection('users').doc(user.uid).update({ userType });
      setUser({ ...user, userType });
    } catch (error) {
      console.error('Error setting user type:', error);
      throw error;
    }
  };

  const setJobSeekerType = async (jobSeekerType: JobSeekerType) => {
    if (!user) return;
    
    try {
      await db.collection('users').doc(user.uid).update({ jobSeekerType });
      setUser({ ...user, jobSeekerType });
    } catch (error) {
      console.error('Error setting job seeker type:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!user) return;
    
    try {
      await db.collection('users').doc(user.uid).update(data);
      setUser({ ...user, ...data });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    setUserType,
    setJobSeekerType,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 