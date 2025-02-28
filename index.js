import {config} from 'dotenv'
config()
import chalk from 'chalk';
import express  from "express"
import approotes from './src/utils/app.controller.js'
const app = express()
const port = process.env.PORT
approotes(app,express)
const BASE_URL = process.env.MODE == "DEV" ? process.env.Dev_baseUrl : process.env.Prod_baseUrl
const httpServer = app.listen(port,()=> console.log(chalk.cyan(`URL : http://localhost:${port}` , `\nBase URL : ${BASE_URL}`)));
// runIo(httpServer) // socket io connection