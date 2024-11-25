import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';

import ROUTES from './constants/routes';

const RoleSelection = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = async (route) => {
    setIsLoading(true);
    try {
      await navigation.navigate(route);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ride Along</Text>
        <FontAwesome5 name="cog" solid size={24} color="black" />
      </View>

      <Text style={styles.message}>What would you like to do today?</Text>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate(ROUTES.DRIVER_HOME)}>
  <Text style={styles.optionText}>Offer a ride</Text>
  <FontAwesome5 name="chevron-right" size={16} color="black" />
</TouchableOpacity>

<TouchableOpacity style={styles.option} onPress={() => navigation.navigate(ROUTES.PASSENGER_HOME)}>
  <Text style={styles.optionText}>Book a ride</Text>
  <FontAwesome5 name="chevron-right" size={16} color="black" />
</TouchableOpacity>

    </View>
  );
};

RoleSelection.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }),


  
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  message: {
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
  },
});

export default RoleSelection;
