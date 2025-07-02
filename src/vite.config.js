// vite.config.js
const { defineConfig } = require('vite');
const path = require('path');

console.log("👉 vite.config.js is loading!");
module.exports = defineConfig({
  server: {
    host: true,            // Allow LAN + external access
    port: 1337,            // Your desired port
    strictPort: false,     // Allow automatic port switching if needed
    allowedHosts: ['*'],   // Allow all hosts
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    hmr: {
      clientPort: 443,      // For ngrok HTTPS websocket
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});

