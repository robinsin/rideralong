import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Rating } from 'react-native-ratings';
import { getFirestore, doc, updateDoc, runTransaction, serverTimestamp, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const RateRide = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const db = getFirestore();

  const handleSubmitRating = async () => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      const bookingData = bookingDoc.data();
      const driverId = bookingData.driverId;
  
      await runTransaction(db, async (transaction) => {
        // Update booking with rating
        transaction.update(bookingRef, {
          rating,
          review,
          ratedAt: serverTimestamp()
        });
  
        // Get all driver's rated bookings
        const bookingsQuery = query(
          collection(db, 'bookings'), 
          where('driverId', '==', driverId),
          where('rating', '>', 0)
        );
        
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const ratings = bookingsSnapshot.docs.map(doc => doc.data().rating);
        
        // Calculate new average rating
        const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  
        // Update driver profile with new rating
        const driverRef = doc(db, 'Driver', driverId, 'DriverProfile', 'driverInfo');
        transaction.update(driverRef, {
          averageRating,
          totalRatings: ratings.length
        });
      });
  
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate Your Ride</Text>
      
      <Rating
        showRating
        onFinishRating={setRating}
        style={styles.rating}
      />

      <TextInput
        style={styles.input}
        placeholder="Write a review (optional)"
        multiline
        numberOfLines={4}
        value={review}
        onChangeText={setReview}
      />

      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleSubmitRating}
      >
        <Text style={styles.buttonText}>Submit Rating</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
  },
  rating: {
    paddingVertical: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RateRide;
