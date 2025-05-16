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
  signUp: (email: string, password: string, name: string, userType?: UserType) => Promise<void>;
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

  const signUp = async (email: string, password: string, name: string, userType: UserType = null) => {
    // Maximum number of retry attempts
    const maxRetries = 3;
    // Initial delay in milliseconds (increases with each retry)
    let retryDelay = 1000;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
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
          userType: userType, // Use the provided userType instead of null
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return; // Success - exit the function
      } catch (error: any) {
        console.error(`Sign-up attempt ${attempt + 1} failed:`, error);
        
        // Check if it's a network error
        if (error.code === 'auth/network-request-failed') {
          // If this is the last attempt, throw the error
          if (attempt === maxRetries - 1) {
            Alert.alert(
              'Network Error',
              'Unable to connect to authentication servers. Please check your internet connection and try again.',
              [{ text: 'OK' }]
            );
            throw error;
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          // Increase the delay for next attempt (exponential backoff)
          retryDelay *= 1.5;
          // Continue to next retry attempt
          continue;
        }
        
        // For other errors, provide user-friendly messages
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Email In Use', 'This email address is already in use. Please use a different email or try logging in.');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Invalid Email', 'Please enter a valid email address.');
        } else if (error.code === 'auth/weak-password') {
          Alert.alert('Weak Password', 'Your password is too weak. Please use a stronger password with at least 6 characters.');
        } else {
          Alert.alert('Sign Up Error', 'An error occurred during sign up. Please try again later.');
        }
        
        throw error;
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    // Maximum number of retry attempts
    const maxRetries = 3;
    // Initial delay in milliseconds (increases with each retry)
    let retryDelay = 1000;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Attempt to sign in
        await auth.signInWithEmailAndPassword(email, password);
        return; // Success - exit the function
      } catch (error: any) {
        console.error(`Sign-in attempt ${attempt + 1} failed:`, error);
        
        // Check if it's a network error
        if (error.code === 'auth/network-request-failed') {
          // If this is the last attempt, throw the error
          if (attempt === maxRetries - 1) {
            Alert.alert(
              'Network Error',
              'Unable to connect to authentication servers. Please check your internet connection and try again.',
              [{ text: 'OK' }]
            );
            throw error;
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          // Increase the delay for next attempt (exponential backoff)
          retryDelay *= 1.5;
          // Continue to next retry attempt
          continue;
        }
        
        // For other errors, throw immediately
        if (error.code === 'auth/invalid-login-credentials' || 
            error.code === 'auth/invalid-email' || 
            error.code === 'auth/wrong-password') {
          Alert.alert('Authentication Error', 'Invalid email or password. Please try again.');
        } else if (error.code === 'auth/user-disabled') {
          Alert.alert('Account Disabled', 'This account has been disabled. Please contact support.');
        } else if (error.code === 'auth/too-many-requests') {
          Alert.alert('Too Many Attempts', 'Access to this account has been temporarily disabled due to many failed login attempts. Try again later or reset your password.');
        } else {
          Alert.alert('Authentication Error', 'An error occurred during sign in. Please try again later.');
        }
        
        throw error;
      }
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