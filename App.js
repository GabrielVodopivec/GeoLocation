import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_TASK_NAME = 'background-location-task';

let positions = [];

const requestPermissions = async () => {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status === 'granted') {
    console.log("Start")
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval:5000,
      distanceInterval: 1
    });
  }
};

const stopTraking = async () => {
  try {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    const jsonLocations = JSON.stringify(positions)
    await AsyncStorage.setItem('Locations', jsonLocations);
  } catch ( error ) {
    console.log( error )
  }
  console.log("Stoped and Stored")
  
}

const getPositions = async () => {
  console.log("getting")
  try {
    const jsonSavedLocations = await AsyncStorage.getItem('Locations')
    console.log(jsonSavedLocations)
    console.log( jsonSavedLocations != null ? JSON.parse(jsonSavedLocations) : null )
  } catch ( error ) {
    console.log( error )
  }
  
}

const PermissionsButton = () => (
  <>
    <TouchableOpacity style={styles.container} onPress={requestPermissions}>
      <Text>Start background location </Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.container} onPress={stopTraking}>
      <Text>Stop background location </Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.container} onPress={getPositions}>
      <Text>Get location </Text>
    </TouchableOpacity>
  </>
);

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    console.log( error )
    return;
  }
  if (data) {
    const { locations } = data;
    positions = [
      ...positions,
      ...locations
    ]
    console.log( "posiciones: ", positions )
    console.log( "Cantidad de posiciones: ", positions.length )
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  }
});

export default PermissionsButton;
