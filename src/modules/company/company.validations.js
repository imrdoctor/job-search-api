import joi from "joi";
import { genralRules } from "../../utils/utils.js";
export const addCompanySchema = {
  body: joi.object({
    companyName: genralRules.companyName.required().messages({
      "string.empty": "company Name cannot be empty.",
      "any.required": "company Name is required.",
    }),
    description: genralRules.description.required().messages({
      "string.empty": "description cannot be empty.",
      "any.required": "description is required.",
    }),
    industry: genralRules.industry.required().messages({
      "string.empty": "industry cannot be empty.",
      "any.required": "industry is required.",
    }),
    address: genralRules.address.required().messages({
      "string.empty": "address cannot be empty.",
      "any.required": "address is required.",
    }),
    numberOfEmployees: genralRules.numberOfEmployees.required().messages({
      "number.base": "Invalid number of employees",
      "number.min": "Number of employees must be greater than 0",
    }),
    companyEmail: genralRules.email.required().messages({
      "any.required": "Email is required.",
      "string.empty": "Email cannot be empty.",
    }),
  }),
  headers: joi
    .object({
      authorization: genralRules.authorization.required().messages({
        "any.required": "Authorization header is required.",
      }),
      authtype: genralRules.authType.required().messages({
        "any.required": "authType is required.",
      }),
      "content-type": joi.string().optional(),
      "user-agent": joi.string().optional(),
      accept: joi.string().optional(),
      "cache-control": joi.string().optional(),
      "postman-token": joi.string().optional(),
      host: joi.string().optional(),
      "accept-encoding": joi.string().optional(),
      connection: joi.string().optional(),
      "content-length": joi.string().optional(),
    })
    .unknown(false),
};

export const updateCompanySchema = {
  params: joi.object({
    companyId: genralRules.ObjectId.required().messages({
      "any.required": "companyId is required.",
      "string.empty": "companyId cannot be empty.",
    }),
  }),
  body: joi
    .object({
      companyName: genralRules.companyName.optional().messages({
        "string.empty": "company Name cannot be empty.",
      }),
      industry: genralRules.industry.optional().messages({
        "string.empty": "industry cannot be empty.",
      }),
      address: genralRules.address.optional().messages({
        "string.empty": "address cannot be empty.",
      }),
      description: genralRules.description.optional().messages({
        "string.empty": "description cannot be empty.",
      }),
      companyEmail: genralRules.email.optional().messages({
        "string.empty": "Email cannot be empty.",
      }),
      numberOfEmployees: genralRules.numberOfEmployees.optional().messages({
        "number.base": "Invalid number of employees",
        "number.min": "Number of employees must be greater than 0",
      }),
    })
    .min(1)
    .messages({
      "object.min":
        "You must provide at least one field: companyName, industry, address, description , companyEmail or numberOfEmployees .",
    }),
  headers: joi
    .object({
      authorization: genralRules.authorization.required().messages({
        "any.required": "Authorization header is required.",
      }),
      authtype: genralRules.authType.required().messages({
        "any.required": "authType is required.",
      }),
      "content-type": joi.string().optional(),
      "user-agent": joi.string().optional(),
      accept: joi.string().optional(),
      "cache-control": joi.string().optional(),
      "postman-token": joi.string().optional(),
      host: joi.string().optional(),
      "accept-encoding": joi.string().optional(),
      connection: joi.string().optional(),
      "content-length": joi.string().optional(),
    })
    .unknown(false),
};

