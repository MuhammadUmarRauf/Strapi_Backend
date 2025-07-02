import bcrypt from "bcrypt";

export default {
  resetPasswordWithOtp: async (ctx) => {
    const { newPassword, confirmPassword, email, otp } = ctx.request.body;

    if (!newPassword || !confirmPassword) {
      return ctx.badRequest("New password and confirm password are required.");
    }

    if (!email || !otp) {
      return ctx.badRequest("Email and OTP are required for verification.");
    }

    if (newPassword !== confirmPassword) {
      return ctx.badRequest("New password and confirm password do not match.");
    }

    try {
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: { email },
        });

      if (!user) {
        return ctx.badRequest("User with this email does not exist.");
      }

      if (user.resetOtp !== otp) {
        return ctx.badRequest("Invalid OTP.");
      }

      const otpExpiry = new Date(user.resetOtpExpiry);
      if (new Date() > otpExpiry) {
        return ctx.badRequest("OTP has expired. Please request a new one.");
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await strapi.query("plugin::users-permissions.user").update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetOtp: null,
          resetOtpExpiry: null,
        },
      });

      return ctx.send({
        ok: true,
        message: "Password has been reset successfully.",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      return ctx.badRequest("An error occurred while resetting the password.");
    }
  },
};
