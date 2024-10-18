import Realm from 'realm';
import { ObjectId } from 'bson';

// Define the UserList schema for storing user names
const UserListSchema = {
    name: 'UserList',
    properties: {
        _id: 'objectId',  // MongoDB's ObjectId type for unique identification
        name: 'string',  // The name property we are saving
    },
    primaryKey: '_id',
};

const app = new Realm.App({ id: "application-0-brmbmgq" }); // Replace with your MongoDB Realm App ID

const openRealm = async (isOnline) => {
    let config = {
        schema: [UserListSchema],
    };

    if (isOnline) {
        // Sync config for online mode
        const user = await app.logIn(Realm.Credentials.anonymous());
        config = {
            ...config,
            sync: {
                user: user,
                flexible: true,
                initialSubscriptions: {
                    update: (subs, realm) => {
                        subs.add(realm.objects("UserList"));
                    },
                },
                downloadBeforeOpen: true,
            },
        };
    } else {
        // Offline mode config
        config = {
            ...config,
            path: 'local.realm',  // Use a local file for offline mode
        };
    }

    try {
        return await Realm.open(config);
    } catch (error) {
        console.error('Error opening realm:', error);
        throw error;
    }
};

export { openRealm };