import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics when supported
isSupported()
  .then(yes => yes ? getAnalytics(app) : null)
  .catch(error => console.log('Analytics not supported'));

  export { app, auth, db }