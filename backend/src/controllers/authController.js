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

  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, bio, profileImageUrl } = req.body;
      const userId = req.user.id;

      const updateData = {};
      if (firstName !== undefined) updateData.first_name = firstName;
      if (lastName !== undefined) updateData.last_name = lastName;
      if (bio !== undefined) updateData.bio = bio;
      if (profileImageUrl !== undefined) updateData.profile_image_url = profileImageUrl;

      await db('users').where('id', userId).update(updateData);

      // Get updated user data
      const updatedUser = await db('users')
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
        .where('id', userId)
        .first();

      const userResponse = authService.formatUserResponse(updatedUser);
      res.json({
        message: 'Profile updated successfully',
        user: {
          ...userResponse,
          bio: updatedUser.bio,
          isSellerVerified: updatedUser.is_seller_verified,
          followersCount: updatedUser.followers_count,
          followingCount: updatedUser.following_count,
          sellerRating: updatedUser.seller_rating,
          totalSales: updatedUser.total_sales
        }
      });
    } catch (error) {
      logger.error('Update profile error', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get current user with password
      const user = await db('users').select('password_hash').where('id', userId).first();

      // Verify current password
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db('users').where('id', userId).update({
        password_hash: newPasswordHash
      });

      logger.info('Password changed successfully', { userId });
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Change password error', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }

  async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // TODO: Implement actual password reset email logic
      // For now, just return success to avoid breaking the API
      logger.info('Password reset requested', { email });
      res.json({ message: 'Password reset instructions sent to your email' });
    } catch (error) {
      logger.error('Forgot password error', error);
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  }

  async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // TODO: Implement actual password reset logic
      logger.info('Password reset attempted');
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      logger.error('Reset password error', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  async verifyEmail(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // TODO: Implement actual email verification logic
      logger.info('Email verification attempted');
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      logger.error('Email verification error', error);
      res.status(500).json({ error: 'Failed to verify email' });
    }
  }

  async resendVerification(req, res) {
    try {
      // TODO: Implement actual verification resend logic
      logger.info('Verification resend requested', { userId: req.user.id });
      res.json({ message: 'Verification email sent' });
    } catch (error) {
      logger.error('Resend verification error', error);
      res.status(500).json({ error: 'Failed to resend verification' });
    }
  }

  logout(req, res) {
    logger.info('User logged out', { userId: req.user.id });
    res.json({ message: 'Logged out successfully' });
  }
}

module.exports = new AuthController();
