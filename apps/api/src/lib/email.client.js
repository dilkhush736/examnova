import nodemailer from "nodemailer";
import { env } from "../config/index.js";

let transport;

function getTransport() {
  if (transport) {
    return transport;
  }

  if (env.smtpJsonTransport) {
    transport = nodemailer.createTransport({
      jsonTransport: true,
    });
    return transport;
  }

  transport = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: env.smtpUser && env.smtpPass ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
  });

  return transport;
}

export function createEmailClient() {
  return {
    async send(message) {
      const transporter = getTransport();
      return transporter.sendMail({
        from: `${env.smtpFromName} <${env.smtpFromEmail}>`,
        ...message,
      });
    },
  };
}
