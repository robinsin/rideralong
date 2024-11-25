import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PassengerProfile = () => {
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    profilePhoto: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser.uid;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userRef = doc(db, 'User', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      setUserProfile(userDoc.data());
    }
  };

  const handleSaveProfile = async () => {
    try {
      const userRef = doc(db, 'User', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await updateDoc(userRef, userProfile);
      } else {
        await setDoc(userRef, userProfile);
      }

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
  
        const userRef = doc(db, 'User', userId);
        const userDoc = await getDoc(userRef);
  
        if (userDoc.exists()) {
          await updateDoc(userRef, { profilePhoto: downloadURL });
        } else {
          await setDoc(userRef, { 
            ...userProfile, 
            profilePhoto: downloadURL,
            email: auth.currentUser.email 
          });
        }
  
        Alert.alert('Success', 'Profile image updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      Alert.alert('Error', 'Failed to update profile image');
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: userProfile.profilePhoto || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.changePhotoButton} onPress={handleImageSelection}>
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
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
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.buttonText}>Save Profile</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{userProfile.firstName} {userProfile.lastName}</Text>
            
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{userProfile.phoneNumber}</Text>
            
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{userProfile.email}</Text>

            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  changePhotoButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 5,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
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

export default PassengerProfile;
