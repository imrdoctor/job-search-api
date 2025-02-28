import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
export const userType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        gender: { type: GraphQLString },
        birthdate: { type: GraphQLString },
        role: { type: GraphQLString },
        isConfirmed: { type: GraphQLBoolean },
        provider: { type: GraphQLString },
        profilePic: {
            type: new GraphQLObjectType({
                name: 'ProfilePic',
                fields: () => ({
                    secure_url: { type: GraphQLString }
                })
            })
        },
        coverPic: {
            type: new GraphQLObjectType({
                name: 'coverPic',
                fields: () => ({
                    secure_url: { type: GraphQLString }
                })
            })
        },
        deletedAt: { type: GraphQLString },
    }),
})
export const littelUserType = new GraphQLObjectType({
    name: "UserPublic",
    fields: () => ({
        _id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
    }),
});


export const bannedUserResponseType = new GraphQLObjectType({
    name: "BannedUserResponse",
    fields: () => ({
        message: { type: GraphQLString },
        user: { type: littelUserType },
    }),
});


export const companyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        _id: { type: GraphQLID },
        companyName: { type: GraphQLString },
        description: { type: GraphQLString },
        industry: { type: GraphQLString },
        address: { type: GraphQLString },
        numberOfEmployees: { type: GraphQLString }, // بما أنه نطاق (مثل 11-20) يفضل نص
        companyEmail: { type: GraphQLString },
        createdBy: { type: GraphQLID }, // معرف المستخدم الذي أنشأ الشركة
        logo: {
            type: new GraphQLObjectType({
                name: 'CompanyLogo',
                fields: () => ({
                    secure_url: { type: GraphQLString },
                    public_id: { type: GraphQLString }
                })
            })
        },
        coverPic: {
            type: new GraphQLObjectType({
                name: 'CompanyCoverPic',
                fields: () => ({
                    secure_url: { type: GraphQLString },
                    public_id: { type: GraphQLString }
                })
            })
        },
        HRs: { type: new GraphQLList(GraphQLID) }, // قائمة بمعرفات مدراء الموارد البشرية
        bannedAt: { type: GraphQLString }, // تاريخ الحظر (إن وجد)
        deletedAt: { type: GraphQLString }, // تاريخ الحذف (إن وجد)
        legalAttachment: {
            type: new GraphQLObjectType({
                name: 'LegalAttachment',
                fields: () => ({
                    secure_url: { type: GraphQLString },
                    public_id: { type: GraphQLString }
                })
            })
        },
        approvedByAdmin: { type: GraphQLBoolean }, // هل تمت الموافقة عليها من قبل الأدمن
    }),
});


export const getUsersAndCompaniesType = new GraphQLObjectType({
    name: 'UsersAndCompanies',
    fields: () => ({
        users: { type: new GraphQLList(userType) },
        companies: { type: new GraphQLList(companyType) }
    })
});

export const CompanyResponseType = new GraphQLObjectType({
    name: "BannedCompanyResponse",
    fields: () => ({
        message: { type: GraphQLString },
        company: { type: companyType },
    }),
});