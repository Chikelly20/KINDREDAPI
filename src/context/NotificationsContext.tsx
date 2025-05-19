import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  type: 'job' | 'message' | 'application' | 'system';
  relatedId?: string;
  userId: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  refreshNotifications: () => void;
  loading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

// Mock notifications for development
const getMockNotifications = (userId: string): Notification[] => {
  return [
    {
      id: '1',
      title: 'New Job Match',
      message: 'A new job matching your profile has been posted: Software Developer at Tech Solutions',
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      type: 'job',
      relatedId: 'job-123',
      userId
    },
    {
      id: '2',
      title: 'Application Update',
      message: 'Your application for UX Designer at Creative Agency has been viewed',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      type: 'application',
      relatedId: 'app-456',
      userId
    },
    {
      id: '3',
      title: 'New Message',
      message: 'You have a new message from Global Marketing regarding your application',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: false,
      type: 'message',
      relatedId: 'chat-789',
      userId
    },
    {
      id: '4',
      title: 'Profile Reminder',
      message: 'Complete your profile to improve your job matches',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      read: true,
      type: 'system',
      userId
    }
  ];
};

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [listenerActive, setListenerActive] = useState(false);

  // Calculate unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Set up real-time listener for notifications
  useEffect(() => {
    if (!user?.uid || listenerActive) return;

    try {
      setLoading(true);
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const notificationsData: Notification[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            notificationsData.push({
              id: doc.id,
              title: data.title || '',
              message: data.message || '',
              createdAt: data.createdAt instanceof Date 
                ? data.createdAt 
                : new Date((data.createdAt as Timestamp)?.seconds ? (data.createdAt as Timestamp).seconds * 1000 : Date.now()),
              read: data.read || false,
              type: data.type || 'system',
              relatedId: data.relatedId,
              userId: data.userId
            });
          });
          setNotifications(notificationsData);
          setLoading(false);
          setListenerActive(true);
        },
        (error) => {
          console.error('Error listening to notifications:', error);
          // Use mock data when there's an error
          if (user?.uid) {
            setNotifications(getMockNotifications(user.uid));
          }
          setLoading(false);
          setListenerActive(false);
        }
      );

      return () => {
        unsubscribe();
        setListenerActive(false);
      };
    } catch (error) {
      console.error('Error setting up notifications listener:', error);
      // Use mock data when there's an error
      if (user?.uid) {
        setNotifications(getMockNotifications(user.uid));
      }
      setLoading(false);
      setListenerActive(false);
    }
  }, [user?.uid, listenerActive]);

  // Refresh notifications manually
  const refreshNotifications = () => {
    if (!user?.uid) return;
    
    // Reset listener state to trigger a refresh
    setListenerActive(false);
    setLoading(true);
    
    // If we can't get real data, use mock data
    try {
      // This will trigger the useEffect above to re-establish the listener
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      if (user?.uid) {
        setNotifications(getMockNotifications(user.uid));
      }
      setLoading(false);
    }
  };

  // Add a new notification
  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    if (!user?.uid) return;

    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        ...notification,
        userId: user.uid,
        createdAt: serverTimestamp(),
        read: false
      });
    } catch (error) {
      console.error('Error adding notification:', error);
      
      // Add to local state if Firestore fails
      const newNotification: Notification = {
        ...notification,
        id: `local-${Date.now()}`,
        createdAt: new Date(),
        read: false,
        userId: user.uid
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      // Try to update in Firestore
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.log('Could not update notification in Firestore:', error);
    }
    
    // Always update local state
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Update each notification in Firestore
      const updatePromises = notifications.map(notification => {
        if (!notification.read) {
          const notificationRef = doc(db, 'notifications', notification.id);
          return updateDoc(notificationRef, { read: true });
        }
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
    
    // Update local state
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Clear all notifications
  const clearNotifications = async () => {
    // In a real app, you might want to delete notifications from Firestore
    // For now, we'll just clear the local state
    setNotifications([]);
    return Promise.resolve();
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        refreshNotifications,
        loading
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsContext;
