import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import { auth, db, firestore } from '../services/firebase';
import firebase from 'firebase/compat/app';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Register the redirect URI handler for web browser authentication
WebBrowser.maybeCompleteAuthSession();

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
  signInWithGoogle: (userType?: UserType) => Promise<void>;
  signOut: () => Promise<void>;
  setUserType: (userType: UserType) => Promise<void>;
  setJobSeekerType: (jobSeekerType: JobSeekerType) => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
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
  
  // Initialize Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '449864304937-1oi9k9ql8t3vdmf6j5hn1v2c3g4qcpbm.apps.googleusercontent.com', // Web client ID
    iosClientId: 'IOS_CLIENT_ID', // Replace with your iOS client ID if needed
    androidClientId: 'ANDROID_CLIENT_ID', // Replace with your Android client ID if needed
  });
  
  // Handle Google Auth Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = firebase.auth.GoogleAuthProvider.credential(id_token);
      auth.signInWithCredential(credential).catch(error => {
        console.error('Error signing in with Google credential:', error);
      });
    }
  }, [response]);

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

  const signInWithGoogle = async (userType: UserType = null) => {
    try {
      // Start the Google Sign-In flow
      const result = await promptAsync();
      
      if (result.type !== 'success') {
        throw new Error('Google sign-in was cancelled or failed');
      }
      
      // The actual authentication is handled in the useEffect hook above
      // that watches for response changes
      
      // We'll update the user type if provided
      if (userType && auth.currentUser) {
        const userRef = db.collection('users').doc(auth.currentUser.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
          // For new users, create a profile with the provided userType
          await userRef.set({
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName,
            photoURL: auth.currentUser.photoURL,
            userType: userType,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            authProvider: 'google'
          });
        } else {
          // If user exists but userType is not set, update it
          const userData = userDoc.data();
          if (!userData?.userType) {
            await userRef.update({ userType });
          }
        }
      }
      
      return;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Handle specific errors
      if (error.code === 'auth/account-exists-with-different-credential') {
        Alert.alert(
          'Account Exists', 
          'An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.'
        );
      } else {
        Alert.alert(
          'Sign In Error', 
          'Failed to sign in with Google. Please try again later.'
        );
      }
      
      throw error;
    }
  };

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

  const deleteAccount = async (password: string) => {
    if (!user || !auth.currentUser) return;
    
    try {
      // Re-authenticate the user before deleting the account
      const credential = firebase.auth.EmailAuthProvider.credential(
        auth.currentUser.email || '', 
        password
      );
      
      await auth.currentUser.reauthenticateWithCredential(credential);
      
      // Delete user data from Firestore based on user type
      const batch = db.batch();
      
      // Delete user document
      const userRef = db.collection('users').doc(user.uid);
      batch.delete(userRef);
      
      // Delete related data based on user type
      if (user.userType === 'jobseeker') {
        // Delete job applications
        const applicationsSnapshot = await db.collection('applications')
          .where('jobSeekerId', '==', user.uid)
          .get();
          
        applicationsSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        // Delete job seeker profile
        const profileSnapshot = await db.collection('jobSeekerProfiles')
          .where('userId', '==', user.uid)
          .get();
          
        profileSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
      } else if (user.userType === 'employer') {
        // Delete job postings
        const jobsSnapshot = await db.collection('jobs')
          .where('employerId', '==', user.uid)
          .get();
          
        jobsSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        // Delete company profile
        const companySnapshot = await db.collection('companies')
          .where('ownerId', '==', user.uid)
          .get();
          
        companySnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
      }
      
      // Commit the batch deletion
      await batch.commit();
      
      // Finally, delete the user authentication account
      await auth.currentUser.delete();
      
      // User will be automatically signed out and the onAuthStateChanged listener will update the state
    } catch (error: any) {
      console.error('Error deleting account:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Authentication Required', 
          'Please sign out and sign in again before deleting your account.'
        );
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Incorrect Password', 'The password you entered is incorrect.');
      } else {
        Alert.alert(
          'Error', 
          'Failed to delete your account. Please try again later.'
        );
      }
      
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    setUserType,
    setJobSeekerType,
    updateUserProfile,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 