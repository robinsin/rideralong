import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const useNotificationCounts = () => {
  const [counts, setCounts] = useState({
    inbox: 0,
    bookings: 0,
    chats: 0
  });
  
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    // Query for unread notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    // Query for pending bookings
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('passengerId', '==', userId),
      where('status', '==', 'pending')
    );

    // Query for unread chats
    const chatsQuery = query(
      collection(db, 'chats'),
      where('passengerId', '==', userId),
      where('unreadPassengerMessages', '>', 0)
    );

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      setCounts(prev => ({ ...prev, inbox: snapshot.size }));
    });

    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      setCounts(prev => ({ ...prev, bookings: snapshot.size }));
    });

    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      setCounts(prev => ({ ...prev, chats: snapshot.size }));
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeBookings();
      unsubscribeChats();
    };
  }, [userId]);

  return counts;
};
