const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Confirm delivery with photo
router.post('/confirm/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPhotoUrl } = req.body;

    const order = await db('orders')
      .where('id', orderId)
      .where('buyer_id', req.user.id)
      .first();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order with delivery confirmation
    await db('orders').where('id', orderId).update({
      delivery_photo_url: deliveryPhotoUrl,
      delivery_confirmed: true,
      delivered_at: new Date(),
      escrow_released_at: new Date(),
      status: 'delivered'
    });

    res.json({ message: 'Delivery confirmed, escrow released' });
  } catch (error) {
    logger.error('Delivery confirmation error', error);
    res.status(500).json({ error: 'Failed to confirm delivery' });
  }
});

module.exports = router;
