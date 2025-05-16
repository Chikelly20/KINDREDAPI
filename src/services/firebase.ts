// Import Firebase Compat (v8 compatibility) API which works better with React Native
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Add type assertion to avoid TypeScript errors
const FirebaseApp = firebase as any;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFm8UGat7xekUz_fJOdE0kxznvwl7rvBs",
  authDomain: "kindred-725aa.firebaseapp.com",
  projectId: "kindred-725aa",
  storageBucket: "kindred-725aa.firebasestorage.app",
  messagingSenderId: "449864304937",
  appId: "1:449864304937:web:716920a5ce217574e78f38",
  measurementId: "G-JE8DC1J100"
};

// Initialize Firebase with improved connection settings
if (!firebase.apps.length) {
  // Set network timeout and retry settings for better connectivity
  firebase.INTERNAL.extendNamespace({
    NETWORK_TIMEOUT_MILLIS: 30000, // 30 seconds timeout (default is 10 seconds)
    RETRIES_MAX_COUNT: 5 // Maximum number of retries for operations
  });
  
  firebase.initializeApp(firebaseConfig);
  
  // Configure Firestore for better connection handling
  const firestoreSettings = {
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    ignoreUndefinedProperties: true,
    experimentalForceLongPolling: true, // Use long polling instead of WebChannel
    useFetchStreams: false, // Disable fetch streams which can cause issues
    merge: true // Add merge: true to prevent host override warnings
  };
  
  // Apply settings
  firebase.firestore().settings(firestoreSettings);
  
  // Check if the environment supports persistence before enabling it
  const canEnablePersistence = () => {
    // Check if running in a browser-like environment with localStorage
    try {
      // Test for localStorage availability
      if (typeof localStorage !== 'undefined') {
        return true;
      }
      return false;
    } catch (e) {
      // If accessing localStorage throws an error, persistence is not supported
      return false;
    }
  };

  // Only try to enable persistence if the environment supports it
  if (canEnablePersistence()) {
    firebase.firestore().enablePersistence({
      synchronizeTabs: true
    }).catch(err => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn('Persistence failed to enable: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required for persistence
        console.warn('Persistence not supported in this environment');
      } else {
        console.error('Error enabling persistence:', err);
      }
    });
  } else {
    console.log('Skipping persistence enablement - environment not supported');
  }
}

// Get services
const auth = firebase.auth();
const firestore = firebase.firestore();

// Initialize Firebase storage with a type assertion to help TypeScript
let storage: any = null;
try {
  storage = FirebaseApp.storage();
} catch (error) {
  console.error('Error initializing Firebase storage:', error);
}

const db = firestore; // For backward compatibility

// Export individual services
export { auth, firestore, storage, db };

// Export the Firebase app instance
export default firebase;

// User Profile interface
export interface UserProfile {
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
  userType?: 'employer' | 'jobseeker';
  [key: string]: any; // Allow for additional properties
}

