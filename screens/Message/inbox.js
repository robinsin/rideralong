import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, orderBy, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Inbox = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser.uid;

  useEffect(() => {
    fetchUserRole();
    subscribeToNotifications();
  }, [userRole]);

  const fetchUserRole = async () => {
    const userDoc = await getDoc(doc(db, 'User', userId));
    setUserRole(userDoc.data().role);
  };

  const subscribeToNotifications = () => {
    if (!userRole) return;

    const queries = [];
    
    if (userRole === 'driver') {
      queries.push(
        query(
          collection(db, 'bookings'),
          where('driverId', '==', userId),
          orderBy('createdAt', 'desc')
        ),
        query(
          collection(db, 'chats'),
          where('driverId', '==', userId),
          orderBy('createdAt', 'desc')
        )
      );
    } else {
      queries.push(
        query(
          collection(db, 'bookings'),
          where('passengerId', '==', userId),
          orderBy('createdAt', 'desc')
        ),
        query(
          collection(db, 'chats'),
          where('passengerId', '==', userId),
          orderBy('createdAt', 'desc')
        )
      );
    }
  }

    useEffect(() => {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('recipientId', '==', userId),
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
  
      return () => unsubscribe();
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
      case 'booking':
        navigation.navigate(userRole === 'driver' ? 'BookingManagement' : 'PassengerBookings');
        break;
      case 'chat':
        navigation.navigate('ChatScreen', {
          chatId: notification.chatId,
          driverId: notification.driverId,
          passengerId: notification.passengerId
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
    if (notification.type === 'booking') {
      return userRole === 'driver' ? 'New Booking Request' : 'Booking Update';
    }
    return 'New Message';
  };

  const getNotificationBody = (notification) => {
    if (notification.type === 'booking') {
      return `Status: ${notification.status}`;
    }
    return 'You have a new message';
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

export default Inbox;
