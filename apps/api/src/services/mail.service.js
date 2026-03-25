import { createEmailClient } from "../lib/email.client.js";

const emailClient = createEmailClient();

export const mailService = {
  async sendOtpVerificationEmail({ email, name, otp, purpose }) {
    const subject =
      purpose === "password_reset"
        ? "ExamNova AI password reset verification code"
        : "Verify your ExamNova AI email";

    const actionText =
      purpose === "password_reset"
        ? "Use this OTP to reset your password"
        : "Use this OTP to verify your email address";

    return emailClient.send({
      to: email,
      subject,
      text: `${actionText}: ${otp}. This code will expire soon.`,
      html: `
        <div style="font-family:Segoe UI,sans-serif;line-height:1.6;color:#10212b">
          <h2>ExamNova AI</h2>
          <p>Hello ${name || "there"},</p>
          <p>${actionText}.</p>
          <p style="font-size:24px;font-weight:700;letter-spacing:4px">${otp}</p>
          <p>This code is time-limited for your security.</p>
        </div>
      `,
    });
  },
};
