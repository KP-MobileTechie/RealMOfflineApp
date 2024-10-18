import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { openRealm } from './realmConfig'; // Realm configuration
import { saveNameToSecureStorage, loadNameFromSecureStorage } from './secureStorage'; // Keychain functions
import { handleNetworkChange } from './networkStatus'; // Network monitoring
import NetInfo from "@react-native-community/netinfo";
import { ObjectId } from 'bson';

const App = () => {
  const [name, setName] = useState('');  // Current input name
  const [savedName, setSavedName] = useState(null); // Saved name from Realm
  const [realm, setRealm] = useState(null); // Realm instance
  const [isOnline, setIsOnline] = useState(true); // Track if app is online

  // Initialize Realm and load data when component mounts
  useEffect(() => {
    let isComponentMounted = true;

    const loadData = async () => {
      const netInfo = await NetInfo.fetch();
      const isConnected = netInfo.isConnected;
      setIsOnline(isConnected);

      // Open the Realm database (online/offline)
      const realmInstance = await openRealm(isConnected);
      if (isComponentMounted) {
        setRealm(realmInstance);
        const userList = realmInstance.objects('UserList');
        console.log("🚀 ~ loadData ~ userList:", userList);
        if (userList.length > 0) {
          const user = userList[0];
          setSavedName(user.name);
        }
      }
    };

    loadData();

    // Listen for network changes
    const unsubscribe = handleNetworkChange(setIsOnline);

    return () => {
      unsubscribe();
      if (realm && !realm.isClosed) {
        realm.close();
      }
      isComponentMounted = false;
    };
  }, []);

  // Save the name to both Realm and Secure Storage (Keychain)
  const saveName = async () => {
    if (!realm || realm.isClosed) {
      Alert.alert('Error', 'Realm is not initialized or has been closed');
      return;
    }

    try {
      // Save the name to Keychain (for persistence across app installs)
      await saveNameToSecureStorage(name);

      // Write data to the Realm database (offline)
      realm.write(() => {
        const existingUser = realm.objects('UserList')[0];  // Fetch the first (and only) user
        if (existingUser) {
          existingUser.name = name;  // Replace the name
        } else {
          realm.create('UserList', { _id: new ObjectId(), name });  // Create a new user if not exists
        }
      });

      Alert.alert('Success', 'Name saved successfully');
      setSavedName(name);
    } catch (error) {
      console.error('Error saving name:', error);
      Alert.alert('Error', 'Failed to save the name');
    }
  };

  // Sync the offline data with the online data when the app comes online
  useEffect(() => {
    const syncDataWhenOnline = async () => {
      if (isOnline && realm) {
        try {
          // Fetch offline data (e.g., from local Realm)
          const offlineData = realm.objects('UserList');

          // If offline data exists, sync it with the cloud or remote backend
          if (offlineData.length > 0) {
            const offlineName = offlineData[0].name;

            // Sync to the cloud (MongoDB Realm, Firebase, etc.)
            await syncNameWithCloud(offlineName);

            // After successful sync, update the Realm with any new online data
            // For example, you can replace the name with the one synced from the cloud
            realm.write(() => {
              const existingUser = realm.objects('UserList')[0];
              if (existingUser) {
                existingUser.name = offlineName; // Update with the cloud value
              }
            });

            // Alert.alert('Sync Successful', 'Offline data has been synced successfully.');
          }
        } catch (error) {
          console.error('Error syncing data:', error);
          Alert.alert('Sync Error', 'Failed to sync offline data.');
        }
      }
    };

    syncDataWhenOnline();
  }, [isOnline, realm]);

  // Load name from Keychain when the app is reopened
  useEffect(() => {
    const fetchSavedName = async () => {
      const savedName = await loadNameFromSecureStorage();
      if (savedName) {
        setSavedName(savedName); // Display saved name
      }
    };
    fetchSavedName();
  }, []);

  return (
    <View style={{ padding: 20, justifyContent: 'center', flex: 1 }}>
      {savedName && <Text>Saved Name: {savedName}</Text>}
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={{ borderColor: 'gray', borderWidth: 1, padding: 10, marginVertical: 10 }}
      />
      <Button title="Save Name" onPress={saveName} />
    </View>
  );
};

// Placeholder for cloud sync function
const syncNameWithCloud = async (name) => {
  // Replace with actual logic to sync with cloud database
  console.log('Syncing name with cloud:', name);
  // Example: await cloudDatabase.syncUserName(name);
};

export default App;