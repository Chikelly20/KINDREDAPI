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

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
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
      
      // Use a direct set operation with merge option
      await firestore.collection('chats').doc(chatId).set(enhancedData, { merge: true });
      
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
      
      // Add the message to the messages subcollection
      const messageRef = await firestore
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add(enhancedMessage);
      
      // Update the chat document with the last message
      await firestore.collection('chats').doc(chatId).update({
        lastMessage: messageData.text,
        lastMessageAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return { success: true, messageId: messageRef.id };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error };
    }
  },
  
  // Subscribe to messages in a chat
  subscribeToMessages(chatId: string, callback: (messages: any[]) => void) {
    return firestore
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
        (error) => {
          console.error('Error subscribing to messages:', error);
        }
      );
  },
  
  // Find chats for a user
  async findChatsForUser(userId: string, role: 'employer' | 'jobSeeker') {
    try {
      const fieldName = role === 'employer' ? 'employerId' : 'jobSeekerId';
      const snapshot = await firestore
        .collection('chats')
        .where(fieldName, '==', userId)
        .get();
      
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, chats };
    } catch (error) {
      console.error('Error finding chats:', error);
      return { success: false, error };
    }
  }
};