export default {
    routes: [
      {
        method: "POST",
        path: "/custom-password/reset-with-otp",
        handler: "custom-password.resetPasswordWithOtp",
        config: {
          policies: [],
          description: "Reset password using OTP",
          tag: {
            plugin: "custom-password",
            name: "Password Reset",
          },
        },
      },
    ],
  };
  