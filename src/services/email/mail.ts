import nodemailer from "nodemailer";

export async function getEmailClient() {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVICE_HOST,
    port: 587,
    auth: {
      user: process.env.MAIL_SERVICE_USER,
      pass: process.env.MAIL_SERVICE_PASS,
    },
  });

  return transporter;
}
