import crypto from "crypto";

const otpSecret = process.env.OTP_SECRET || "plantity-dev-secret";

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOtp(code) {
  return crypto.createHmac("sha256", otpSecret).update(code).digest("hex");
}
