import React from 'react';
import { View, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const TestAutocomplete = () => (
  <View>
    <GooglePlacesAutocomplete
      placeholder="Search"
      onPress={(data, details = null) => {
        console.log("Selected location:", data, details);
      }}
      query={{
        key: 'YOUR_API_KEY',
        language: 'en',
        components: 'country:ng',
      }}
      fetchDetails={true}
    />
  </View>
);

export default TestAutocomplete;
