import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditSchedule = ({ route, navigation }) => {
  const { schedule } = route.params;
  const [ridePrice, setRidePrice] = useState(schedule.ridePrice);
  const [scheduleDate, setScheduleDate] = useState(new Date(schedule.scheduleDate));
  const [startTime, setStartTime] = useState(new Date(`2000-01-01T${schedule.startTime}`));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  const handleUpdateSchedule = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const scheduleRef = doc(db, `Driver/${user.uid}/DriverSchedules/${schedule.id}`);
      
      await updateDoc(scheduleRef, {
        ridePrice,
        scheduleDate: scheduleDate.toISOString().split('T')[0],
        startTime: startTime.toTimeString().split(' ')[0],
        // Preserve existing location and vehicle data
        startLocation: schedule.startLocation,
        endLocation: schedule.endLocation,
        optionalStops: schedule.optionalStops || [],
        vehicleDetails: schedule.vehicleDetails,
        routeId: schedule.routeId,
        vehicleId: schedule.vehicleId
      });

      Alert.alert(
        "Success",
        "Schedule updated successfully",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update schedule");
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
    <View style={styles.container}>
      <Text style={styles.title}>Edit Schedule</Text>

      <View style={styles.routeInfo}>
        <Text style={styles.routeText}>
          Route: {schedule.startLocation.title} → {schedule.endLocation.title}
        </Text>
        {schedule.optionalStops && schedule.optionalStops.length > 0 && (
          <Text style={styles.routeText}>
            Via: {schedule.optionalStops.map(stop => stop.title).join(', ')}
          </Text>
        )}
      </View>

      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleText}>
          Vehicle: {schedule.vehicleDetails.make} {schedule.vehicleDetails.model}
        </Text>
        <Text style={styles.vehicleText}>
          License Plate: {schedule.vehicleDetails.licensePlate}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ride Price (₦)</Text>
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
        style={styles.updateButton}
        onPress={handleUpdateSchedule}
      >
        <Text style={styles.updateButtonText}>Update Schedule</Text>
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
  routeInfo: {
    backgroundColor: '#E5E7EB',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  routeText: {
    fontSize: 16,
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
  updateButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vehicleInfo: {
    backgroundColor: '#E5E7EB',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  vehicleText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 5,
  },
  routeText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 5,
  }
});

export default EditSchedule;
