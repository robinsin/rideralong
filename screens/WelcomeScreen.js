// WelcomeScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image  } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    
    <View style={styles.container}>
    {/* Background Image */}
    <Image 
      source={{ uri: 'https://weetracker.com/wp-content/uploads/2023/06/Taxi-Services-02.png' }} // Replace with your actual image URL
      style={styles.backgroundImage} 
    />

    {/* Text Content */}
    <View style={styles.contentContainer}>
      <Text style={styles.title}>Ride with people like you</Text>
      <Text style={styles.subtitle}>We match you with drivers going your way. Book a ride in just a few taps.</Text>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Already have an account Link */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account?</Text>
      </TouchableOpacity>
    </View>
    </View>
    
  );
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8FAFC',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backgroundImage: {
      position: 'absolute',
      top: 0,
      width: '100%',
      height: '50%',
      resizeMode: 'cover',
    },
    contentContainer: {
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: '60%', // Adjust this value to position content below the image
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000',
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: '#6B7280',
      textAlign: 'center',
      marginBottom: 30,
    },
    button: {
      backgroundColor: '#E5E7EB',
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 8,
      marginBottom: 20,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
    },
    linkText: {
      fontSize: 14,
      color: '#1D4ED8',
    },
  });

export default WelcomeScreen;