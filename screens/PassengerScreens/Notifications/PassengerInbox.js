import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const PassengerInbox = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser.uid;

  useEffect(() => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt?.toDate()
      }));
      setNotifications(newNotifications);
    });

    // Mark notifications as read when screen is focused
    const unsubscribeFocus = navigation.addListener('focus', () => {
      markAllNotificationsAsRead();
    });

    return () => {
      unsubscribe();
      unsubscribeFocus();
    };
  }, []);

  const markAllNotificationsAsRead = async () => {
    const batch = db.batch();
    notifications.forEach((notification) => {
      const notificationRef = doc(db, 'notifications', notification.id);
      batch.update(notificationRef, { read: true });
    });
    await batch.commit();
  };

  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      setNotifications(current => 
        current.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.log('Error deleting notification:', error);
    }
  };

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

  const handleNotificationPress = async (notification) => {
    // Delete notification first
    await deleteNotification(notification.id);

    // Then navigate based on type
    switch(notification.type) {
      case 'booking':
        navigation.navigate('PassengerBookings', {
          bookingId: notification.bookingId,
          status: notification.status
        });
        break;
      case 'chat':
        navigation.navigate('ChatScreen', {
          chatId: notification.chatId,
          driverId: notification.driverId,
          passengerId: notification.passengerId,
          driverName: notification.driverName
        });
        break;
      case 'ride_update':
        navigation.navigate('RideDetails', {
          bookingId: notification.bookingId,
          status: notification.status
        });
        break;
    }
  };
  

  const getNotificationTitle = (notification) => {
    switch(notification.type) {
      case 'booking':
        return 'Booking Update';
      case 'chat':
        return 'New Message from Driver';
      case 'ride_update':
        return 'Ride Status Update';
      default:
        return 'Notification';
    }
  };

  const getNotificationBody = (notification) => {
    switch(notification.type) {
      case 'booking':
        return `Booking ${notification.bookingId} ${notification.status}
                Driver: ${notification.driverName || 'Not assigned'}
                From: ${notification.pickupLocation || 'Loading...'}
                To: ${notification.dropoffLocation || 'Loading...'}`;
      case 'chat':
        return `Message from ${notification.driverName}: "${notification.message || 'New message'}"`;
      case 'ride_update':
        return `Your ride with ${notification.driverName} is ${notification.status}
                Location: ${notification.currentLocation || 'Updating...'}
                ETA: ${notification.estimatedTime || 'Calculating...'}`;
      default:
        return notification.message || 'New notification';
    }
  };
  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
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

export default PassengerInbox;
