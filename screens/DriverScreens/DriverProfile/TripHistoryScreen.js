// TripHistoryScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const TripHistoryScreen = () => {
  const [trips, setTrips] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchTripData = async () => {
      const userId = auth.currentUser.uid;
      const tripsSnapshot = await getDocs(collection(db, 'Driver', userId, 'tripHistoryandEarnings', 'trip'));
      const tripData = tripsSnapshot.docs.map(doc => doc.data());
      const earningsSnapshot = await getDocs(collection(db, 'Driver', userId, 'tripHistoryandEarnings'));
      const earningsData = earningsSnapshot.docs.map(doc => doc.data());

      const total = earningsData.reduce((acc, item) => acc + item.totalEarnings, 0);
      setTotalEarnings(total);
      setTrips(tripData);
    };
    fetchTripData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.totalEarnings}>Total Earnings: ₦{totalEarnings}</Text>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.tripId}
        renderItem={({ item }) => (
          <View style={styles.tripItem}>
            <Text>Date: {item.tripDate.toDate().toDateString()}</Text>
            <Text>Earnings: ₦{item.tripEarnings}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  totalEarnings: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  tripItem: { padding: 10, borderBottomWidth: 1 }
});

export default TripHistoryScreen;
