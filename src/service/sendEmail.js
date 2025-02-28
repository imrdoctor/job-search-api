import dotenv from 'dotenv';
dotenv.config();
import nodemailer from "nodemailer"

export const sendEmail = async (to, title , subject, html,  attachments) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, 
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    const info = await transporter.sendMail({
        from: `${title} ${process.env.AUTH_EMAIL}`,
        to: to ? to : null,
        subject: subject,
        html: html ? html : null,
        attachments: attachments ? attachments : [],
    });
    if (info.accepted && info.accepted.length > 0) {
        return true;
    }else {
        return false;
    }    
    
}