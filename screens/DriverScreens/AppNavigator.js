import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';


import { Ionicons } from '@expo/vector-icons';



const AppNavigator = () => {
  const navigation = useNavigation();
  return (
    <View style={footerStyles.footer}>
        <TouchableOpacity 
          style={footerStyles.footerItem}
          onPress={() => navigation.navigate('DriverHome')}
        >
          <Ionicons name="home" size={24} color="#3B82F6" />
          <Text style={footerStyles.footerText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={footerStyles.footerItem}
          onPress={() => navigation.navigate('BookingManagement')}
        >
          <Ionicons name="car" size={24} color="#3B82F6" />
          <Text style={footerStyles.footerText}>Trips</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={footerStyles.footerItem}
          onPress={() => navigation.navigate('DriverChats')}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#3B82F6" />
          <Text style={footerStyles.footerText}>Chats</Text>
        </TouchableOpacity>


        <TouchableOpacity 
          style={footerStyles.footerItem}
          onPress={() => navigation.navigate('DriverInbox')}
        >
          <Ionicons name="mail" size={24} color="#3B82F6" />
          <Text style={footerStyles.footerText}>Inbox</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={footerStyles.footerItem}
          onPress={() => navigation.navigate('DriverProfileScreen')}
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
