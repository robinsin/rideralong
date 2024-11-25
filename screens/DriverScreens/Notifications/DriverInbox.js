import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const DriverInbox = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser.uid;

  useEffect(() => {
    // Subscribe to driver-specific notifications
    const notificationsRef = collection(db, 'notifications');
    const bookingsRef = collection(db, 'bookings');
    const chatsRef = collection(db, 'chats');

    // Create queries for driver notifications
    const notificationsQuery = query(
      notificationsRef,
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const bookingsQuery = query(
      bookingsRef,
      where('driverId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const chatsQuery = query(
      chatsRef,
      where('driverId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    // Subscribe to real-time updates
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt?.toDate()
      }));
      updateNotifications(newNotifications);
    });

    return () => {
      unsubscribeNotifications();
    };
  }, []);

  const updateNotifications = (newNotifications) => {
    setNotifications(current => {
      const combined = [...current, ...newNotifications];
      return combined
        .sort((a, b) => b.createdAt - a.createdAt)
        .filter((notification, index, self) => 
          index === self.findIndex(n => n.id === notification.id)
        );
    });
  };

  const handleNotificationPress = (notification) => {
    switch(notification.type) {
      case 'booking_request':
        navigation.navigate('BookingManagement', {
          bookingId: notification.bookingId,
          status: 'pending'
        });
        break;
      case 'chat':
        navigation.navigate('ChatScreen', {
          chatId: notification.chatId,
          driverId: notification.driverId,
          passengerId: notification.passengerId,
          passengerName: notification.senderName
        });
        break;
      case 'schedule_update':
        navigation.navigate('MySchedules', {
          scheduleId: notification.scheduleId
        });
        break;
      case 'route_update':
        navigation.navigate('MyRoutes', {
          routeId: notification.routeId
        });
        break;
      case 'booking_status':
        navigation.navigate('BookingManagement', {
          bookingId: notification.bookingId,
          status: notification.status
        });
        break;
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={styles.notificationItem}
      onPress={() => handleNotificationPress(item)}
    >
      <Text style={styles.notificationTitle}>
        {getNotificationTitle(item)}
      </Text>
      <Text style={styles.notificationBody}>
        {getNotificationBody(item)}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(item.createdAt?.toDate()).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  const getNotificationTitle = (notification) => {
    switch(notification.type) {
      case 'booking_request':
        return 'New Booking Request';
      case 'chat':
        return 'New Message from Passenger';
      case 'schedule_update':
        return 'Schedule Update';
      case 'route_update':
        return 'Route Update';
      default:
        return 'Notification';
    }
  };

  const getNotificationBody = (notification) => {
  switch(notification.type) {
    case 'booking_request':
      return `New ride request from ${notification.passengerName || 'a passenger'} - ${notification.pickupLocation || 'location'}`;
    case 'chat':
      return `Message: "${notification.message || 'New message'}" from ${notification.senderName || 'passenger'}`;
    case 'schedule_update':
      return `Schedule ${notification.status} for route ${notification.routeName || 'your route'}`;
    case 'route_update':
      return `Route update: ${notification.routeName || 'Your route'} has been ${notification.status}`;
    case 'booking_status':
      return `Booking ${notification.bookingId} status changed to ${notification.status}`;
    default:
      return notification.message || 'New notification';
  }
};

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  notificationBody: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
  },
});

export default DriverInbox;
