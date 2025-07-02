export default ({ env }) => ({
    email: {
      config: {
        provider: "sendgrid",
        providerOptions: {
          apiKey: env("SENDGRID_API_KEY"),
        },
        settings: {
          defaultFrom: env("EMAIL_ADDRESS"),
          defaultReplyTo: env("EMAIL_ADDRESS"),
        },
      },
    },
  });