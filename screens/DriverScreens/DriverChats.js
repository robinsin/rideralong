import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const DriverChats = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('driverId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(chatsList);
    });

    return () => unsubscribe();
  }, []);

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatScreen', {
        chatId: item.id,
        passengerId: item.passengerId,
        driverId: auth.currentUser.uid
      })}
    >
      <Text style={styles.chatTitle}>Chat with Passenger</Text>
      <Text style={styles.chatSubtitle}>Ride ID: {item.rideId}</Text>
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
  chatItem: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  chatInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 24,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  routeText: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  scheduleText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  }
});

export default DriverChats;
