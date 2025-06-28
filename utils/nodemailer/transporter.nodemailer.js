import nodemailer from "nodemailer";
import generateVerificationEmail from "./VerificationMailTemplate.js";


import dotenv from 'dotenv';
dotenv.config();

const sendVerificationMail = async ({ to, token, username }) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.FROM_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const verificationLink = `${process.env.BASE_URL}/api/v1/user/verify?token=${token}`;

  const html = generateVerificationEmail({
    username,
    verificationLink,
  });

  const info = await transport.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: "Verification Mail",
    html,
  });

  console.log("Email sent:", info.response);
};

export default sendVerificationMail;
