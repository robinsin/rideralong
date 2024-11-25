import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
//import { getFirestore, doc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';



const GOOGLE_PLACES_API_KEY = 'AIzaSyCVbjNJuL0vFu4dHei5-XBl_4fYLXZQSg8';

const EditRoute = ({ route, navigation }) => {
  const { route: initialRouteData } = route.params;
  const [region, setRegion] = useState({
      latitude: initialRouteData.startLocation.latitude,
      longitude: initialRouteData.startLocation.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
  });

  const [routeName, setRouteName] = useState(initialRouteData.routeName);
  const [markers, setMarkers] = useState({
    start: initialRouteData.startLocation,
    end: initialRouteData.endLocation
  });
  const [optionalStops, setOptionalStops] = useState(initialRouteData.optionalStops || []);
  const [currentStop, setCurrentStop] = useState(null);

  const auth = getAuth();
  const db = getFirestore();

  const handleUpdateRoute = async () => {
    if (!routeName || !markers.start || !markers.end) {
      alert('Please fill in all required fields');
      return;
    }
  
    try {
      const user = auth.currentUser;
      const routeRef = doc(db, 'Drivers', user.uid, 'driverRoutes', initialRouteData.id);
  
      const routeData = {
        routeName,
        startLocation: markers.start,
        endLocation: markers.end,
        optionalStops,
        updatedAt: serverTimestamp(),
      };
  
      // Use setDoc with merge option instead of updateDoc
      await setDoc(routeRef, routeData, { merge: true });
  
      alert('Route updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error("Error updating route: ", error);
      alert('Failed to update route. Please try again.');
    }
  };
  
  
  const addOptionalStop = () => {
    if (currentStop) {
      setOptionalStops((prevStops) => [...prevStops, currentStop]);
      setCurrentStop(null);
    } else {
      alert('Please select a location before adding.');
    }
  };

  const removeOptionalStop = (index) => {
    setOptionalStops((prevStops) => prevStops.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        {markers.start && (
          <Marker coordinate={markers.start} title={markers.start.title} pinColor="green" />
        )}
        {optionalStops.map((stop, index) => (
          <Marker key={index} coordinate={stop} title={stop.title} pinColor="blue" />
        ))}
        {markers.end && (
          <Marker coordinate={markers.end} title={markers.end.title} pinColor="red" />
        )}
      </MapView>
      
      <Text style={styles.label}>Route Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter route name"
        value={routeName}
        onChangeText={setRouteName}
      />

      <View style={styles.autocompleteWrapper}>
        <Text style={styles.label}>Start Location</Text>
        <GooglePlacesAutocomplete
          placeholder="Update start location"
          onPress={(data, details = null) => {
            if (details?.geometry?.location) {
              const location = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                title: data.description,
              };
              setMarkers((prev) => ({...prev, start: location}));
              setRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
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
      </View>

      <View style={styles.autocompleteWrapper}>
        <Text style={styles.label}>Optional Stop</Text>
        <GooglePlacesAutocomplete
          placeholder="Enter an optional stop"
          onPress={(data, details = null) => {
            if (details?.geometry?.location) {
              const location = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                title: data.description,
              };
              setCurrentStop(location);
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
        <Button title="Add Optional Stop" onPress={addOptionalStop} color="#34D399" />
      </View>

      <FlatList
        data={optionalStops}
        keyExtractor={(item, index) => `${item.latitude}-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.optionalStopItem}>
            <Text style={styles.optionalStopText}>{item.title}</Text>
            <TouchableOpacity onPress={() => removeOptionalStop(index)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.autocompleteWrapper}>
        <Text style={styles.label}>End Location</Text>
        <GooglePlacesAutocomplete
          placeholder="Update end location"
          onPress={(data, details = null) => {
            if (details?.geometry?.location) {
              const location = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                title: data.description,
              };
              setMarkers((prev) => ({...prev, end: location}));
              setRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
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
      </View>

      <Button title="Update Route" onPress={handleUpdateRoute} color="#007BFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#1F2937',
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#4B5563',
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  autocompleteWrapper: {
    zIndex: 2,
    marginBottom: 16,
  },
  autocompleteContainer: {
    flex: 0,
    width: '100%',
  },
  textInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listView: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 4,
  },
  optionalStopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionalStopText: {
    fontSize: 14,
    color: '#374151',
  },
  removeButton: {
    backgroundColor: '#EF4444',
    borderRadius: 4,
    padding: 4,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  map: {
    flex: 1,
    borderRadius: 10,
    marginTop: 16,
  },
});

export default EditRoute;
