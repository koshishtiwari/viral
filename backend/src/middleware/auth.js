const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details from database
    const user = await db('users')
      .select('id', 'email', 'username', 'role', 'is_verified', 'is_active')
      .where('id', decoded.userId)
      .first();

    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification failed', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = roles => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoles = Array.isArray(req.user.role)
      ? req.user.role
      : [req.user.role];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.is_verified) {
    return res.status(403).json({ error: 'Account verification required' });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireVerified
};
