const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Create live session
router.post(
  '/',
  authenticateToken,
  requireRole(['seller']),
  async (req, res) => {
    try {
      const { postId, title, description } = req.body;

      // Verify post belongs to seller
      const post = await db('posts')
        .where('id', postId)
        .where('user_id', req.user.id)
        .first();

      if (!post) {
        return res
          .status(404)
          .json({ error: 'Post not found or not owned by user' });
      }

      // Create IVS channel (simplified - you'd need actual AWS IVS setup)
      const liveSessionData = {
        seller_id: req.user.id,
        post_id: postId,
        title,
        description,
        status: 'scheduled',
        scheduled_start_time: new Date(),
        votes_required: parseInt(process.env.VOTE_THRESHOLD) || 10,
        total_votes: post.votes_count
      };

      const [liveSession] = await db('live_sessions')
        .insert(liveSessionData)
        .returning('*');

      res.status(201).json(liveSession);
    } catch (error) {
      logger.error('Create live session error', error);
      res.status(500).json({ error: 'Failed to create live session' });
    }
  }
);

// Get live sessions
router.get('/', async (req, res) => {
  try {
    const { status = 'live' } = req.query;

    const sessions = await db('live_sessions')
      .join('users', 'live_sessions.seller_id', 'users.id')
      .join('posts', 'live_sessions.post_id', 'posts.id')
      .select(
        'live_sessions.*',
        'users.username as seller_username',
        'users.profile_image_url as seller_image',
        'posts.caption',
        'posts.media'
      )
      .where('live_sessions.status', status)
      .orderBy('live_sessions.created_at', 'desc');

    res.json(sessions);
  } catch (error) {
    logger.error('Get live sessions error', error);
    res.status(500).json({ error: 'Failed to get live sessions' });
  }
});

// Start live session
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const sessionId = req.params.id;

    const session = await db('live_sessions')
      .where('id', sessionId)
      .where('seller_id', req.user.id)
      .first();

    if (!session) {
      return res.status(404).json({ error: 'Live session not found' });
    }

    await db('live_sessions').where('id', sessionId).update({
      status: 'live',
      actual_start_time: new Date()
    });

    // Notify via socket
    const io = req.app.get('io');
    io.emit('live-session-started', { sessionId });

    res.json({ message: 'Live session started' });
  } catch (error) {
    logger.error('Start live session error', error);
    res.status(500).json({ error: 'Failed to start live session' });
  }
});

// End live session
router.post('/:id/end', authenticateToken, async (req, res) => {
  try {
    const sessionId = req.params.id;

    const session = await db('live_sessions')
      .where('id', sessionId)
      .where('seller_id', req.user.id)
      .first();

    if (!session) {
      return res.status(404).json({ error: 'Live session not found' });
    }

    await db('live_sessions').where('id', sessionId).update({
      status: 'ended',
      end_time: new Date()
    });

    // Notify via socket
    const io = req.app.get('io');
    io.emit('live-session-ended', { sessionId });

    res.json({ message: 'Live session ended' });
  } catch (error) {
    logger.error('End live session error', error);
    res.status(500).json({ error: 'Failed to end live session' });
  }
});

module.exports = router;
