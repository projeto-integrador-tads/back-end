import nodemailer from "nodemailer";

export async function getEmailClient() {
  const host = process.env.MAIL_SERVICE_HOST;
  const user = process.env.MAIL_SERVICE_USER;
  const pass = process.env.MAIL_SERIVCE_PASS;

  const transporter = nodemailer.createTransport({
    host,
    port: 2525,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}
