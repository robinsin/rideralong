import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const MySchedules = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
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
    } catch (error) {
      console.error("Error fetching data: ", error);
      Alert.alert("Error", "Could not fetch schedules. Please try again.");
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      const user = auth.currentUser;
      const scheduleRef = doc(db, `Driver/${user.uid}/DriverSchedules/${scheduleId}`);
      await deleteDoc(scheduleRef);
      setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
      Alert.alert("Success", "Schedule deleted successfully");
    } catch (error) {
      Alert.alert("Error", "Could not delete the schedule");
    }
  };

  const renderSchedule = ({ item }) => (
    <View style={styles.scheduleContainer}>
      <Text style={styles.routeName}>
        {item.startLocation.title} → {item.endLocation.title}
      </Text>
      {item.optionalStops && item.optionalStops.length > 0 && (
        <Text style={styles.scheduleDetails}>
          Via: {item.optionalStops.map(stop => stop.title).join(', ')}
        </Text>
      )}
      <Text style={styles.scheduleDetails}>
        Date: {item.scheduleDate}
      </Text>
      <Text style={styles.scheduleDetails}>
        Time: {item.startTime}
      </Text>
      <Text style={styles.scheduleDetails}>
        Vehicle: {item.vehicleDetails.make} {item.vehicleDetails.model}
      </Text>
      <Text style={styles.scheduleDetails}>
        License Plate: {item.vehicleDetails.licensePlate}
      </Text>
      <Text style={styles.priceText}>
        Price: ₦{item.ridePrice}
      </Text>
  
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditSchedule', { schedule: item })}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteSchedule(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Schedules</Text>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateSchedule')}
      >
        <Text style={styles.createButtonText}>Create New Schedule</Text>
      </TouchableOpacity>

      <FlatList
        data={schedules}
        keyExtractor={item => item.id}
        renderItem={renderSchedule}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>No schedules created yet.</Text>
        }
      />
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
  createButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduleContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1F2937',
  },
  scheduleDetails: {
    fontSize: 16,
    marginBottom: 5,
    color: '#4B5563',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#059669',
    padding: 10,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default MySchedules;
