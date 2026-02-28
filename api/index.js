const app = require('../app');

// Vercel will call this file as a serverless function.
// Forward the request to the Express app instance.
module.exports = (req, res) => {
  return app(req, res);
};