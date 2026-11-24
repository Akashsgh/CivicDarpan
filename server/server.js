require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then listen
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[CivicLens Backend] Server running on http://localhost:${PORT}`);
    console.log(`[CivicLens Backend] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((err) => {
  console.error('[CivicLens Backend] Failed to start server:', err);
});
