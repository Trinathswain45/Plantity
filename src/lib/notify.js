import nodemailer from "nodemailer";
import twilio from "twilio";

function hasEmailConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function hasSmsConfig() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
}

function getTwilioClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export async function sendOtp({ email, phone, code }) {
  if (email && hasEmailConfig()) {
    const transporter = getTransporter();
    try {
      if (process.env.NODE_ENV !== "production") {
        await transporter.verify();
      }
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "no-reply@plantity.com",
        to: email,
        subject: "Your Plantity sign-in code",
        text: `Your one-time sign-in code is ${code}. It expires in 5 minutes.`,
      });
    } catch (error) {
      console.error("SMTP sendOtp failed", {
        message: error?.message,
        code: error?.code,
        response: error?.response,
      });
      throw error;
    }
    return { channel: "email" };
  }

  if (phone && hasSmsConfig()) {
    const client = getTwilioClient();
    await client.messages.create({
      to: phone,
      from: process.env.TWILIO_FROM,
      body: `Your Plantity sign-in code is ${code}. It expires in 5 minutes.`,
    });
    return { channel: "sms" };
  }

  console.log("DEV OTP", { email, phone, code });
  return { channel: "log" };
}

export async function sendOrderUpdate({ email, phone, subject, message }) {
  if (email && hasEmailConfig()) {
    const transporter = getTransporter();
    try {
      if (process.env.NODE_ENV !== "production") {
        await transporter.verify();
      }
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "no-reply@plantity.com",
        to: email,
        subject,
        text: message,
      });
    } catch (error) {
      console.error("SMTP sendOrderUpdate failed", {
        message: error?.message,
        code: error?.code,
        response: error?.response,
      });
      throw error;
    }
    return { channel: "email" };
  }

  if (phone && hasSmsConfig()) {
    const client = getTwilioClient();
    await client.messages.create({
      to: phone,
      from: process.env.TWILIO_FROM,
      body: message,
    });
    return { channel: "sms" };
  }

  console.log("DEV ORDER UPDATE", { email, phone, subject, message });
  return { channel: "log" };
}
