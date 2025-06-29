const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body('password').isLength({ min: 6 }),
    body('firstName').optional().isLength({ min: 1, max: 50 }),
    body('lastName').optional().isLength({ min: 1, max: 50 }),
    body('role').optional().isIn(['buyer', 'seller'])
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [body('login').notEmpty(), body('password').notEmpty()],
  authController.login
);

// Get current user
router.get('/me', authenticateToken, authController.getCurrentUser);

// Refresh token
router.post('/refresh', authenticateToken, authController.refreshToken);

// Logout
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
