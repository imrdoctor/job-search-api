import { generateSecret } from "../utils/utils.js";

export const create = async ({ model, query = {} } = {}) => {
    return await model.create(query);
}
export const findById = async ({ model, id, populate = [], select = null } = {}) => {
    return await model.findById(id).select(select).populate(populate);
}
export const findOne = async ({ model, filter = {}, populate = [], strictPopulate = false, skip = 0, limit = 0 } = {}) => {
    let query = model.findOne(filter);
    if (Array.isArray(populate) && populate.length > 0) {
        query = query.populate(populate.map(path => ({ path, strictPopulate })));
    } else if (typeof populate === "string") {
        query = query.populate({ path: populate, strictPopulate });
    }
    return await query.skip(skip).limit(limit).lean();
};

export const findOneAndUpdate = async ({ model, filter = {}, update = {} } = {}) => {
    return await model.findOneAndUpdate(filter, update, { new: true });
}
export const find = async ({ model, filter = {}, populate = [], skip = 0, limit = 0, sort = {} } = {}) => {
    return await model.find(filter).populate(populate).skip(skip).limit(limit).sort(sort).lean();
};

export const findByIdAndUpdate = async ({ model, id, update = {}, populate = [], select = null } = {}) => {
    return await model.findByIdAndUpdate(id, update, { new: true }).select(select).populate(populate);
};
export const findByIdAndDelete = async ({ model, id } = {}) => {
    return await model.findByIdAndDelete(id).lean();
}
export const deleteMany = async ({ model, filter } = {}) => {
    return await model.deleteMany(filter);
};
export const updateOne = async ({ model, filter = {}, update = {} }) => {
    return await model.updateOne(filter, update);
}
export const updateMany = async ({ model, filter = {}, update = {} }) => {
    return await model.updateMany(filter, update).lean();
}
export const deleteOne = async ({ model, filter = {} } = {}) => {
    return await model.deleteOne(filter).lean();
};
export const getUserSecret = async ({ model, user }) => {
    const tokenSecret = await generateSecret();
    await updateOne(
        {
            model,
            filter: { _id: user._id },
            update: { tokenSecret }
        }
    );
    return tokenSecret;
};
export const getUserResetSecret = async ({ model, user }) => {
    const resetTokenSecret = await generateSecret();
    await updateOne(
        {
            model,
            filter: { _id: user._id },
            update: { resetTokenSecret }
        }
    );
    return resetTokenSecret;
};