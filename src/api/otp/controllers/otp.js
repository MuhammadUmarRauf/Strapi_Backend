import axios from "axios";

export default {
  async sendOtp(ctx) {
    console.log("=== sendOtp called at", new Date().toISOString(), "===");

    const { email } = ctx.request.body;

    if (!email) {
      console.log("Validation failed: No email provided");
      return ctx.badRequest("Email is required.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Validation failed: Invalid email format:", { email });
      return ctx.badRequest("Invalid email format.");
    }

    console.log("Checking user for email:", email.toLowerCase());
    const users = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        filters: { email: { $eq: email.toLowerCase() } },
      }
    );

    if (!users || users.length === 0) {
      console.log("User not found for email:", email);
      return ctx.badRequest("The provided email is not registered.");
    }

    const user = users[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    console.log("Generated OTP for", user.email, "OTP:", otp);

    try {
      await strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data: { resetOtp: otp, resetOtpExpiry: otpExpiry },
        }
      );
      console.log("OTP updated successfully for user:", user.email);
    } catch (err) {
      console.error("Error updating OTP:", err.message);
      return ctx.internalServerError("Failed to process OTP.");
    }

    try {
      await axios.post(
        "https://api.sendgrid.com/v3/mail/send",
        {
          personalizations: [{ to: [{ email: user.email }] }],
          from: { email: process.env.EMAIL_ADDRESS },
          subject: "Your OTP for Password Reset",
          content: [
            {
              type: "text/plain",
              value: `Your OTP is: ${otp}\nExpires in 15 minutes. Please use it to reset your password.`,
            },
            {
              type: "text/html",
              value: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>OTP for Password Reset</title><style>body{font-family:Arial,sans-serif;background-color:#f4f4f4;margin:0;padding:0}.container{width:100%;max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 5px rgba(0,0,0,0.1)}.header{background-color:#484A9F;color:#ffffff;text-align:center;padding:20px}.header h1{margin:0;font-size:24px}.content{padding:20px;text-align:center}.otp{font-size:32px;font-weight:bold;color:#484A9F;letter-spacing:2px;margin:20px 0}.expiry{font-size:16px;color:#666;margin-bottom:20px}.footer{background-color:#f4f4f4;text-align:center;padding:10px;font-size:12px;color:#666}</style></head><body><div class="container"><div class="header"><h1>Password Reset</h1></div><div class="content"><p>Hello ${user.username || "User"},</p><p>Your One-Time Password (OTP) for resetting your password is:</p><div class="otp">${otp}</div><p class="expiry">This OTP expires in 15 minutes. Please use it promptly.</p><p>If you didn’t request this, please ignore this email or contact support.</p></div><div class="footer"><p>© 2025 Umar. All rights reserved.</p></div></div></body></html>`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("OTP email sent to:", user.email);
      return ctx.send({ ok: true });
    } catch (err) {
      console.error("SendGrid error:", err.message);
      if (err.response?.data?.errors) {
        console.error("SendGrid details:", err.response.data.errors);
      }
      return ctx.internalServerError("Failed to send OTP email.");
    }
  },

  async verifyOtp(ctx) {
    console.log("=== verifyOtp called at", new Date().toISOString(), "===");

    const { email, otp } = ctx.request.body;

    if (!email || !otp) {
      console.log("Validation failed: Email or OTP missing");
      return ctx.badRequest("Email and OTP are required.");
    }

    console.log("Verifying OTP for email:", email.toLowerCase());
    const users = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        filters: { email: { $eq: email.toLowerCase() } },
      }
    );

    if (!users || users.length === 0) {
      console.log("User not found for email:", email);
      return ctx.badRequest("The provided email is not registered.");
    }

    const user = users[0];
    const storedOtp = user.resetOtp;
    const expiry = new Date(user.resetOtpExpiry);

    if (!storedOtp || !expiry) {
      console.log("No OTP stored or expired for user:", email);
      return ctx.badRequest("No valid OTP found. Please request a new one.");
    }

    if (new Date() > expiry) {
      console.log("OTP expired for user:", email);
      return ctx.badRequest("OTP has expired. Please request a new one.");
    }

    if (storedOtp !== otp) {
      console.log("Invalid OTP for user:", email);
      return ctx.badRequest("Invalid OTP. Please try again.");
    }

    console.log("OTP verified successfully for user:", email);
    return ctx.send({ ok: true, message: "OTP verified successfully" });
  },
};
