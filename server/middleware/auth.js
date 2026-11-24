const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const User = require('../models/User');
const HttpError = require('../utils/HttpError');

async function userFromRequest(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const { id, v = 0 } = jwt.verify(header.slice(7), env.jwtSecret, { algorithms: ['HS256'] });
    const user = await User.findById(id);
    // Reject tokens from before the last password change (e.g. a stolen token).
    if (!user || (user.tokenVersion || 0) !== v) return null;
    return user;
  } catch {
    return null;
  }
}

async function protect(req, res, next) {
  const user = await userFromRequest(req);
  if (!user) throw new HttpError(401, 'Please log in to continue');
  req.user = user;
  next();
}

async function optionalAuth(req, res, next) {
  req.user = await userFromRequest(req);
  next();
}

function admin(req, res, next) {
  if (!req.user?.isAdmin) throw new HttpError(403, 'Admin access required');
  next();
}

module.exports = { protect, optionalAuth, admin };
