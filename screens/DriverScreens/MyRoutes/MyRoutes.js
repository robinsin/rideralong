import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const MyRoutes = ({ navigation }) => {
  const [routes, setRoutes] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      const routesSnapshot = await getDocs(collection(db, 'Drivers', user.uid, 'driverRoutes'));
      
      const fetchedRoutes = routesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      setRoutes(fetchedRoutes);
    } catch (error) {
      console.error("Error fetching routes: ", error);
      Alert.alert("Error", "Could not fetch routes. Please try again.");
    }
  };
  

  const handleDelete = async (routeId) => {
    try {
      const user = auth.currentUser;
      const routeRef = doc(db, 'Drivers', user.uid, 'driverRoutes', routeId);
      await deleteDoc(routeRef);
      setRoutes(routes.filter(route => route.id !== routeId));
      Alert.alert("Success", "Route deleted successfully");
    } catch (error) {
      Alert.alert("Error", "Could not delete the route");
    }
  };

  const renderRoute = ({ item }) => (
    <View style={styles.routeContainer}>
      <View style={styles.mapPreview}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.miniMap}
          initialRegion={{
            latitude: item.startLocation.latitude,
            longitude: item.startLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: item.startLocation.latitude,
              longitude: item.startLocation.longitude,
            }}
            title="Start"
            pinColor="green"
          />
          <Marker
            coordinate={{
              latitude: item.endLocation.latitude,
              longitude: item.endLocation.longitude,
            }}
            title="End"
            pinColor="red"
          />
        </MapView>
      </View>
  
      <Text style={styles.routeName}>{item.routeName}</Text>
      <Text style={styles.routeText}>From: {item.startLocation.title}</Text>
      <Text style={styles.routeText}>To: {item.endLocation.title}</Text>
  
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditRoute', { route: item })}
        >
          <Text style={styles.buttonText}>Edit Route</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Routes</Text>
      
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('RouteCreation')}
      >
        <Text style={styles.createButtonText}>Create New Route</Text>
      </TouchableOpacity>

      <FlatList
        data={routes}
        keyExtractor={item => item.id}
        renderItem={renderRoute}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No routes created yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapPreview: {
    height: 150,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1F2937',
  },
  routeText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#4B5563',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  editButton: {
    backgroundColor: '#059669',
    padding: 10,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default MyRoutes;
