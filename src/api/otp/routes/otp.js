export default {
    routes: [
      {
        method: "POST",
        path: "/otp/send",
        handler: "otp.sendOtp",
        config: { policies: [], middlewares: [] },
      },
      {
        method: "POST",
        path: "/otp/verify",
        handler: "otp.verifyOtp",
        config: { policies: [], middlewares: [] },
      },
    ],
  };
  