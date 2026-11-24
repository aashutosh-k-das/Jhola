const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const env = {
  port: Number(process.env.PORT) || 5050,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jhola',
  jwtSecret: process.env.JWT_SECRET || 'jhola-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isProd: process.env.NODE_ENV === 'production',
  // Demo OTP: the code is shown on screen. Only for NEW accounts, never in production unless forced.
  otpDemo: process.env.OTP_DEMO ? process.env.OTP_DEMO === 'true' : process.env.NODE_ENV !== 'production',
  // Test payment gateway (no real money). Must be off once real eSewa/Khalti are connected.
  testPayments: process.env.TEST_PAYMENTS ? process.env.TEST_PAYMENTS === 'true' : true,
  trustProxy: process.env.TRUST_PROXY || false,
  rateLimits: {
    apiPerMinute: Number(process.env.RATE_LIMIT_API_PER_MINUTE) || 600,
    signupsPerHour: Number(process.env.RATE_LIMIT_SIGNUPS_PER_HOUR) || 10,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

if (env.isProd && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

module.exports = env;
