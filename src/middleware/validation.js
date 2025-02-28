export const validation = (schema) => {
    return (req, res, next) => {
        const validationResult = []
        for (const key of Object.keys(schema)) {
            const validation = schema[key].validate(req[key],{ abortEarly: false });
            if (validation.error) {
                validationResult.push(validation.error.details)
            }
        }
        if (validationResult.length > 0) {
            const errorDetails = validationResult.flat().map(err=>({
                message: err.message,
                path: err.path,
                type: err.type
            }));
            return next(new Error("Invalid data", { cause: { status: 400, errors: errorDetails } }));
        }else(
            next()
        )
    }
}

export const validationGraphQl = async ({schema , data} = {}) =>{
    const {error } = schema.validate(data,{abortErly:false})
    if(error){
        throw new Error(error.details.map(err => err.message).join(', '))
    }
}