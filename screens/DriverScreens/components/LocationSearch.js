// LocationSearch.js
import React from 'react';
import { View, Alert, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const LocationSearch = ({ placeholder, onLocationSelect }) => {
  const handleLocationSelect = (data, details = null) => {
    console.log("onPress triggered in GooglePlacesAutocomplete", data);
    if (details && details.geometry) {
        console.log("Location details:", details.geometry.location);
    }
    onLocationSelect(location);
 };
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        onPress={handleLocationSelect}
        query={{
          key: 'AIzaSyCVbjNJuL0vFu4dHei5-XBl_4fYLXZQSg8',
          language: 'en',
          components: 'country:ng',
        }}
        fetchDetails={true}
        enablePoweredByContainer={false}
        styles={{
          textInput: styles.input,
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  listView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  description: {
    fontSize: 14,
    color: '#1F2937',
  },
});

export default LocationSearch;
