import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

const ChatScreen = ({ route, navigation }) => {
  const { chatId = '', passengerId = '', driverId = '' } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserName, setOtherUserName] = useState('');
  const socket = useRef(null);
  
  const auth = getAuth();
  const db = getFirestore();
  const currentUserId = auth.currentUser.uid;

  const fetchOtherUserName = async () => {
    try {
      const otherUserId = currentUserId === driverId ? passengerId : driverId;
      const userRef = doc(db, 'User', otherUserId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setOtherUserName(`${userData.firstName} ${userData.lastName}`);
      }
    } catch (error) {
      console.log('Error fetching user details:', error);
    }
  };

  const subscribeToMessages = () => {
    const chatDocRef = doc(db, 'chats', chatId);
    const messagesCollectionRef = collection(chatDocRef, 'messages');
    const q = query(messagesCollectionRef, orderBy('timestamp', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messageList);
    });
  };

  useEffect(() => {
    if (!chatId || !passengerId || !driverId) {
      navigation.goBack();
      return;
    }
    
    fetchOtherUserName();
    const unsubscribe = subscribeToMessages();

    // Socket.io connection
    socket.current = io(SOCKET_URL);
    socket.current.emit('joinChat', chatId);
    socket.current.emit('userConnected', currentUserId);

    socket.current.on('newMessage', (message) => {
      setMessages(prev => [message, ...prev]);
    });

    return () => {
      unsubscribe();
      socket.current.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    if (newMessage.trim().length === 0) return;

    const messageData = {
      chatId,
      text: newMessage,
      senderId: currentUserId,
      timestamp: Date.now()
    };
    
    // Send through Socket.io
    socket.current.emit('sendMessage', messageData);

    // Store in Firebase
    const chatDocRef = doc(db, 'chats', chatId);
    const messagesCollectionRef = collection(chatDocRef, 'messages');
    await addDoc(messagesCollectionRef, {
      text: newMessage,
      senderId: currentUserId,
      timestamp: serverTimestamp(),
      read: false
    });
    if (pushToken) {
      await sendPushNotification(pushToken, {
        title: 'New Message',
        body: newMessage
      });
    }

    setNewMessage('');
  };

 
  const renderMessage = ({ item }) => {
    const isOwnMessage = item.senderId === currentUserId;

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { flex: 1 }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Chat with {otherUserName}</Text>
        </View>
  
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          inverted
          style={styles.messagesList}
        />
  
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            maxHeight={100}
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={sendMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#1F2937',
  },
  
  inputContainer: {
    flexDirection: 'row',
    padding: 40,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
