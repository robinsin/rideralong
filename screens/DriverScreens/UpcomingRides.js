import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const UpcomingRides = () => {
  const [rides, setRides] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUpcomingRides = async () => {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "User not authenticated. Please log in.");
        return;
      }

      try {
        // Query routes collection for routes created by the driver
        const q = query(
          collection(db, 'routes'),
          where('driverId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const fetchedRides = [];

        // Iterate through each route document
        querySnapshot.forEach(doc => {
          const data = doc.data();

          // Filter for upcoming passenger bookings
          const upcomingBookings = data.passengerBookings?.filter(booking => booking.status === 'upcoming');

          // Add upcoming bookings to the fetchedRides array
          upcomingBookings?.forEach(booking => {
            fetchedRides.push({
              ...booking,
              routeId: doc.id, // Add the route ID for reference
              mainStartLocation: data.startLocation,
              mainEndLocation: data.endLocation,
            });
          });
        });

        setRides(fetchedRides);
      } catch (error) {
        console.error("Error fetching rides: ", error);
        Alert.alert("Error", "Could not fetch upcoming rides. Please try again.");
      }
    };

    fetchUpcomingRides();
  }, []);

  const renderRide = ({ item }) => (
    <View style={styles.rideContainer}>
      <Text style={styles.location}>From: {item.startLocation} (Route: {item.mainStartLocation} to {item.mainEndLocation})</Text>
      <Text style={styles.location}>To: {item.endLocation}</Text>
      <Text style={styles.dateTime}>Scheduled at: {new Date(item.startTime).toLocaleString()}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Rides</Text>
      <FlatList
        data={rides}
        keyExtractor={item => `${item.routeId}-${item.passengerId}`}
        renderItem={renderRide}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No upcoming rides available.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  rideContainer: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  location: {
    fontSize: 16,
  },
  dateTime: {
    fontSize: 14,
    color: 'gray',
  },
  status: {
    fontSize: 14,
    color: 'green',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});

export default UpcomingRides;
