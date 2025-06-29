const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Get discovery feed (Instagram-style)
router.get('/feed', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await db('posts')
      .join('users', 'posts.user_id', 'users.id')
      .join('products', 'posts.product_id', 'products.id')
      .select(
        'posts.*',
        'users.username',
        'users.profile_image_url',
        'users.is_verified',
        'products.title as product_title',
        'products.price',
        'products.images as product_images'
      )
      .where('posts.is_active', true)
      .where('users.is_active', true)
      .where('products.is_active', true)
      .orderBy('posts.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.json(posts);
  } catch (error) {
    logger.error('Get feed error', error);
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

// Create a new post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, caption, media, tags, type = 'product' } = req.body;

    // Verify product belongs to user (if seller)
    if (req.user.role === 'seller') {
      const product = await db('products')
        .where('id', productId)
        .where('seller_id', req.user.id)
        .first();

      if (!product) {
        return res
          .status(403)
          .json({ error: 'Product not found or not owned by user' });
      }
    }

    const [post] = await db('posts')
      .insert({
        user_id: req.user.id,
        product_id: productId,
        caption,
        media,
        tags,
        type
      })
      .returning('*');

    res.status(201).json(post);
  } catch (error) {
    logger.error('Create post error', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await db('posts')
      .join('users', 'posts.user_id', 'users.id')
      .join('products', 'posts.product_id', 'products.id')
      .select(
        'posts.*',
        'users.username',
        'users.profile_image_url',
        'users.is_verified',
        'products.title as product_title',
        'products.price',
        'products.images as product_images'
      )
      .where('posts.id', req.params.id)
      .where('posts.is_active', true)
      .first();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    logger.error('Get post error', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// Like/Unlike post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Check if already liked
    const existingLike = await db('likes')
      .where('user_id', userId)
      .where('post_id', postId)
      .first();

    if (existingLike) {
      // Unlike
      await db('likes').where('user_id', userId).where('post_id', postId).del();

      await db('posts').where('id', postId).decrement('likes_count', 1);

      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like
      await db('likes').insert({
        user_id: userId,
        post_id: postId
      });

      await db('posts').where('id', postId).increment('likes_count', 1);

      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    logger.error('Like/unlike post error', error);
    res.status(500).json({ error: 'Failed to like/unlike post' });
  }
});

module.exports = router;
