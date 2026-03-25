import crypto from "node:crypto";

export function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

export function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
