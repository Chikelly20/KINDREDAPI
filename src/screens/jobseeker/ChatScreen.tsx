import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { JobSeekerStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, chatAPI } from '../../services/firebase';

type Props = NativeStackScreenProps<JobSeekerStackParamList, 'Chat'>;

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: any;
}

interface JobDetails {
  title: string;
  employerName: string;
}

const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  // Extract parameters with proper validation
  const params = route.params || {};
  const jobId = (params as any).jobId || '';
  const employerId = (params as any).employerId || '';
  const { user } = useAuth();
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchOrCreateChat = async () => {
      setIsLoading(true);
      
      try {
        // Validate required parameters and user authentication
        if (!user?.uid) {
          console.log('User not authenticated');
          Alert.alert('Authentication Error', 'Please log in again to continue.');
          return;
        }
        
        if (!jobId || !employerId) {
          console.log('Missing jobId or employerId, cannot set up chat');
          Alert.alert(
            'Missing Information',
            'Cannot start a chat without proper job and employer information.',
            [{ text: 'Go Back', onPress: () => navigation.goBack() }]
          );
          return;
        }
        
        // First, get job details if jobId is provided
        if (jobId && jobId.trim() !== '') {
          try {
            const jobDoc = await getDoc(doc(db, 'jobs', jobId));
            if (jobDoc.exists()) {
              const jobData = jobDoc.data();
              setJobDetails({
                title: jobData.title,
                employerName: jobData.employerName
              });
            } else {
              // Set default job details if document doesn't exist
              setJobDetails({
                title: 'Job Application',
                employerName: 'Employer'
              });
            }
          } catch (jobError) {
            // Set default job details on error
            setJobDetails({
              title: 'Job Application',
              employerName: 'Employer'
            });
          }
        } else {
          // Set default job details if no jobId
          setJobDetails({
            title: 'Messages',
            employerName: 'Employer'
          });
        }
        
        // Create a predictable chat ID to ensure consistent access
        const chatDocId = `${jobId}_${user.uid}_${employerId}`;
        console.log('Looking for chat with ID:', chatDocId);
        
        // Use our custom chatAPI to get the chat
        const chatResult = await chatAPI.getChat(chatDocId);
        
        if (chatResult.success) {
          console.log('Found existing chat with ID:', chatDocId);
          // Chat exists with predictable ID
          setChatId(chatDocId);
          subscribeToMessages(chatDocId);
        } else {
          console.log('Chat not found with ID, creating new chat');

          try {
            // Create chat data
            const chatData = {
              jobId,
              jobSeekerId: user.uid,
              employerId,
              jobSeekerName: user.displayName || 'Job Seeker',
              employerName: jobDetails?.employerName || 'Employer',
              jobTitle: jobDetails?.title || 'Job Position',
              lastMessage: `Hi, I'm interested in applying for this position.`
            };
            
            // Use our custom chatAPI to create the chat
            const createResult = await chatAPI.createChat(chatData);
            
            if (createResult.success && createResult.chatId) {
              setChatId(createResult.chatId);
              
              // Send an initial message
              await chatAPI.sendMessage(createResult.chatId, {
                text: `Hi, I'm interested in applying for this position.`,
                senderId: user?.uid || 'unknown',
                senderName: user?.displayName || 'Job Seeker'
              });
              
              // Subscribe to messages
              subscribeToMessages(createResult.chatId);
              console.log('Successfully created chat with ID:', createResult.chatId);
            } else {
              throw new Error('Failed to create chat');
            }
          } catch (createError: any) {
            console.error('Error creating chat document:', createError);
            throw new Error(`Failed to create chat: ${createError.message || 'Unknown error'}`);
          }
          
          setChatId(chatDocId);
          subscribeToMessages(chatDocId);
        }
      } catch (error) {
        console.error('Error setting up chat:', error);
        Alert.alert('Error', 'Failed to set up chat. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrCreateChat();
    
    // Clean up subscription on unmount
    return () => {
      if (chatId) {
        // Unsubscribe logic would go here if needed
      }
    };
  }, [user, jobId, employerId]);
  
  const subscribeToMessages = (chatId: string) => {
    // Use our custom chatAPI to subscribe to messages
    return chatAPI.subscribeToMessages(chatId, (newMessages) => {
      console.log(`Received ${newMessages.length} messages for chat ${chatId}`);
      setMessages(newMessages);
      
      // Scroll to bottom when new messages arrive
      if (newMessages.length > 0 && flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });
  };
  
  const handleSendMessage = async () => {
    if (!message.trim() || !chatId || isSending) return;
    
    setIsSending(true);
    
    try {
      // Use our custom chatAPI to send a message
      const result = await chatAPI.sendMessage(chatId, {
        text: message,
        senderId: user?.uid,
        senderName: user?.displayName || 'Job Seeker'
      });
      
      if (result.success) {
        console.log('Message sent successfully');
        setMessage('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === user?.uid;
    
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
          {
            backgroundColor: isCurrentUser ? theme.primary : theme.card,
            alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
          }
        ]}
      >
        {!isCurrentUser && (
          <Text style={[styles.senderName, { color: theme.text }]}>
            {item.senderName}
          </Text>
        )}
        <Text
          style={[
            styles.messageText,
            { color: isCurrentUser ? theme.secondary : theme.text }
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {jobDetails?.title || 'Job Application'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.text }]}>
            {jobDetails?.employerName || 'Loading...'}
          </Text>
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
          />
          
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.secondary, borderTopColor: theme.border }
            ]}
          >
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              placeholder="Type a message..."
              placeholderTextColor={theme.text}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: theme.primary, opacity: message.trim() ? 1 : 0.5 }
              ]}
              onPress={handleSendMessage}
              disabled={!message.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={theme.secondary} />
              ) : (
                <Ionicons name="send" size={20} color={theme.secondary} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    marginLeft: 8,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  currentUserMessage: {
    borderTopRightRadius: 4,
  },
  otherUserMessage: {
    borderTopLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ChatScreen; 