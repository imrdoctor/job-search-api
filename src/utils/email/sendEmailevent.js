import dotenv from 'dotenv';
dotenv.config();
import { EventEmitter } from 'events'
import jwt from "jsonwebtoken";
import { encryption } from '../crypt/encrypt.js';
import { customAlphabet, nanoid } from 'nanoid';
import { generatedCryptToken, hashing } from '../utils.js';
import * as EmailTemplates from './templates.js';
import { sendEmail } from '../../service/sendEmail.js';
import userModel, { otpTyps } from '../../DB/models/user/user.model.js';
import * as DBS from '../../DB/dbService.js';
export const eventEmitter = new EventEmitter()

// const generateOtpWithLetter = () => {
//     const numbers = customAlphabet("123456789", 6); 
//     const letters = customAlphabet("ABRKHQXMWB", 1);
//     const otp = `${numbers()}${letters()}`; 
//     return otp;
// };








// Confirmation Email
eventEmitter.on("sendActiveEmailOTP", async (data) => {
  const otp = customAlphabet("123456789", 6)();
  const saltRounds = parseInt(process.env.BYCRYPTSOLT_ROUNDS, 10);
  const hashingOtp = await hashing({ value: otp, saltRounds });
  const expiresIn = new Date(Date.now() + 600000);
  await DBS.findByIdAndUpdate({
    model: userModel,
    id: data.id,
    update: {
      $push: {
        OTPs: {
          code: hashingOtp,
          type: otpTyps.verfyEmailOtp,
          expiresIn
        }
      }
    }
  })
  const title = "Verify Your Email"
  const descreption = "To complete your registration, enter the following OTP code"
  let Template = EmailTemplates.EmailotpTmeplate(otp, title, descreption)
  const emailSender = await sendEmail(data.email, "Active Your Email", "Confirm Your Email", Template);
})
eventEmitter.on("sendActiveEmailLINK", async (data) => {
  const BASE_URL = process.env.MODE == "DEV" ? process.env.Dev_baseUrl : process.env.Prod_baseUrl
  const otp = customAlphabet("123456789", 6)();
  const saltRounds = parseInt(process.env.BYCRYPTSOLT_ROUNDS, 10);
  const hashingOtp = await hashing({ value: otp, saltRounds });
  const expiresIn = new Date(Date.now() + 600000);
  await DBS.findByIdAndUpdate({
    model: userModel,
    id: data.id,
    update: {
      $push: {
        OTPs: {
          code: hashingOtp,
          type: otpTyps.verfyEmailLink,
          expiresIn
        }
      }
    }
  })
  const payload = {
    email: data.email,
    id: data.id,
    otp: otp,
  }
  const signKey = process.env.SIGNATURE_TOKEN_ACTIVE
  const token = await generatedCryptToken({ payload, signKey, expiresIn: process.env.TOKEN_ACTIVE_EXPIRE })
  const tokenURL = encodeURIComponent(token);
  const linkAuth = `http://${BASE_URL}/user/actve/${tokenURL}`
  let Template = EmailTemplates.EmailUrlAuth(linkAuth)
  const emailSender = await sendEmail(data.email, "Active Your Email", "Confirm Your Email", Template);
  console.log(`confrimation to sent ${data.email}`, emailSender);
})
eventEmitter.on("forgetpasswordOTP", async (data) => {
  const otp = customAlphabet("123456789", 6)();
  const saltRounds = parseInt(process.env.BYCRYPTSOLT_ROUNDS, 10);
  const hashingOtp = await hashing({ value: otp, saltRounds });
  const expiresIn = new Date(Date.now() + 600000);
  await DBS.findByIdAndUpdate({
    model: userModel,
    id: data.id,
    update: {
      $push: {
        OTPs: {
          code: hashingOtp,
          type: otpTyps.forgetPasswordOtp,
          expiresIn
        }
      }
    }
  })
  const title = "Reset Your Password"
  const descreption = "To reset your password enter the following OTP code"
  let Template = EmailTemplates.EmailotpTmeplate(otp, title, descreption)
  const emailSender = await sendEmail(data.email, "Reset Your Password", "Confirm Reset Your Password", Template);
})


eventEmitter.on("acceptedEmail", async (data) => {
  const { email, firstName, logo, jobTitle } = data
  let Template = EmailTemplates.applicationAccepted(firstName, logo, jobTitle)
  const emailSender = await sendEmail(email, "Your Application is Approved 🎉", "Congratulations! Your application for the position of " + jobTitle + " has been approved.", Template);
})

eventEmitter.on("rejectedEmail", async (data) => {
  const { email, firstName, logo, jobTitle } = data
  const title = "Reset Your Password"
  const descreption = "To reset your password enter the following OTP code"
  let Template = EmailTemplates.applicationRejected(firstName, logo, jobTitle)
  const emailSender = await sendEmail( email,  "Application Update",  "Thank you for applying for the " + jobTitle + " position. Unfortunately, we moved forward with other candidates.", Template);
})