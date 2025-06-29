const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Vote for a post to go live
router.post('/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if already voted
    const existingVote = await db('votes')
      .where('user_id', userId)
      .where('post_id', postId)
      .where('vote_type', 'live_session')
      .first();

    if (existingVote) {
      return res.status(400).json({ error: 'Already voted for this post' });
    }

    // Add vote
    await db('votes').insert({
      user_id: userId,
      post_id: postId,
      vote_type: 'live_session'
    });

    // Update post vote count
    await db('posts').where('id', postId).increment('votes_count', 1);

    // Get updated vote count
    const post = await db('posts')
      .select('votes_count')
      .where('id', postId)
      .first();
    const voteThreshold = parseInt(process.env.VOTE_THRESHOLD) || 10;

    // Check if threshold reached
    if (post.votes_count >= voteThreshold) {
      // Trigger live session creation logic here
      const io = req.app.get('io');
      io.emit('live-session-triggered', { postId, votes: post.votes_count });
    }

    res.json({
      message: 'Vote recorded successfully',
      totalVotes: post.votes_count,
      thresholdReached: post.votes_count >= voteThreshold
    });
  } catch (error) {
    logger.error('Vote error', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Get votes for a post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const votes = await db('votes')
      .join('users', 'votes.user_id', 'users.id')
      .select('users.username', 'users.profile_image_url', 'votes.voted_at')
      .where('votes.post_id', postId)
      .where('votes.vote_type', 'live_session')
      .orderBy('votes.voted_at', 'desc');

    res.json(votes);
  } catch (error) {
    logger.error('Get votes error', error);
    res.status(500).json({ error: 'Failed to get votes' });
  }
});

module.exports = router;
