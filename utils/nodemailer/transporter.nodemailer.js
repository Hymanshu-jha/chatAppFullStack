import nodemailer from "nodemailer";
import generateVerificationEmail from "./VerificationMailTemplate.js";

const sendVerificationMail = async ({ to , token , username }) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.FROM_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD, // use env for password too
    },
  });

  const html = generateVerificationEmail({
    username,
    verificationLink: `https://chatappfullstack-1.onrender.com/user/verify?token=${token}`,
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
