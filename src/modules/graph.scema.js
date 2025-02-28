import {graphql,GraphQLSchema,GraphQLObjectType,GraphQLString} from 'graphql';
import { adminMutation, adminQuery } from './admin_dashboard/fields.js';
//   import {userMutation} from './user/graphql/fields.js';
// import { bookMutation, bookQuery  } from './book/graphql/fields.js';
export const graphSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
            ...adminQuery
        },
    }),
    mutation: new GraphQLObjectType({
        name: 'RootMutationType',
        fields: {
            ...adminMutation
        },
    }),
})