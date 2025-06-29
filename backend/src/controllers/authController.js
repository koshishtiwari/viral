const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const db = require('../config/database');
const logger = require('../utils/logger');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, username, password, firstName, lastName, role } = req.body;

      const user = await authService.registerUser({
        email,
        username,
        password,
        firstName,
        lastName,
        role
      });

      const token = authService.generateToken(user);
      const userResponse = authService.formatUserResponse(user);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: userResponse
      });
    } catch (error) {
      logger.error('Registration error', error);
      res.status(409).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { login, password } = req.body;

      const user = await authService.loginUser({ login, password });
      const token = authService.generateToken(user);
      const userResponse = authService.formatUserResponse(user);

      res.json({
        message: 'Login successful',
        token,
        user: userResponse
      });
    } catch (error) {
      logger.error('Login error', error);
      res.status(401).json({ error: error.message });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await db('users')
        .select(
          'id',
          'email',
          'username',
          'first_name',
          'last_name',
          'role',
          'bio',
          'profile_image_url',
          'is_verified',
          'is_seller_verified',
          'followers_count',
          'following_count',
          'seller_rating',
          'total_sales'
        )
        .where('id', req.user.id)
        .first();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userResponse = authService.formatUserResponse(user);
      res.json({
        ...userResponse,
        bio: user.bio,
        isSellerVerified: user.is_seller_verified,
        followersCount: user.followers_count,
        followingCount: user.following_count,
        sellerRating: user.seller_rating,
        totalSales: user.total_sales
      });
    } catch (error) {
      logger.error('Get current user error', error);
      res.status(500).json({ error: 'Failed to get user information' });
    }
  }

  async refreshToken(req, res) {
    try {
      const token = authService.generateToken(req.user);
      res.json({ token });
    } catch (error) {
      logger.error('Token refresh error', error);
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }

  logout(req, res) {
    logger.info('User logged out', { userId: req.user.id });
    res.json({ message: 'Logged out successfully' });
  }
}

module.exports = new AuthController();
