import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAX7zVIF2DB_DRqFxKAmLlwjC-r41rKYXo",
  authDomain: "ridersalong-bfa93.firebaseapp.com",
  projectId: "ridersalong-bfa93",
  storageBucket: "ridersalong-bfa93.firebasestorage.app",
  messagingSenderId: "61089398757",
  appId: "1:61089398757:web:66dcbab0e252a14556790c",
  measurementId: "G-89C7YSXEZX"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

// Chat Functions
export const createChat = async (rideId, passengerId, driverId) => {
  const chatRef = collection(db, 'chats');
  return await addDoc(chatRef, {
    rideId,
    passengerId,
    driverId,
    createdAt: serverTimestamp(),
    lastMessage: null,
    lastMessageTime: null
  });
};

export const sendMessage = async (chatId, senderId, message) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  return await addDoc(messagesRef, {
    senderId,
    message,
    timestamp: serverTimestamp(),
    read: false
  });
};

export const testChatConnection = async (driverId, passengerId) => {
  try {
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
  } catch (error) {
    console.log('Test chat error:', error);
    throw error;
  }
};

export const createPassengerProfile = async (userId, profileData) => {
  const db = getFirestore();
  const profileRef = doc(db, 'Passenger', userId, 'Profile', 'details');
  
  const profile = {
    userId,
    personalInfo: {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phoneNumber: profileData.phoneNumber,
      email: profileData.email,
      profilePhoto: profileData.profilePhoto || null
    },
    preferences: {
      defaultPickupLocation: null,
      notificationSettings: {
        rideUpdates: true,
        chatMessages: true
      }
    },
    rideHistory: {
      totalRides: 0,
      completedRides: 0,
      cancelledRides: 0
    },
    ratings: {
      averageRating: 0,
      totalRatings: 0
    },
    createdAt: serverTimestamp(),
    lastUpdated: serverTimestamp()
  };

  return setDoc(profileRef, profile);
};


isSupported()
  .then(yes => yes ? getAnalytics(app) : null)
  .catch(error => console.log('Analytics not supported'));

export { app, auth, db };