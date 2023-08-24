// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api', // Update this to match your backend route
    createProxyMiddleware({
      target: 'http://localhost:6000', // Update this to your backend's URL
      changeOrigin: true,
    })
  );
};
