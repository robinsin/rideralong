import React, { useEffect, useRef } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import './config/firebase';



import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';

import RoleSelection from './screens/Roleselection';

import DriverHome from './screens/DriverScreens/DriverHome';
import RouteCreation from './screens/DriverScreens/MyRoutes/RouteCreation';
import UpcomingRides from './screens/DriverScreens/UpcomingRides';
import MyRoutes from './screens/DriverScreens/MyRoutes/MyRoutes';
import EditRoute from './screens/DriverScreens/MyRoutes/EditRoute';
import MySchedules from './screens/DriverScreens/MySchedules/MySchedules';
import EditSchedule from './screens/DriverScreens/MySchedules/editSchedule';
import CreateSchedule from './screens/DriverScreens/MySchedules/createSchedules';
import DriverProfileScreen from './screens/DriverScreens/DriverProfile/DriverProfileScreen';
import VehicleManagementScreen from './screens/DriverScreens/DriverProfile/VehicleManagementScreen';
import TripHistoryScreen from './screens/DriverScreens/DriverProfile/TripHistoryScreen';
import DriverInbox from './screens/DriverScreens/Notifications/DriverInbox';
import BookingManagement from './screens/DriverScreens/Booking/BookingManagement';

import DriverChats from './screens/DriverScreens/DriverChats';

import PassengerHome from './screens/PassengerScreens/PassengerHome';
import RideDetails from './screens/PassengerScreens/RideDetails';
import PassengerProfile from './screens/PassengerScreens/PassengerProfileScreen/PassengerProfile';
import PassengerChats from './screens/PassengerScreens/PassengerChats';
import PassengerBooking from './screens/PassengerScreens/Booking/PassengerBookings';
import RateRide from './screens/PassengerScreens/Booking/RateRide';
import PassengerInbox from './screens/PassengerScreens/Notifications/PassengerInbox';

import ChatScreen from './screens/ChatScreen';
import PassengerBookings from './screens/PassengerScreens/Booking/PassengerBookings';

import * as Notifications from 'expo-notifications';
const Stack = createNativeStackNavigator();
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: 'high'
  }),
});

function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Received notification:', notification);
    });
  
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });
  
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />

        <Stack.Screen name="RoleSelection" component={RoleSelection} />

        <Stack.Screen name="DriverHome" component={DriverHome} />
        <Stack.Screen name="UpcomingRides" component={UpcomingRides} />
        <Stack.Screen name="MyRoutes" component={MyRoutes} />
        <Stack.Screen name="RouteCreation" component={RouteCreation} />
        <Stack.Screen name="EditRoute" component={EditRoute} />
        <Stack.Screen name="MySchedules" component={MySchedules} />
        <Stack.Screen name="EditSchedule" component={EditSchedule} />
        <Stack.Screen name="CreateSchedule" component={CreateSchedule} />
        <Stack.Screen name="DriverProfileScreen" component={DriverProfileScreen} />
        <Stack.Screen name="VehicleManagementScreen" component={VehicleManagementScreen} />
        <Stack.Screen name="TripHistoryScreen" component={TripHistoryScreen} />
        <Stack.Screen name="DriverInbox" component={DriverInbox} />
        <Stack.Screen name="DriverChats" component={DriverChats} />
        <Stack.Screen name="BookingManagement" component={BookingManagement} />


        <Stack.Screen name="PassengerHome" component={PassengerHome} />
        <Stack.Screen name="RideDetails" component={RideDetails} />
        <Stack.Screen name="PassengerProfile" component={PassengerProfile} />
        <Stack.Screen name="PassengerBookings" component={PassengerBookings} />
        <Stack.Screen name="PassengerChats" component={PassengerChats} />
        <Stack.Screen name="RateRide" component={RateRide} />
        <Stack.Screen name="PassengerInbox" component={PassengerInbox} />

        <Stack.Screen name="ChatScreen" component={ChatScreen}options={{title: 'Chat',headerShown: true}}/>
        


      </Stack.Navigator>
      
      
    </NavigationContainer>
  );
}

export default App;
