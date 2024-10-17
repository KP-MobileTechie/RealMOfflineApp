import Realm from 'realm';
import { ObjectId } from 'bson';

// Define the UserList schema
export const UserListSchema = {
    name: 'UserList',
    properties: {
        _id: 'objectId',    // ObjectId for MongoDB compatibility
        name: 'string',     // Field for storing the name
    },
    primaryKey: '_id',
};