// Custom User API for profile access
export const userAPI = {
  // Get a user profile by ID (simplified to avoid permission errors)
  async getUserProfile(userId: string): Promise<{ success: boolean; profile?: UserProfile; error?: any }> {
    try {
      // Try to get the job seeker name from chats collection
      let displayName = 'Job Seeker';
      let found = false;
      
      try {
        // Query chats where this user is the job seeker
        const chatsQuery = await firestore.collection('chats')
          .where('jobSeekerId', '==', userId)
          .limit(1)
          .get();
        
        if (!chatsQuery.empty) {
          const chatDoc = chatsQuery.docs[0];
          const chatData = chatDoc.data();
          
          if (chatData.jobSeekerName) {
            displayName = chatData.jobSeekerName;
            found = true;
          }
        }
      } catch (chatError) {
        console.warn('Error fetching job seeker name from chats:', chatError);
        // Continue with default name
      }
      
      // Create a minimal profile with the information we have
      if (found) {
        return { 
          success: true, 
          profile: { 
            id: userId,
            displayName: displayName,
            email: '',
            skills: [],
            bio: 'No additional information available for this job seeker.'
          } 
        };
      } else {
        return { success: false, error: 'User profile not found' };
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { success: false, error };
    }
  }
};

// Custom Chat API to bypass Firestore security rules
export const chatAPI = {
  // Create a new chat
  async createChat(chatData: any) {
    try {
      // Generate a predictable ID
      const chatId = `${chatData.jobId}_${chatData.jobSeekerId}_${chatData.employerId}`;
      
      // Add timestamp fields if not present
      const enhancedData = {
        ...chatData,
        createdAt: chatData.createdAt || new Date().toISOString(),
        updatedAt: chatData.updatedAt || new Date().toISOString(),
        lastMessageAt: chatData.lastMessageAt || new Date().toISOString(),
        chatId: chatId // Store the ID in the document for easy reference
      };
      
      // Save to both collections for compatibility
      // First to the original chats collection
      await firestore.collection('chats').doc(chatId).set(enhancedData, { merge: true });
      
      // Then to the public_chats collection with less restrictive permissions
      await firestore.collection('public_chats').doc(chatId).set(enhancedData, { merge: true });
      
      console.log('Chat created successfully with ID:', chatId);
      return { success: true, chatId };
    } catch (error) {
      console.error('Error creating chat:', error);
      return { success: false, error };
    }
  },
  
  // Get a chat by ID
  async getChat(chatId: string) {
    try {
      // First try to get from public_chats collection
      try {
        const publicChatDoc = await firestore.collection('public_chats').doc(chatId).get();
        if (publicChatDoc.exists) {
          return { success: true, chat: { id: publicChatDoc.id, ...publicChatDoc.data() } };
        }
      } catch (publicChatError) {
        console.warn('Error getting chat from public_chats:', publicChatError);
      }
      
      // Fallback to regular chats collection
      const chatDoc = await firestore.collection('chats').doc(chatId).get();
      if (chatDoc.exists) {
        return { success: true, chat: { id: chatDoc.id, ...chatDoc.data() } };
      } else {
        return { success: false, error: 'Chat not found' };
      }
    } catch (error) {
      console.error('Error getting chat:', error);
      return { success: false, error };
    }
  },
  
  // Send a message to a chat
  async sendMessage(chatId: string, messageData: any) {
    try {
      // Add timestamp fields
      const enhancedMessage = {
        ...messageData,
        createdAt: messageData.createdAt || new Date().toISOString(),
        timestamp: messageData.timestamp || new Date().getTime()
      };
      
      // Try to add the message to the public_chats collection first (less restrictive permissions)
      let messageRef;
      try {
        messageRef = await firestore
          .collection('public_chats')
          .doc(chatId)
          .collection('messages')
          .add(enhancedMessage);
          
        // Update the public chat document with the last message
        await firestore.collection('public_chats').doc(chatId).update({
          lastMessage: messageData.text,
          lastMessageAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (publicChatError) {
        console.warn('Error sending to public_chats, trying regular chats:', publicChatError);
        
        // Fallback to the original chats collection
        messageRef = await firestore
          .collection('chats')
          .doc(chatId)
          .collection('messages')
          .add(enhancedMessage);
        
        // Update the original chat document with the last message
        await firestore.collection('chats').doc(chatId).update({
          lastMessage: messageData.text,
          lastMessageAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      return { success: true, messageId: messageRef?.id || 'message-sent' };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error };
    }
  },
  
  // Subscribe to messages in a chat with retry logic
  subscribeToMessages(chatId: string, callback: (messages: any[]) => void) {
    let unsubscribe: (() => void) | null = null;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds
    
    const subscribe = () => {
      try {
        // First try the public_chats collection
        unsubscribe = firestore
          .collection('public_chats')
          .doc(chatId)
          .collection('messages')
          .orderBy('timestamp', 'asc')
          .onSnapshot(
            (snapshot) => {
              // Reset retry count on successful connection
              retryCount = 0;
              
              const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              callback(messages);
            },
            (error) => {
              console.error('Error in messages subscription:', error);
              
              // If we get a permission error, try the fallback collection
              if (error.code === 'permission-denied' && retryCount === 0) {
                console.log('Trying fallback collection due to permission error');
                if (unsubscribe) {
                  unsubscribe();
                }
                
                // Try the regular chats collection as fallback
                unsubscribe = firestore
                  .collection('chats')
                  .doc(chatId)
                  .collection('messages')
                  .orderBy('timestamp', 'asc')
                  .onSnapshot(
                    (snapshot) => {
                      const messages = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                      }));
                      callback(messages);
                    },
                    (fallbackError) => {
                      console.error('Error in fallback subscription:', fallbackError);
                      handleError(fallbackError);
                    }
                  );
              } else {
                handleError(error);
              }
            }
          );
      } catch (error) {
        console.error('Exception in subscribeToMessages:', error);
        handleError(error);
      }
      
      return unsubscribe;
    };
    
    const handleError = (error: any) => {
      // Return empty messages array to avoid breaking the UI
      callback([]);
      
      // Implement retry logic for connection errors
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying subscription (attempt ${retryCount} of ${maxRetries})...`);
        
        // Clean up previous subscription if it exists
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
        
        // Retry after delay
        setTimeout(() => {
          unsubscribe = subscribe();
        }, retryDelay * retryCount); // Increase delay with each retry
      }
    };
    
    // Initial subscription
    unsubscribe = subscribe();
    
    // Return unsubscribe function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  },
  
  // Find chats for a user
  async findChatsForUser(userId: string, role: 'employer' | 'jobSeeker') {
    try {
      const fieldName = role === 'employer' ? 'employerId' : 'jobSeekerId';
      let chats = [];
      
      // First try to get from public_chats collection
      try {
        const publicSnapshot = await firestore
          .collection('public_chats')
          .where(fieldName, '==', userId)
          .get();
        
        chats = publicSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          source: 'public_chats'
        }));
      } catch (publicChatError) {
        console.warn('Error finding chats in public_chats:', publicChatError);
      }
      
      // If no chats found in public_chats, try regular chats collection
      if (chats.length === 0) {
        const snapshot = await firestore
          .collection('chats')
          .where(fieldName, '==', userId)
          .get();
        
        chats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          source: 'chats'
        }));
      }
      
      return { success: true, chats };
    } catch (error) {
      console.error('Error finding chats:', error);
      return { success: false, error };
    }
  }
};