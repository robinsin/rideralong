import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, orderBy, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const PassengerChats = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser.uid;

  useEffect(() => {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('passengerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(chatsList);
    });

    const unsubscribeFocus = navigation.addListener('focus', () => {
      resetUnreadCounts();
    });

    return () => {
      unsubscribe();
      unsubscribeFocus();
    };
  }, []);

  const resetUnreadCounts = async () => {
    const batch = db.batch();
    chats.forEach((chat) => {
      if (chat.unreadPassengerMessages > 0) {
        const chatRef = doc(db, 'chats', chat.id);
        batch.update(chatRef, { 
          unreadPassengerMessages: 0,
          lastViewed: serverTimestamp()
        });
      }
    });
    await batch.commit();
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatScreen', {
        chatId: item.id,
        passengerId: userId,
        driverId: item.driverId
      })}
    >
      <View style={styles.chatContent}>
        <View style={styles.textContainer}>
          <Text style={styles.chatTitle}>Chat with Driver</Text>
          <Text style={styles.chatSubtitle}>Ride ID: {item.rideId}</Text>
        </View>
        {item.unreadPassengerMessages > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadPassengerMessages}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Chats</Text>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No chats found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    color: '#1F2937',
  },
  chatItem: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 24,
  }
});

export default PassengerChats;
