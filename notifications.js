import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { getFirestore, doc, updateDoc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const projectId = "be8c496f-ccf5-4def-8b14-778958cf888d"; // Get this from app.json or app.config.js

export const registerForPushNotifications = async (userId) => {
  const db = getFirestore();
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: "be8c496f-ccf5-4def-8b14-778958cf888d" // Get this from Expo dashboard
    })).data;

    await updateDoc(doc(db, 'User', userId), {
      expoPushToken: token
    });
    return token;
  }
};

export const sendPushNotification = async (expoPushToken, { title, body }) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { someData: 'goes here' },
    priority: 'high',
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  
  return response;
};

export const storeNotification = async (notification) => {
  const db = getFirestore();
  return await addDoc(collection(db, 'notifications'), {
    ...notification,
    createdAt: serverTimestamp(),
    read: false
  });
};
export const getNotificationToken = async (userId) => {
  const db = getFirestore();
  const userDoc = await getDoc(doc(db, 'User', userId));
  return userDoc.data()?.expoPushToken;
};
