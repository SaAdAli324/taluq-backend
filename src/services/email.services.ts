import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // false for 587, true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailServices = {
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await transporter.sendMail({
        from: `"Taluq Support" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
      });
      console.log("Email sent successfully: %s", info.messageId);
    } catch (error) {
      console.error("Error sending email via nodemailer:", error);
      throw error;
    }
  },

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #10b981; text-align: center;">Welcome to Taluq!</h2>
        <p>Hi there,</p>
        <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p>This verification link will expire in 24 hours.</p>
        <p style="font-size: 0.875rem; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          If you did not create an account, please ignore this email.
        </p>
      </div>
    `;
    await this.sendEmail(to, "Verify your Taluq Account", htmlContent);
  },

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #10b981; text-align: center;">Reset your Password</h2>
        <p>Hi there,</p>
        <p>We received a request to reset the password for your Taluq account. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>This link is valid for 1 hour. If it expires, you will need to submit a new request.</p>
        <p style="font-size: 0.875rem; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          If you did not request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `;
    await this.sendEmail(to, "Reset your Taluq Password", htmlContent);
  }
};
