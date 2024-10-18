import * as Keychain from 'react-native-keychain';

// Save name securely to Keychain
const saveNameToSecureStorage = async (name) => {
    try {
        await Keychain.setGenericPassword('user_name', name);
        console.log('Name saved securely to Keychain');
    } catch (error) {
        console.error('Error saving name to Keychain:', error);
    }
};

// Load name securely from Keychain
const loadNameFromSecureStorage = async () => {
    try {
        const credentials = await Keychain.getGenericPassword();
        return credentials ? credentials.password : null;  // If no name, return null
    } catch (error) {
        console.error('Error loading name from Keychain:', error);
        return null;
    }
};

export { saveNameToSecureStorage, loadNameFromSecureStorage };
