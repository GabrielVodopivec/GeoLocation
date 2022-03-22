import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_TASK_NAME = 'backgroundLocationr';

const requestPermissions = async () => {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status === 'granted') {
    console.log("Start")
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      /* timeInterval:5000, */
      distanceInterval: 10
    });
  }
};

const stopTraking = async () => {
  try {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    
  } catch ( error ) {
    console.log( error )
  }
  console.log("Stoped and Stored")
  
}

const getPositions = async () => {
  console.log("getting")
  try {
    const jsonSavedLocations = await AsyncStorage.getItem('Locations')
    console.log( jsonSavedLocations != null ? JSON.parse(jsonSavedLocations) : null )
    console.log("Cantidad total de posiciones registradas: ",jsonSavedLocations != null ? JSON.parse(jsonSavedLocations).length : null )
    await AsyncStorage.clear()
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

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    console.log( error )
    return;
  }
  if (data) {
    try {
      const { locations } = data;
      const pos = await AsyncStorage.getItem('Locations');

      if (pos === null) {
        
        const newPos = locations[0].coords
        await AsyncStorage.setItem('Locations', JSON.stringify([newPos]))
      } else {
        const newPos = locations[0].coords
        const existentPos = await AsyncStorage.getItem('Locations');
        /* console.log( "Existent pos: ", existentPos ) */
        const parseexistentPos = JSON.parse(existentPos)
        const setNewPos = [...parseexistentPos, newPos]
        await AsyncStorage.setItem('Locations', JSON.stringify(setNewPos))
        console.log("SetNewPos: ", setNewPos )
      }
      /* console.log(pos) */
    } catch ( error ) {
      console.log( error )
    }
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
