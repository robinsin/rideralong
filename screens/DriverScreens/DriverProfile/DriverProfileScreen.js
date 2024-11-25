import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image, FlatList } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DriverProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    profilePhoto: ''
  });
  const [driverProfile, setDriverProfile] = useState({
    driverLicenseNumber: '',
    insuranceDetails: ''
  });
  const [vehicles, setVehicles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const db = getFirestore();
  const auth = getAuth();
  const userId = auth.currentUser.uid;

  useEffect(() => {
    fetchProfiles();
    fetchVehicles();
  }, []);

  const fetchProfiles = async () => {
    // Fetch User Profile
    const userDoc = await getDoc(doc(db, 'User', userId));
    if (userDoc.exists()) {
      setUserProfile(userDoc.data());
    }
  
    // Fetch Driver Profile and Ratings
    const driverDoc = await getDoc(doc(db, 'Driver', userId, 'DriverProfile', 'driverInfo'));
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('driverId', '==', userId),
      where('rating', '>', 0)
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const ratings = bookingsSnapshot.docs.map(doc => doc.data().rating);
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  
    if (driverDoc.exists()) {
      setDriverProfile({
        ...driverDoc.data(),
        averageRating,
        totalRatings: ratings.length
      });
    }
  };
  const fetchVehicles = async () => {
    const vehiclesSnapshot = await getDocs(collection(db, 'Driver', userId, 'addVehicle'));
    const vehicleList = vehiclesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setVehicles(vehicleList);
  };

  const handleSaveProfile = async () => {
    try {
      const userRef = doc(db, 'User', userId);
      const userDoc = await getDoc(userRef);
  
      // Create or update User document
      if (userDoc.exists()) {
        await updateDoc(userRef, userProfile);
      } else {
        await setDoc(userRef, userProfile);
      }
  
      // Update Driver Profile
      await updateDoc(doc(db, 'Driver', userId, 'DriverProfile', 'driverInfo'), driverProfile);
  
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const handleImageSelection = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const storage = getStorage();
        const imageUri = result.assets[0].uri;
        const imageRef = ref(storage, `user/profilePhoto/${userId}/profile.jpg`);

        const response = await fetch(imageUri);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob);

        const downloadURL = await getDownloadURL(imageRef);
        setUserProfile(prev => ({ ...prev, profilePhoto: downloadURL }));
        await updateDoc(doc(db, 'User', userId), { profilePhoto: downloadURL });

        Alert.alert('Success', 'Profile image updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      Alert.alert('Error', 'Failed to update profile image');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await deleteDoc(doc(db, 'Driver', userId, 'addVehicle', vehicleId));
      Alert.alert('Success', 'Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      Alert.alert('Error', 'Failed to delete vehicle');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: userProfile.profilePhoto || 'https://via.placeholder.com/150'
        }}
        style={styles.profileImage}
      />
      <TouchableOpacity style={styles.changePhotoButton} onPress={handleImageSelection}>
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      {isEditing ? (
        <>
          <TextInput
            style={styles.input}
            value={userProfile.firstName}
            onChangeText={(text) => setUserProfile(prev => ({ ...prev, firstName: text }))}
            placeholder="First Name"
          />
          <TextInput
            style={styles.input}
            value={userProfile.lastName}
            onChangeText={(text) => setUserProfile(prev => ({ ...prev, lastName: text }))}
            placeholder="Last Name"
          />
          <TextInput
            style={styles.input}
            value={userProfile.email}
            onChangeText={(text) => setUserProfile(prev => ({ ...prev, email: text }))}
            placeholder="Email"
          />
          <TextInput
            style={styles.input}
            value={userProfile.phoneNumber}
            onChangeText={(text) => setUserProfile(prev => ({ ...prev, phoneNumber: text }))}
            placeholder="Phone Number"
          />
          <TextInput
            style={styles.input}
            value={driverProfile.driverLicenseNumber}
            onChangeText={(text) => setDriverProfile(prev => ({ ...prev, driverLicenseNumber: text }))}
            placeholder="Driver's License Number"
          />
          <TextInput
            style={styles.input}
            value={driverProfile.insuranceDetails}
            onChangeText={(text) => setDriverProfile(prev => ({ ...prev, insuranceDetails: text }))}
            placeholder="Insurance Details"
          />
          <Button title="Save" onPress={handleSaveProfile} />
        </>
      ) : (
        <>
          <Text style={styles.infoText}>Name: {userProfile.firstName} {userProfile.lastName}</Text>
          <Text style={styles.infoText}>Phone: {userProfile.phoneNumber}</Text>
          <Text style={styles.infoText}>Email: {userProfile.email}</Text>
          <Text style={styles.infoText}>License: {driverProfile.driverLicenseNumber}</Text>
          <Text style={styles.infoText}>Insurance: {driverProfile.insuranceDetails}</Text>
          <Button title="Edit Profile" onPress={() => setIsEditing(true)} />
        </>
      )}

<View style={styles.ratingSection}>
  <Text style={styles.sectionTitle}>Driver Rating</Text>
  <View style={styles.ratingInfo}>
    <Text style={styles.ratingNumber}>
      ⭐ {driverProfile.averageRating?.toFixed(1) || 'New'}
    </Text>
    <Text style={styles.ratingCount}>
      Based on {driverProfile.totalRatings || 0} ratings
    </Text>
  </View>
</View>


      <Text style={styles.sectionTitle}>My Vehicles</Text>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.vehicleItem}>
            <Text>{item.vehicleMake} - {item.vehicleModel}</Text>
            <Text>License: {item.licensePlate}</Text>
            <Image
              source={item.vehiclePhoto ? { uri: item.vehiclePhoto } : require('./assets/default-car.png')}
              style={styles.vehicleImage}
            />
            <View style={styles.vehicleActions}>
              <TouchableOpacity onPress={() => navigation.navigate('VehicleManagementScreen', { vehicle: item })}>
                <Icon name="pencil" size={24} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteVehicle(item.id)}>
                <Icon name="trash-can" size={24} color="#F44336" />
              </TouchableOpacity>
            </View>
            
          </View>
          
        )}
      />
      <Button title="Add Vehicle" onPress={() => navigation.navigate('VehicleManagementScreen')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  profileImage: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginVertical: 10 },
  changePhotoButton: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#007bff', borderRadius: 5 },
  changePhotoText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  input: { borderWidth: 1, padding: 10, marginVertical: 5, borderRadius: 5 },
  infoText: { fontSize: 16, marginVertical: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  vehicleItem: { padding: 10, marginVertical: 5, borderWidth: 1, borderRadius: 5 },
  vehicleImage: { width: 100, height: 60, marginTop: 10 },
  vehicleActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  ratingSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  ratingCount: {
    fontSize: 14,
    color: '#6B7280',
  }
});

export default DriverProfileScreen;
