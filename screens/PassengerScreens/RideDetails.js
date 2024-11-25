import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, runTransaction, doc, serverTimestamp, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import MapView, { Marker } from 'react-native-maps';
//import { createChat, testChatConnection } from './firebase';
//import { db } from './firebase';
import { addDoc } from 'firebase/firestore';
import { sendPushNotification, getNotificationToken } from '../../notifications';



const RideDetails = ({ route, navigation }) => {
  const { ride } = route.params;
  const [driverInfo, setDriverInfo] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState(null);

  const auth = getAuth();
  const db = getFirestore();
  

  useEffect(() => {
    fetchDriverInfo();
    fetchVehicleInfo();
  }, []);

  const fetchDriverInfo = async () => {
    try {
      // Fetch basic driver info
      const userDoc = await getDoc(doc(db, 'User', ride.driverId));
      const driverProfileDoc = await getDoc(doc(db, 'Driver', ride.driverId, 'DriverProfile', 'driverInfo'));
      
      // Fetch all completed and rated bookings for this driver
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('driverId', '==', ride.driverId),
        where('rating', '>', 0)
      );
      
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const ratings = bookingsSnapshot.docs.map(doc => doc.data().rating);
      
      const averageRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;
  
      setDriverInfo({
        ...userDoc.data(),
        ...driverProfileDoc.data(),
        averageRating,
        totalRatings: ratings.length
      });
    } catch (error) {
      console.log('Error fetching driver info:', error);
    }
  };
  
  
  
  const fetchVehicleInfo = async () => {
    try {
      console.log('Fetching vehicle info:', ride.vehicleId);
      const vehicleDoc = await getDoc(doc(db, 'Driver', ride.driverId, 'addVehicle', ride.vehicleId));
      if (vehicleDoc.exists()) {
        console.log('Vehicle info found:', vehicleDoc.data());
        setVehicleInfo(vehicleDoc.data());
      }
    } catch (error) {
      console.log('Error fetching vehicle info:', error);
    }
  };

  const testChatConnection = async (driverId, passengerId) => {
    const chatId = `test_${driverId}_${passengerId}`;
    const chatRef = await addDoc(collection(db, 'chats'), {
      rideId: 'test_ride',
      passengerId,
      driverId,
      createdAt: serverTimestamp()
    });
    
    await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
      text: "Test message initiated",
      senderId: passengerId,
      timestamp: serverTimestamp(),
      read: false
    });
    
    return chatRef.id;
  };

  const handleBooking = async (rideId, passengerId, driverId) => {
    try {
      await runTransaction(db, async (transaction) => {
        const rideRef = doc(db, 'rides', rideId);
        const bookingRef = doc(db, 'bookings', `${rideId}_${passengerId}`);
        const chatRef = doc(db, 'chats', `ride_${rideId}`);
        
        const rideDoc = await transaction.get(rideRef);
        
        if (!rideDoc.exists()) {
          throw "Ride does not exist!";
        }
        
        
  
        // Create booking document
        transaction.set(bookingRef, {
          rideId,
          passengerId,
          driverId,
          status: 'pending',
          createdAt: serverTimestamp(),
          price: rideDoc.data().ridePrice,
          startLocation: rideDoc.data().startLocation,
          endLocation: rideDoc.data().endLocation,
          scheduleDate: rideDoc.data().scheduleDate,
          startTime: rideDoc.data().startTime
        });
  
        
        // Create chat channel
        transaction.set(chatRef, {
          rideId: ride.id,
          passengerId: auth.currentUser.uid,
          driverId: ride.driverId,
          createdAt: serverTimestamp()
        });
  
        return { success: true, chatId: `ride_${rideId}` };
      });
  
      return { success: true };
    } catch (error) {
      console.error("Booking error:", error);
      return { success: false };
    }
  };
  
  
  
  const handleBookRide = async () => {
    const passengerId = auth.currentUser.uid;
    
    // Get driver's push token
    const driverDoc = await getDoc(doc(db, 'User', ride.driverId));
    const driverPushToken = driverDoc.data().expoPushToken;
    console.log('Driver push token:', driverPushToken);

    const result = await handleBooking(ride.id, passengerId, ride.driverId);
   
    if (result.success) {
      // Send notification
      if (driverPushToken) {
        console.log('Sending notification to driver');
        await sendPushNotification(driverPushToken, {
          title: "New Booking Request",
          body: "You have a new ride booking request"
        });
      }
      // Store notification in Firestore
      await addDoc(collection(db, 'notifications'), {
        type: 'booking',
        recipientId: ride.driverId,
        senderId: auth.currentUser.uid,
        title: "New Booking Request",
        body: "You have a new ride booking request",
        rideId: ride.id,
        status: 'unread',
        createdAt: serverTimestamp()
      });

      Alert.alert(
        "Booking Successful",
        "Your ride has been booked! You can now chat with your driver.",
        [
          {
            text: "Message Driver",
            onPress: () => navigation.navigate('ChatScreen', {
              chatId: `ride_${ride.id}`,
              passengerId: auth.currentUser.uid,
              driverId: ride.driverId,
              rideId: ride.id
            })
          },
          {
            text: "View Bookings",
            onPress: () => navigation.navigate('PassengerBookings')
          }
        ]
      );
    } else {
      Alert.alert("Booking Failed", "Unable to book ride. Please try again.");
    }
};

  

  const handleMessageDriver = () => {
    navigation.navigate('ChatScreen', {
      chatId: `ride_${ride.id}`,
      passengerId: auth.currentUser.uid,
      driverId: ride.driverId
    });
  };


  const createChatChannel = async (rideId, passengerId, driverId) => {
    const chatRef = await addDoc(collection(db, 'chats'), {
      rideId,
      passengerId,
      driverId,
      createdAt: serverTimestamp()
    });
  
    // Add initial message
    await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
      text: "Booking confirmed! You can now chat with your driver.",
      senderId: 'system',
      timestamp: serverTimestamp(),
      read: false
    });
  
    return chatRef.id;
  };
  
  
    return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: ride.startLocation.latitude,
          longitude: ride.startLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={ride.startLocation}
          title="Pick-up"
          pinColor="green"
        />
        <Marker
          coordinate={ride.endLocation}
          title="Drop-off"
          pinColor="red"
        />
      </MapView>

      <ScrollView style={styles.detailsContainer}>
        <Text style={styles.title}>Ride Details</Text>
        {driverInfo && (
  <View style={styles.driverInfo}>
    <Image 
      source={{ uri: driverInfo.profilePhoto || 'https://via.placeholder.com/50' }}
      style={styles.driverPhoto}
    />
    <View style={styles.driverTextInfo}>
      <Text style={styles.driverName}>
        {driverInfo.firstName} {driverInfo.lastName}
      </Text>
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>
          ⭐ {driverInfo.averageRating?.toFixed(1) || 'New'} 
          ({driverInfo.totalRatings || 0} ratings)
        </Text>
      </View>
    </View>
  </View>
)}

        <View style={styles.vehicleInfo}>
          <Image 
            source={{ uri: vehicleInfo?.vehiclePhoto }}
            style={styles.vehiclePhoto}
          />
          <Text style={styles.vehicleText}>
            {vehicleInfo?.vehicleMake} {vehicleInfo?.vehicleModel}
          </Text>
          <Text style={styles.licensePlate}>{vehicleInfo?.licensePlate}</Text>
        </View>

        <Text style={styles.routeTitle}>Route Details</Text>
        <Text style={styles.locationText}>From: {ride.startLocation.title}</Text>
        
        {ride.optionalStops?.map((stop, index) => (
          <Text key={index} style={styles.stopText}>
            Stop {index + 1}: {stop.title}
          </Text>
        ))}
        
        <Text style={styles.locationText}>To: {ride.endLocation.title}</Text>
        <Text style={styles.scheduleDetails}>
          Date: {ride.scheduleDate} | Time: {ride.startTime}
        </Text>
        <Text style={styles.priceText}>₦{ride.ridePrice}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={handleBookRide}
          >
            <Text style={styles.buttonText}>Book Ride</Text>
          </TouchableOpacity>
          <TouchableOpacity 
  style={[styles.bookButton, { marginTop: 10, backgroundColor: '#059669' }]}
  onPress={handleMessageDriver}
>
  <Text style={styles.buttonText}>Message Driver</Text>
</TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  map: {
    height: '20%',
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  driverPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  driverTextInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  driverContact: {
    fontSize: 14,
    color: '#6B7280',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  vehiclePhoto: {
    width: 60,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  vehicleTextInfo: {
    flex: 1,
  },
  vehicleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  licensePlate: {
    fontSize: 14,
    color: '#6B7280',
  },
  routeContainer: {
    marginBottom: 15,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
  },
  stopText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 15,
    marginBottom: 8,
  },
  scheduleDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#059669',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  bookButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
  },
});


export default RideDetails;
