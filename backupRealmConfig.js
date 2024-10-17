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

    const realm = await Realm.open({
        schema: [UserListSchema],
        sync: {
            user,
            flexible: true, // Enable Flexible Sync
            initialSubscriptions: {
                update: (subs, realm) => {
                    // Subscribe to all objects in the 'UserList' collection
                    subs.add(realm.objects("UserList"));
                },
            },
            error: (err) => {
                console.log('Sync error:', err); // Log any sync errors
            },
            downloadBeforeOpen: true, // Ensure data is downloaded before open
        },
    });

    return realm;
}

export default openRealm;
