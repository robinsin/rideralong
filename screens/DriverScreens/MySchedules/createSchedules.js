import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const CreateSchedule = ({ route, navigation }) => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [ridePrice, setRidePrice] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [driverRoutes, setDriverRoutes] = useState([]);



  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    fetchVehicles();
    fetchDriverRoutes();
  }, []);
  const fetchVehicles = async () => {
    const userId = auth.currentUser.uid;
    const vehiclesSnapshot = await getDocs(collection(db, 'Driver', userId, 'addVehicle'));
    const vehicleList = vehiclesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setVehicles(vehicleList);
  };


  const fetchRoutes = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    const routesSnapshot = await getDocs(collection(db, 'Drivers', user.uid, 'driverRoutes'));
    const routesList = routesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setRoutes(routesList);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchDriverRoutes = async () => {
    const userId = auth.currentUser.uid;
    const routesSnapshot = await getDocs(collection(db, 'Drivers', userId, 'driverRoutes'));
    const routesList = routesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDriverRoutes(routesList);
  };
  const handleCreateSchedule = async () => {
    try {
      const userId = auth.currentUser.uid;
      const scheduleData = {
        startLocation: selectedRoute.startLocation,
        endLocation: selectedRoute.endLocation,
        optionalStops: selectedRoute.optionalStops || [],
        ridePrice,
        scheduleDate: scheduleDate.toISOString().split('T')[0],
        startTime: startTime.toTimeString().split(' ')[0],
        routeId: selectedRoute.id,
        vehicleId: selectedVehicle.id,
        vehicleDetails: {
          make: selectedVehicle.vehicleMake,
          model: selectedVehicle.vehicleModel,
          licensePlate: selectedVehicle.licensePlate
        },
        availableSeats: 4, // Add default or configurable seats
        createdAt: serverTimestamp()
      };
  
      // Create schedule in driver's collection
      const scheduleRef = await addDoc(collection(db, `Driver/${userId}/DriverSchedules`), scheduleData);
  
      // Create corresponding ride
      const rideRef = await addDoc(collection(db, 'rides'), {
        ...scheduleData,
        driverId: userId,
        scheduleId: scheduleRef.id,
        vehicleId: selectedVehicle.id,  // Add this explicitly
        status: 'active'
      });
  
      Alert.alert(
        "Success",
        "Schedule and ride created successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error creating schedule:', error);
      Alert.alert("Error", "Failed to create schedule");
    }
  };
  

  
  

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setScheduleDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New Schedule</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select Route</Text>
        <View style={styles.pickerContainer}>
            <Picker
        selectedValue={selectedRoute}
        onValueChange={(itemValue) => setSelectedRoute(itemValue)}
      >
        <Picker.Item label="Select a route" value={null} />
        {routes.map((route) => (
          <Picker.Item 
            key={route.id}
            label={`${route.startLocation.title} → ${route.endLocation.title}`}
            value={route}
          />
        ))}
      </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
  <Text style={styles.label}>Select Vehicle</Text>
  <View style={styles.pickerContainer}>
    <Picker
      selectedValue={selectedVehicle}
      onValueChange={(itemValue) => setSelectedVehicle(itemValue)}
    >
      <Picker.Item label="Select a vehicle" value={null} />
      {vehicles.map((vehicle) => (
        <Picker.Item 
          key={vehicle.id}
          label={`${vehicle.vehicleMake} ${vehicle.vehicleModel} - ${vehicle.licensePlate}`}
          value={vehicle}
        />
      ))}
    </Picker>
  </View>
</View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ride Price (#)</Text>
        <TextInput
          style={styles.input}
          value={ridePrice}
          onChangeText={setRidePrice}
          keyboardType="numeric"
          placeholder="Enter ride price"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Schedule Date</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{scheduleDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Start Time</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text>{startTime.toLocaleTimeString()}</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={scheduleDate}
          mode="date"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          onChange={onTimeChange}
        />
      )}

      <TouchableOpacity 
        style={styles.createButton}
        onPress={handleCreateSchedule}
      >
        <Text style={styles.createButtonText}>Create Schedule</Text>
      </TouchableOpacity>
    </ScrollView>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#4B5563',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateSchedule;
