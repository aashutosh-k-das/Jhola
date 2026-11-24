const jwt = require('jsonwebtoken');
const env = require('../../config/env');

// `v` ties the token to the user's tokenVersion so a password change revokes it.
const signToken = (user) => jwt.sign({ id: user._id, v: user.tokenVersion || 0 }, env.jwtSecret, { algorithm: 'HS256', expiresIn: env.jwtExpiresIn });

module.exports = { signToken };
