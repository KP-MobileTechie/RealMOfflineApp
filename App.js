import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import openRealm from './realmConfig';
import { ObjectId } from 'bson';  // Import to generate ObjectId
import NetInfo from "@react-native-community/netinfo";

const App = () => {
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState(null);
  const [realm, setRealm] = useState(null);
  const [userId, setUserId] = useState(null);  // Store the user ID for updates
  const [isOnline, setIsOnline] = useState(true);

  // Load data from Realm and sync when app starts
  useEffect(() => {
    const loadData = async () => {
      try {
        const realmInstance = await openRealm();
        console.log("🚀 ~ loadData ~ realmInstance:", realmInstance);
        setRealm(realmInstance);
        const userList = realmInstance.objects('UserList');
        console.log("🚀 ~ loadData ~ userList:", userList);

        // Check if there's already a saved name
        if (userList.length > 0) {
          const user = userList[0];
          setSavedName(user.name);  // Display saved name
          setUserId(user._id);  // Save the existing user's ID for future updates
        }
      } catch (error) {
        console.error('Error opening realm:', error);
      }
    };

    loadData();

    // Monitor network connection status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    return () => {
      unsubscribe(); // Unsubscribe from network connection status
      if (realm) {
        realm.close();
      }
    };
  }, []);

  const saveName = () => {
    if (!isOnline) {
      Alert.alert('Offline Mode', 'You are currently offline. Data will be saved locally and synced when online.');
    }

    if (realm) {
      try {
        realm.write(() => {
          if (userId) {
            // If a user ID exists, update the existing record
            const existingUser = realm.objectForPrimaryKey('UserList', userId);
            if (existingUser) {
              existingUser.name = name;  // Update the user's name
            }
          } else {
            // If no user ID, create a new record
            const newUser = realm.create('UserList', { _id: new ObjectId(), name }, 'modified');
            setUserId(newUser._id);  // Store the new user's ID for future updates
          }
        });
        Alert.alert('Success', 'Name saved to Realm');
        setSavedName(name);
      } catch (error) {
        Alert.alert('Error', 'Failed to save name');
        console.error('Error saving to realm:', error);
      }
    } else {
      Alert.alert('Error', 'Realm not initialized');
    }
  };

  return (
    <View style={{ padding: 20, justifyContent: 'center', flex: 1 }}>
      {savedName && <Text>Saved Name: {savedName}</Text>}
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={{
          borderColor: 'gray',
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
        }}
      />
      <Button title="Save Name" onPress={saveName} />
    </View>
  );
};

export default App;
