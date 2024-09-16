import nodemailer from "nodemailer";
import env from "../../../env";

export async function getEmailClient() {
  const host = env.MAIL_SERVICE_HOST;
  const user = env.MAIL_SERVICE_USER;
  const pass = env.MAIL_SERVICE_PASS;
  const port = env.MAIL_SERVICE_PORT;

  const transporter = nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}