import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmployerStackParamList } from '../../navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db, chatAPI } from '../../services/firebase';

type Props = NativeStackScreenProps<EmployerStackParamList, 'Chat'>;

type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: any;
};

const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  // Extract parameters with proper type checking
  const params = route.params || {};
  const jobId = (params as any).jobId || '';
  const applicantId = (params as any).applicantId || '';
  const jobTitle = (params as any).jobTitle || 'Job Position';
  
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [jobSeekerDetails, setJobSeekerDetails] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    // Set up navigation title
    navigation.setOptions({
      title: jobSeekerDetails?.name || 'Chat',
    });
  }, [jobSeekerDetails, navigation]);

  useEffect(() => {
    const setupChat = async () => {
      if (!user) {
        // User not logged in, redirect to home
        navigation.navigate('Home');
        return;
      }

      try {
        setLoading(true);
        
        // Validate required parameters
        if (!jobId || !applicantId) {
          console.log('Missing jobId or applicantId, cannot set up chat');
          Alert.alert('Error', 'Cannot set up chat without proper job and applicant information.');
          setLoading(false);
          return;
        }
        
        // Fetch job seeker details
        try {
          const jobSeekerDoc = await getDoc(doc(db, 'users', applicantId));
          if (jobSeekerDoc.exists()) {
            setJobSeekerDetails({
              id: jobSeekerDoc.id,
              name: jobSeekerDoc.data().displayName || 'Applicant',
              ...jobSeekerDoc.data()
            });
          } else {
            console.log('Job seeker not found');
          }
        } catch (error) {
          console.error('Error fetching job seeker details:', error);
        }
        
        // Generate the predictable chat ID
        const chatDocId = `${jobId}_${applicantId}_${user.uid}`;
        console.log('Looking for chat with ID:', chatDocId);
        
        // Use our custom chatAPI to get the chat
        const chatResult = await chatAPI.getChat(chatDocId);
        
        if (chatResult.success && chatResult.chat) {
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
              jobSeekerId: applicantId,
              employerId: user.uid,
              employerName: user.displayName || 'Employer',
              jobSeekerName: jobSeekerDetails?.name || 'Applicant',
              jobTitle: jobTitle,
              lastMessage: 'Welcome to the chat!'
            };
            
            // Use our custom chatAPI to create the chat
            const createResult = await chatAPI.createChat(chatData);
            
            if (createResult.success && createResult.chatId) {
              setChatId(createResult.chatId);
              
              // Send an initial welcome message
              await chatAPI.sendMessage(createResult.chatId, {
                text: `Welcome to the chat for ${jobTitle}. How can I help you with this position?`,
                senderId: user.uid || 'unknown',
                senderName: user.displayName || 'Employer'
              });
              
              // Subscribe to messages
              subscribeToMessages(createResult.chatId);
              console.log('Successfully created chat with ID:', createResult.chatId);
            } else {
              throw new Error('Failed to create chat');
            }
          } catch (createError: any) {
            console.error('Error creating chat:', createError);
            throw new Error(`Failed to create chat: ${createError.message || 'Unknown error'}`);
          }
        }
      } catch (error: any) {
        console.error('Error setting up chat:', error);
        Alert.alert('Error', `Error setting up chat: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    setupChat();
  }, [jobId, applicantId, navigation, jobTitle, user]);

  const subscribeToMessages = (chatId: string) => {
    return chatAPI.subscribeToMessages(chatId, (newMessages) => {
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
    if (!message.trim() || !chatId || isSending || !user) return;
    
    setIsSending(true);
    
    try {
      // Use our custom chatAPI to send a message
      const result = await chatAPI.sendMessage(chatId, {
        text: message,
        senderId: user.uid || 'unknown',
        senderName: user.displayName || 'Employer'
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

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 10, color: theme.text }}>Setting up chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.chatContainer}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => {
          const isCurrentUser = item.senderId === user?.uid;
          return (
            <View
              style={[
                styles.messageContainer,
                isCurrentUser
                  ? [styles.currentUserMessage, { backgroundColor: theme.primary, alignSelf: 'flex-end' }]
                  : [styles.otherUserMessage, { backgroundColor: theme.card, alignSelf: 'flex-start' }]
              ]}
            >
              <Text style={[styles.senderName, { color: isCurrentUser ? theme.background : theme.text }]}>
                {item.senderName}
              </Text>
              <Text style={[styles.messageText, { color: isCurrentUser ? theme.background : theme.text }]}>
                {item.text}
              </Text>
            </View>
          );
        }}
      />

      <View style={[styles.inputContainer, { borderTopColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.card }]}
          placeholder="Type a message..."
          placeholderTextColor={theme.textLight}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: theme.primary }]}
          onPress={handleSendMessage}
          disabled={isSending || !message.trim()}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
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
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ChatScreen; 