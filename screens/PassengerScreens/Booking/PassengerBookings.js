import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const PassengerBookings = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser.uid;

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('passengerId', '==', userId),
      where('status', 'in', ['pending', 'confirmed', 'rejected', 'completed']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setBookings(newBookings);
      updateBookingsViewStatus(newBookings);
    });

    return () => unsubscribe();
  }, []);

  const updateBookingsViewStatus = async (bookings) => {
    const batch = db.batch();
    bookings.forEach((booking) => {
      if (!booking.viewed && ['confirmed', 'rejected', 'completed'].includes(booking.status)) {
        const bookingRef = doc(db, 'bookings', booking.id);
        batch.update(bookingRef, { 
          viewed: true,
          lastViewed: serverTimestamp()
        });
      }
    });
    await batch.commit();
  };


  const handleBookingPress = (booking) => {
    navigation.navigate('RideDetails', {
      bookingId: booking.id,
      status: booking.status
    });
  };

  const handleCancelBooking = async (bookingId) => {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancelledBy: 'passenger'
    });
  };
  const fetchBookings = async () => {
    const passengerId = auth.currentUser.uid;
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('passengerId', '==', passengerId));
    
    const querySnapshot = await getDocs(q);
    const bookingsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    setBookings(bookingsList);
  };


  
  const handleRateRide = async (bookingId, rating, review) => {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      rating,
      review,
      ratedAt: serverTimestamp()
    });
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
  
      <View style={styles.buttonContainer}>
        {/* Message Driver button for pending and confirmed */}
        {(item.status === 'pending' || item.status === 'confirmed') && (
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => navigation.navigate('ChatScreen', {
            chatId: `ride_${item.rideId}`,
            passengerId: auth.currentUser.uid,
            driverId: item.driverId
          })}
        >
          <Text style={styles.buttonText}>Message Driver</Text>
        </TouchableOpacity>
      )}
  
        {/* Existing cancel option for pending bookings */}
        {item.status === 'pending' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelBooking(item.id)}
          >
            <Text style={styles.buttonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
  
        {/* Existing rate option for completed rides */}
        {item.status === 'completed' && !item.rating && (
          <TouchableOpacity 
            style={styles.rateButton}
            onPress={() => navigation.navigate('RateRide', { bookingId: item.id })}
          >
            <Text style={styles.buttonText}>Rate Ride</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No bookings found</Text>
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
  routeInfo: {
    marginBottom: 8,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  rateButton: {
    backgroundColor: '#F59E0B',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  chatButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'red',
    fontWeight: '500',
  },
  buttonContainer: {
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },

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

export default PassengerBookings;
