import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import AppNavigator from './AppNavigator';

const DriverHome = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    fetchSchedulesAndRides();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('DriverChats')}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#3B82F6" />
        </TouchableOpacity>
      )
    });
  }, []);


  const fetchSchedulesAndRides = async () => {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      const driverDocRef = `Driver/${user.uid}`;
      const schedulesSnapshot = await getDocs(collection(db, driverDocRef, 'DriverSchedules'));
      
      const fetchedSchedules = schedulesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSchedules(fetchedSchedules);
      // Fetch confirmed bookings
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('driverId', '==', user.uid),
        where('status', '==', 'confirmed')
      );
      
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const confirmedRides = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      // Filter upcoming confirmed rides
      const upcoming = confirmedRides.filter(ride => {
        const rideDate = new Date(ride.scheduleDate);
        return rideDate >= new Date();
      });
  
      setUpcomingRides(upcoming);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };
  
  const renderUpcomingRide = ({ item }) => (
    <View style={styles.scheduleContainer}>
      <Text style={styles.routeText}>
        {item.startLocation.title} → {item.endLocation.title}
      </Text>
      <Text style={styles.scheduleDetails}>
        {item.scheduleDate} | {item.startTime}
      </Text>
      <Text style={styles.vehicleDetails}>
        Vehicle: {item.vehicleDetails?.make} {item.vehicleDetails?.model}
      </Text>
      <Text style={styles.priceText}>Price: ₦{item.ridePrice}</Text>
    </View>
  );
  const renderScheduleItem = ({ item }) => (
    <View style={styles.scheduleContainer}>
      <Text style={styles.routeText}>
        {item.startLocation.title} → {item.endLocation.title}
      </Text>
      {item.optionalStops && item.optionalStops.length > 0 && (
        <Text style={styles.scheduleDetails}>
          Via: {item.optionalStops.map(stop => stop.title).join(', ')}
        </Text>
      )}
      <Text style={styles.scheduleDetails}>
        Date: {item.scheduleDate} | Time: {item.startTime}
      </Text>
      <Text style={styles.scheduleDetails}>
        Vehicle: {item.vehicleDetails?.make} {item.vehicleDetails?.model}
      </Text>
      <Text style={styles.priceText}>Price: ₦{item.ridePrice}</Text>
    </View>
  );
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Ride Schedules</Text>
      </View>

      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        renderItem={renderScheduleItem}
        style={styles.schedulesList}
        ListEmptyComponent={<Text style={styles.emptyText}>No schedules created yet</Text>}
      />

      <Text style={styles.sectionTitle}>Upcoming Rides</Text>
      <FlatList
        data={upcomingRides}
        keyExtractor={(item) => item.id}
        renderItem={renderUpcomingRide}
        style={styles.upcomingList}
        ListEmptyComponent={<Text style={styles.emptyText}>No upcoming rides</Text>}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.navigationButton}
          onPress={() => navigation.navigate('MyRoutes')}
        >
          <Text style={styles.buttonText}>My Routes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navigationButton}
          onPress={() => navigation.navigate('MySchedules')}
        >
          <Text style={styles.buttonText}>My Schedules</Text>
        </TouchableOpacity>
      </View>
      <AppNavigator />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
    paddingBottom: 70,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  schedulesList: {
    maxHeight: '35%',
    marginBottom: 20,
  },
  upcomingList: {
    maxHeight: '25%',
  },
  scheduleContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scheduleDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#059669',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#1F2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navigationButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginVertical: 20,
  },
});

const footerStyles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
    color: '#3B82F6',
  },
});

export default DriverHome;
