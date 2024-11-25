import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationCounts } from './Notifications//hooks/useNotificationCounts';
import NotificationBadge from './Notifications/NotificationBadge';

const AppNavigator = () => {
  const navigation = useNavigation();
  const notificationCounts = useNotificationCounts();

  return (
    <View style={footerStyles.footer}>
      <TouchableOpacity 
        style={footerStyles.footerItem}
        onPress={() => navigation.navigate('PassengerHome')}
      >
        <Ionicons name="home" size={24} color="#3B82F6" />
        <Text style={footerStyles.footerText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={footerStyles.footerItem}
        onPress={() => navigation.navigate('PassengerBookings')}
      >
        <View>
          <Ionicons name="car" size={24} color="#3B82F6" />
          <NotificationBadge count={notificationCounts.bookings} />
        </View>
        <Text style={footerStyles.footerText}>Rides</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={footerStyles.footerItem}
        onPress={() => navigation.navigate('PassengerChats')}
      >
        <View>
          <Ionicons name="chatbubbles-outline" size={24} color="#3B82F6" />
          <NotificationBadge count={notificationCounts.chats} />
        </View>
        <Text style={footerStyles.footerText}>Chats</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={footerStyles.footerItem}
        onPress={() => navigation.navigate('PassengerInbox')}
      >
        <View>
          <Ionicons name="mail" size={24} color="#3B82F6" />
          <NotificationBadge count={notificationCounts.inbox} />
        </View>
        <Text style={footerStyles.footerText}>Inbox</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={footerStyles.footerItem}
        onPress={() => navigation.navigate('PassengerProfile')}
      >
        <Ionicons name="person" size={24} color="#3B82F6" />
        <Text style={footerStyles.footerText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};
const footerStyles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
    color: '#3B82F6',
  },
});


export default AppNavigator;
