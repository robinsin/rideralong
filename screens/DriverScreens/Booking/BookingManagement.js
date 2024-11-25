import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, where, getDocs, getDoc, addDoc, updateDoc, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { sendPushNotification, storeNotification } from '../../../notifications';




const BookingManagement = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const driverId = auth.currentUser.uid;
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('driverId', '==', driverId));
    
    const querySnapshot = await getDocs(q);
    const bookingsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    setBookings(bookingsList);
  };

  const handleBookingAction = async (bookingId, status) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      const bookingData = bookingDoc.data();
      const passengerId = bookingData.passengerId;
  
      await updateDoc(bookingRef, { status });
  
      // Store notification in Firestore
      await storeNotification({
        type: 'booking',
        recipientId: passengerId,
        senderId: auth.currentUser.uid,
        title: 'Booking Update',
        body: `Your booking has been ${status}`,
        bookingId,
        status: status
      });
  
      // Send push notification
      const userDoc = await getDoc(doc(db, 'User', passengerId));
      const pushToken = userDoc.data()?.expoPushToken;
      
      if (pushToken) {
        await sendPushNotification(pushToken, {
          title: 'Booking Update',
          body: `Your booking has been ${status}`
        });
      }
  
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };
  
  
  
  
  const handleCompleteRide = async (bookingId) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const rideRef = doc(db, 'rides', bookingId.split('_')[0]);
  
      await runTransaction(db, async (transaction) => {
        // Update booking status
        transaction.update(bookingRef, {
          status: 'completed',
          completedAt: serverTimestamp()
        });
  
        // Update ride status
        transaction.update(rideRef, {
          status: 'completed'
        });
      });
  
      // Refresh bookings list
      fetchBookings();
    } catch (error) {
      console.error('Error completing ride:', error);
    }
  };
  
  
  

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.routeInfo}>
        <Text style={styles.routeText}>
          {item.startLocation.title} → {item.endLocation.title}
        </Text>
        <Text style={styles.dateText}>
          {item.scheduleDate} | {item.startTime}
        </Text>
      </View>
      
      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
        {item.status.toUpperCase()}
      </Text>
  
      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleBookingAction(item.id, 'confirmed')}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleBookingAction(item.id, 'rejected')}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
  
  {item.status === 'confirmed' && (
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => handleCompleteRide(item.id)}
        >
          <Text style={styles.buttonText}>Complete Ride</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.actionButton, styles.chatButton]}
            onPress={() => navigation.navigate('ChatScreen', { 
              chatId: `ride_${item.rideId}`,
              passengerId: item.passengerId,
              driverId: auth.currentUser.uid
            })}
          >
            <Text style={styles.buttonText}>Message Passenger</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
);
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Requests</Text>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No booking requests</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8FAFC',
      padding: 16,
    },
    bookingCard: {
      backgroundColor: '#FFFFFF',
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
      elevation: 2,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    actionButton: {
      flex: 1,
      padding: 10,
      borderRadius: 6,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    acceptButton: {
      backgroundColor: '#059669',
    },
    rejectButton: {
      backgroundColor: '#DC2626',
    },
    completeButton: {
      backgroundColor: '#059669',
    },
    chatButton: {
      backgroundColor: '#3B82F6',
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '500',
    }
  });
  
const getStatusColor = (status) => {
  const colors = {
    pending: '#F59E0B',
    confirmed: '#059669',
    rejected: '#DC2626',
    completed: '#3B82F6'
  };
  return colors[status] || '#6B7280';
};

export default BookingManagement;
