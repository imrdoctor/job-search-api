import { connectionDB } from "../DB/connectionDB.js"
import  cors from 'cors'
import { globalErrorHandler } from "./utils.js"
import userController from "../modules/user/user.controller.js"
import { deleteExpiredOTPs } from "../modules/cronJobs/cronJobs.js"
import { graphSchema } from "../modules/graph.scema.js"
import { createHandler } from "graphql-http/lib/use/express"
import expressPlayground from 'graphql-playground-middleware-express'
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql"
import companyController from "../modules/company/company.controller.js"
import jobController from "../modules/job/job.controller.js"
import {rateLimit} from 'express-rate-limit'
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 20, 
    message: { error: 'Too many requests, please try again later.' },
    headers: true, 
    handler:(req,res,next) => {
        return next(new Error("Too many requests, please try again later.",{cause:{status:429}}))
    }
})
const approotes = async (app,express)=>{
    app.use(cors())
    app.use(limiter)
    app.use(express.json())
    connectionDB()
    app.get('/', (req, res) => {
        return res.status(200).json({msg:"Welcome in Job Serach Api"})
     })
     app.use("/user", userController);
     app.use("/company", companyController);
     app.use("/job", jobController);
     app.use('/graphql', createHandler({ schema : graphSchema }));
     app.use("*", (req, res, next) => {
        return next(new Error(`invalid url ${req.originalUrl}`, { cause: { status: 404} }))
    })
    app.use(globalErrorHandler);
}
export default approotes