import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications, Notification } from '../../context/NotificationsContext';

// Using Notification interface from NotificationsContext

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    refreshNotifications 
  } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshNotifications();
    setRefreshing(false);
  }, [refreshNotifications]);

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'job':
        if (notification.relatedId) {
          // @ts-ignore - Ignore navigation type errors
          navigation.navigate('JobDetails', { jobId: notification.relatedId });
        }
        break;
      case 'message':
        if (notification.relatedId) {
          // @ts-ignore - Ignore navigation type errors
          navigation.navigate('Chat', { chatId: notification.relatedId });
        }
        break;
      case 'application':
        if (notification.relatedId) {
          // @ts-ignore - Ignore navigation type errors
          navigation.navigate('JobDetails', { jobId: notification.relatedId });
        }
        break;
      default:
        // Do nothing for system notifications
        break;
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <MaterialIcons name="work" size={24} color={theme.primary} />;
      case 'message':
        return <Ionicons name="chatbubble-ellipses" size={24} color="#4CAF50" />;
      case 'application':
        return <MaterialIcons name="assignment" size={24} color="#FF9800" />;
      default:
        return <Ionicons name="information-circle" size={24} color="#2196F3" />;
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: item.read ? theme.cardBackground : '#F0F8FF' }
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIcon}>
          {getNotificationIcon(item.type)}
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, { color: theme.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.notificationMessage, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notificationTime}>
            {getTimeAgo(item.createdAt)}
          </Text>
        </View>
        {!item.read && (
          <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: '#FFFFFF' }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>NOTIFICATIONS</Text>
        {notifications.length > 0 && (
          <TouchableOpacity 
            style={styles.markAllReadButton}
            onPress={markAllAsRead}
          >
            <Text style={[styles.markAllReadText, { color: theme.primary }]}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No notifications yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            We'll notify you when there's something new
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  markAllReadButton: {
    padding: 8,
  },
  markAllReadText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    padding: 16
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  notificationIcon: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  notificationContent: {
    flex: 1
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 8
  },
  notificationTime: {
    fontSize: 12,
    color: '#757575'
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8
  }
});

export default NotificationsScreen;
