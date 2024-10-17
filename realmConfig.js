import Realm from 'realm';

// Define the UserList schema with _id as the primary key
const UserListSchema = {
    name: 'UserList',
    properties: {
        _id: 'objectId',  // MongoDB's ObjectId type for unique identification
        name: 'string',
    },
    primaryKey: '_id',
};

const app = new Realm.App({ id: "application-0-brmbmgq" }); // Replace with your MongoDB Realm App ID

async function openRealm() {
    const user = await app.logIn(Realm.Credentials.anonymous()); // Anonymous login

    const config = {
        schema: [UserListSchema],
        sync: {
            user: user,
            flexible: true, // Enable flexible sync
            initialSubscriptions: {
                update: (subs, realm) => {
                    subs.add(realm.objects("UserList"));
                },
            },
            error: (err) => {
                console.log('Sync error:', err); // Log any sync errors
            },
            downloadBeforeOpen: true, // Ensure data is downloaded before opening
        },
    };

    try {
        // Open the Realm with sync enabled
        return await Realm.open(config);
    } catch (error) {
        console.error('Error opening realm with sync:', error);
        throw error;
    }
}

export default openRealm;