export const deleteCompanySchema = {
  params: joi.object({
    companyId: genralRules.ObjectId.required().messages({
      "any.required": "companyId is required.",
      "string.empty": "companyId cannot be empty.",
    }),
  }),
  headers: joi
    .object({
      authorization: genralRules.authorization.required().messages({
        "any.required": "Authorization header is required.",
      }),
      authtype: genralRules.authType.required().messages({
        "any.required": "authType is required.",
      }),
      "content-type": joi.string().optional(),
      "user-agent": joi.string().optional(),
      accept: joi.string().optional(),
      "cache-control": joi.string().optional(),
      "postman-token": joi.string().optional(),
      host: joi.string().optional(),
      "accept-encoding": joi.string().optional(),
      connection: joi.string().optional(),
      "content-length": joi.string().optional(),
    })
    .unknown(false),
};
export const searchCompanySchema = {
  params: joi.object({
    companyName: joi.string().max(20).messages({
      "string.base": "companyName must be a string",
      "string.empty": "companyName cannot be empty",
      "string.max": "companyName must not exceed 20 characters",
    }),
  }),
  headers: joi
    .object({
      authorization: genralRules.authorization.required().messages({
        "any.required": "Authorization header is required.",
      }),
      authtype: genralRules.authType.required().messages({
        "any.required": "authType is required.",
      }),
      "content-type": joi.string().optional(),
      "user-agent": joi.string().optional(),
      accept: joi.string().optional(),
      "cache-control": joi.string().optional(),
      "postman-token": joi.string().optional(),
      host: joi.string().optional(),
      "accept-encoding": joi.string().optional(),
      connection: joi.string().optional(),
      "content-length": joi.string().optional(),
    })
    .unknown(false),
};
export const getCompanySchema = {
  params: joi.object({
    companyId: genralRules.ObjectId.required().messages({
      "any.required": "id is required.",
    }),
  }),
  headers: joi
    .object({
      authorization: genralRules.authorization.required().messages({
        "any.required": "Authorization header is required.",
      }),
      authtype: genralRules.authType.required().messages({
        "any.required": "authType is required.",
      }),
      "content-type": joi.string().optional(),
      "user-agent": joi.string().optional(),
      accept: joi.string().optional(),
      "cache-control": joi.string().optional(),
      "postman-token": joi.string().optional(),
      host: joi.string().optional(),
      "accept-encoding": joi.string().optional(),
      connection: joi.string().optional(),
      "content-length": joi.string().optional(),
    })
    .unknown(false),
};
export const updateCompanyImgs = {
  params: joi.object({
    companyId: genralRules.ObjectId.required().messages({
      "any.required": "companyId is required.",
      "string.empty": "companyId cannot be empty.",
    }),
  }),
  file: genralRules.file.required().messages({
    "any.required": "File is required.",
    "object.base": "Invalid file format.",
  }),
  headers: joi
    .object({
      authorization: genralRules.authorization.required().messages({
        "any.required": "Authorization header is required.",
      }),
      authtype: genralRules.authType.required().messages({
        "any.required": "authType is required.",
      }),
      "content-type": joi.string().optional(),
      "user-agent": joi.string().optional(),
      accept: joi.string().optional(),
      "cache-control": joi.string().optional(),
      "postman-token": joi.string().optional(),
      host: joi.string().optional(),
      "accept-encoding": joi.string().optional(),
      connection: joi.string().optional(),
      "content-length": joi.string().optional(),
    })
    .unknown(false),
};
export const paramsCompanyIdSchema = {
  params: joi.object({
    companyId: genralRules.ObjectId.required().messages({
      "any.required": "companyId is required.",
      "string.empty": "companyId cannot be empty.",
    }),
  }),
  headers: joi
    .object({
      authorization: genralRules.authorization.required().messages({
        "any.required": "Authorization header is required.",
      }),
      authtype: genralRules.authType.required().messages({
        "any.required": "authType is required.",
      }),
      "content-type": joi.string().optional(),
      "user-agent": joi.string().optional(),
      accept: joi.string().optional(),
      "cache-control": joi.string().optional(),
      "postman-token": joi.string().optional(),
      host: joi.string().optional(),
      "accept-encoding": joi.string().optional(),
      connection: joi.string().optional(),
      "content-length": joi.string().optional(),
    })
    .unknown(false),
};
export const addHrSchema = {
  params: joi.object({
    companyId: genralRules.ObjectId.required().messages({
      "any.required": "companyId is required.",
      "string.empty": "companyId cannot be empty.",
    }),
  }),
  body: joi.object({
    userID: genralRules.ObjectId.required().messages({
      "any.required": "companyId is required.",
      "string.empty": "companyId cannot be empty.",
    }),
  }),
  headers: joi
    .object({
      authorization: genralRules.authorization.required().messages({
        "any.required": "Authorization header is required.",
      }),
      authtype: genralRules.authType.required().messages({
        "any.required": "authType is required.",
      }),
      "content-type": joi.string().optional(),
      "user-agent": joi.string().optional(),
      accept: joi.string().optional(),
      "cache-control": joi.string().optional(),
      "postman-token": joi.string().optional(),
      host: joi.string().optional(),
      "accept-encoding": joi.string().optional(),
      connection: joi.string().optional(),
      "content-length": joi.string().optional(),
    })
    .unknown(false),
};
