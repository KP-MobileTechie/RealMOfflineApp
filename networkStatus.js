import NetInfo from "@react-native-community/netinfo";

// Handle network change (online/offline)
const handleNetworkChange = (setIsOnline) => {
    const unsubscribe = NetInfo.addEventListener(state => {
        setIsOnline(state.isConnected);
    });

    return unsubscribe;
};

export { handleNetworkChange };
