import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql';
import * as AR from './reslove.js';
import * as AT from './type.js';
export const adminMutation = {
    userBaned: {
        type: AT.bannedUserResponseType,
        args: {
            authorization: { type: new GraphQLNonNull(GraphQLString) },
            authType: { type: new GraphQLNonNull(GraphQLString) },
            id: { type: new GraphQLNonNull(GraphQLID) }, 
        },        
        resolve: AR.bannedUser
    },
    companyBaned: {
        type: AT.CompanyResponseType,
        args: {
            authorization: { type: new GraphQLNonNull(GraphQLString) },
            authType: { type: new GraphQLNonNull(GraphQLString) },
            id: { type: new GraphQLNonNull(GraphQLID) }, 
        },        
        resolve: AR.bannedCompany
    },
    companyApprove: {
        type: AT.CompanyResponseType,
        args: {
            authorization: { type: new GraphQLNonNull(GraphQLString) },
            authType: { type: new GraphQLNonNull(GraphQLString) },
            id: { type: new GraphQLNonNull(GraphQLID) }, 
        },        
        resolve: AR.AproveCompany
    },
}   
export const adminQuery  = {
    getAllInfo: {
        type: new GraphQLList(AT.getUsersAndCompaniesType),
        args: {
            authorization: { type: new GraphQLNonNull(GraphQLString) },
            authType: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: AR.getUsersAndCompanies
    },
}

// Query - GET
// Mutation  - POST