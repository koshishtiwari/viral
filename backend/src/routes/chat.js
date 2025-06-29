const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Live chat placeholder
router.post('/live/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const sessionId = req.params.sessionId;

    // Emit message via socket
    const io = req.app.get('io');
    io.to(`live-${sessionId}`).emit('new-message', {
      id: Date.now(),
      userId: req.user.id,
      username: req.user.username,
      message,
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    logger.error('Chat error', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
