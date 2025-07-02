module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});

// module.exports = ({ env }) => ({
//   host: '0.0.0.0',
//   port: 1337,
//   url: 'https://de25-39-37-169-20.ngrok-free.app',
//   admin: {
//     auth: {
//       secret: env('ADMIN_JWT_SECRET'),
//     },
//   },
//   app: {
//     keys: env.array('APP_KEYS'),
//   },
// });

