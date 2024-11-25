import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const VehicleManagementScreen = ({ route, navigation }) => {
  const { vehicle } = route.params || {};  // Get vehicle data if editing, else undefined
  const [vehicleMake, setVehicleMake] = useState(vehicle ? vehicle.vehicleMake : '');
  const [vehicleModel, setVehicleModel] = useState(vehicle ? vehicle.vehicleModel : '');
  const [licensePlate, setLicensePlate] = useState(vehicle ? vehicle.licensePlate : '');
  const [vehiclePhoto, setVehiclePhoto] = useState(vehicle ? vehicle.vehiclePhoto : '');
  const [isNewVehicle, setIsNewVehicle] = useState(!vehicle); // If no vehicle data passed, it's a new vehicle

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    if (vehicle) {
      setVehicleMake(vehicle.vehicleMake);
      setVehicleModel(vehicle.vehicleModel);
      setLicensePlate(vehicle.licensePlate);
      setVehiclePhoto(vehicle.vehiclePhoto);
    }
  }, [vehicle]);

  const handleImageSelection = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const userId = auth.currentUser.uid;
        const imageUri = result.assets[0].uri;

        const storage = getStorage();
        const imageRef = ref(storage, `/driver/driverProfile/carsImage/${userId}/${licensePlate}/vehicle.jpg`);

        const response = await fetch(imageUri);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob);

        const downloadURL = await getDownloadURL(imageRef);
        setVehiclePhoto(downloadURL);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select vehicle image. Please try again.');
    }
  };

  const handleSaveVehicle = async () => {
    if (!vehicleMake || !vehicleModel || !licensePlate) {
      Alert.alert('Error', 'Please fill in all vehicle details.');
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const vehicleId = vehicle ? vehicle.id : `${userId}_${licensePlate}`; // Use licensePlate as ID if it's a new vehicle
      const vehicleRef = doc(db, 'Driver', userId, 'addVehicle', vehicleId);

      const vehicleData = {
        vehicleMake,
        vehicleModel,
        licensePlate,
        vehiclePhoto,
      };

      if (isNewVehicle) {
        // Add new vehicle
        await setDoc(vehicleRef, vehicleData);
        Alert.alert('Success', 'Vehicle added successfully');
      } else {
        // Update existing vehicle
        await updateDoc(vehicleRef, vehicleData);
        Alert.alert('Success', 'Vehicle updated successfully');
      }

      navigation.goBack();  // Go back to the DriverProfileScreen or the previous screen
    } catch (error) {
      console.error('Error saving vehicle:', error);
      Alert.alert('Error', 'Failed to save vehicle details. Please try again.');
    }
  };

  const handleDeleteVehicle = async () => {
    try {
      const userId = auth.currentUser.uid;
      const vehicleRef = doc(db, 'Driver', userId, 'addVehicle', vehicle.id);
  
      // Delete vehicle document from Firestore
      await deleteDoc(vehicleRef);
  
      // Check if the vehicle photo exists and delete it from Firebase Storage
      if (vehicle.vehiclePhoto) {
        const storage = getStorage();
        const imageRef = ref(storage, `/driver/driverProfile/carsImage/${userId}/${licensePlate}/vehicle.jpg`);
        await deleteObject(imageRef);
      }
  
      Alert.alert('Success', 'Vehicle deleted successfully');
      navigation.goBack();  // Navigate back after deleting
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      Alert.alert('Error', 'Failed to delete vehicle. Please try again.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isNewVehicle ? 'Add New Vehicle' : 'Edit Vehicle'}</Text>

      <TextInput
        style={styles.input}
        value={vehicleMake}
        onChangeText={setVehicleMake}
        placeholder="Vehicle Make"
      />
      <TextInput
        style={styles.input}
        value={vehicleModel}
        onChangeText={setVehicleModel}
        placeholder="Vehicle Model"
      />
      <TextInput
        style={styles.input}
        value={licensePlate}
        onChangeText={setLicensePlate}
        placeholder="License Plate"
      />

      <View style={styles.imageContainer}>
        {vehiclePhoto ? (
          <Image source={{ uri: vehiclePhoto }} style={styles.vehicleImage} />
        ) : (
          <Text>No image selected</Text>
        )}
        <Button title="Select Vehicle Image" onPress={handleImageSelection} />
      </View>

      <Button title={isNewVehicle ? 'Save Vehicle' : 'Update Vehicle'} onPress={handleSaveVehicle} />

      {!isNewVehicle && (
        <Button title="Delete Vehicle" color="red" onPress={handleDeleteVehicle} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
  imageContainer: { alignItems: 'center', marginVertical: 20 },
  vehicleImage: { width: 200, height: 120, borderRadius: 10, marginBottom: 10 },
});

export default VehicleManagementScreen;
