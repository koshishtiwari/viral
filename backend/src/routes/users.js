const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await db('users')
      .select(
        'id',
        'username',
        'first_name',
        'last_name',
        'bio',
        'profile_image_url',
        'is_verified',
        'is_seller_verified',
        'followers_count',
        'following_count',
        'seller_rating',
        'total_sales',
        'role',
        'created_at'
      )
      .where('id', req.params.id)
      .where('is_active', true)
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Get user profile error', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Follow/Unfollow user
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const followingId = req.params.id;
    const followerId = req.user.id;

    if (followingId === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await db('follows')
      .where('follower_id', followerId)
      .where('following_id', followingId)
      .first();

    if (existingFollow) {
      // Unfollow
      await db('follows')
        .where('follower_id', followerId)
        .where('following_id', followingId)
        .del();

      // Update counts
      await db('users')
        .where('id', followingId)
        .decrement('followers_count', 1);
      await db('users').where('id', followerId).decrement('following_count', 1);

      res.json({ message: 'Unfollowed successfully', following: false });
    } else {
      // Follow
      await db('follows').insert({
        follower_id: followerId,
        following_id: followingId
      });

      // Update counts
      await db('users')
        .where('id', followingId)
        .increment('followers_count', 1);
      await db('users').where('id', followerId).increment('following_count', 1);

      res.json({ message: 'Followed successfully', following: true });
    }
  } catch (error) {
    logger.error('Follow/unfollow error', error);
    res.status(500).json({ error: 'Failed to follow/unfollow user' });
  }
});

// Get user's followers
router.get('/:id/followers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const followers = await db('follows')
      .join('users', 'follows.follower_id', 'users.id')
      .select(
        'users.id',
        'users.username',
        'users.first_name',
        'users.last_name',
        'users.profile_image_url',
        'users.is_verified'
      )
      .where('follows.following_id', req.params.id)
      .where('users.is_active', true)
      .orderBy('follows.followed_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.json(followers);
  } catch (error) {
    logger.error('Get followers error', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

// Get user's following
router.get('/:id/following', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const following = await db('follows')
      .join('users', 'follows.following_id', 'users.id')
      .select(
        'users.id',
        'users.username',
        'users.first_name',
        'users.last_name',
        'users.profile_image_url',
        'users.is_verified'
      )
      .where('follows.follower_id', req.params.id)
      .where('users.is_active', true)
      .orderBy('follows.followed_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.json(following);
  } catch (error) {
    logger.error('Get following error', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
});

module.exports = router;
