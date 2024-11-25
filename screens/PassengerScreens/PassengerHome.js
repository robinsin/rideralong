import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import AppNavigator from './AppNavigator'


const PassengerHome = ({ navigation }) => {
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [availableRides, setAvailableRides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const db = getFirestore();

  const searchAvailableRides = async () => {
    if (!startLocation || !endLocation) return;
    
    setIsLoading(true);
    try {
      const ridesRef = collection(db, 'rides');
      const q = query(
        ridesRef, 
        where('status', '==', 'active'),
      );
      
      const ridesSnapshot = await getDocs(q);
      const matchingRides = [];
  
      ridesSnapshot.docs.forEach(doc => {
        const ride = {
          id: doc.id,
          ...doc.data()
        };
        
        // Check if ride route matches search criteria
        const isRouteMatch = 
          (ride.startLocation?.title?.toLowerCase().includes(startLocation.title.toLowerCase()) ||
           ride.endLocation?.title?.toLowerCase().includes(endLocation.title.toLowerCase()));
  
        if (isRouteMatch) {
          matchingRides.push(ride);
        }
      });
  
      console.log(`Found ${matchingRides.length} matching rides`);
      setAvailableRides(matchingRides);
    } catch (error) {
      console.error("Error fetching rides: ", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  const toRad = (value) => {
    return value * Math.PI / 180;
  };
  
  useEffect(() => {
    if (endLocation && startLocation) {
      searchAvailableRides();
    }
  }, [endLocation]);

  const renderRideItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.rideItem}
      onPress={() => navigation.navigate('RideDetails', { ride: item })}
    >
      <Text style={styles.routeText}>
        {item.startLocation.title} →
      </Text>
      {item.optionalStops?.map((stop, index) => (
        <Text key={index} style={styles.stopText}>
          {stop.title} →
        </Text>
      ))}
      <Text style={styles.routeText}>{item.endLocation.title}</Text>
      <Text style={styles.scheduleDetails}>
        Date: {item.scheduleDate} | Time: {item.startTime}
      </Text>
      <Text style={styles.priceText}>₦{item.ridePrice}</Text>
    </TouchableOpacity>
  );
  const GOOGLE_PLACES_API_KEY = 'AIzaSyCVbjNJuL0vFu4dHei5-XBl_4fYLXZQSg8';
  const [region, setRegion] = useState({
    latitude: 9.0820,
    longitude: 8.6753,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
      <GooglePlacesAutocomplete
  placeholder="Where from?"
  onPress={(data, details = null) => {
    if (details?.geometry?.location) {
      setStartLocation({
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        title: data.description
      });
    }
  }}
  query={{
    key: GOOGLE_PLACES_API_KEY,
    language: 'en',
    components: 'country:ng',
  }}
  fetchDetails
  styles={{
    container: styles.autocompleteContainer,
    textInput: styles.textInput,
    listView: styles.listView,
  }}
/>

<GooglePlacesAutocomplete
  placeholder="Where to?"
  onPress={(data, details = null) => {
    if (details?.geometry?.location) {
      setEndLocation({
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        title: data.description
      });
    }
  }}
  query={{
    key: GOOGLE_PLACES_API_KEY,
    language: 'en',
    components: 'country:ng',
  }}
  fetchDetails
  enablePoweredByContainer={false}
  styles={{
    container: styles.autocompleteContainer,
    textInput: styles.textInput,
    listView: styles.listView,
  }}
/>

      </View>

      <MapView
  style={styles.map}
  region={region}
>
  {startLocation && (
    <Marker
      coordinate={{
        latitude: startLocation.latitude,
        longitude: startLocation.longitude
      }}
      title={startLocation.title}
      pinColor="green"
    />
  )}
  {endLocation && (
    <Marker
      coordinate={{
        latitude: endLocation.latitude,
        longitude: endLocation.longitude
      }}
      title={endLocation.title}
      pinColor="red"
    />
  )}
</MapView>
<View style={styles.ridesContainer}>
        <Text style={styles.sectionTitle}>Available Rides</Text>
        <FlatList
          data={availableRides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
            ) : (
              <Text style={styles.emptyText}>No rides available for this route</Text>
            )
          }
        />
      </View>
      <AppNavigator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  map: {
    height: '50%', 
    width: '100%'
  },
  ridesContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flex: 1 // This will take up the remaining space
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1F2937',
  },
  rideItem: {
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  routeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scheduleDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#059669',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
  },
});

const searchInputStyles = {
  container: {
    marginBottom: 10,
  },
  textInput: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  listView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 5,
  },
};

export default PassengerHome;
