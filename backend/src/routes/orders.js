const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Create order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod } = req.body;
    const buyerId = req.user.id;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const product = await db('products').where('id', item.productId).first();
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product ${item.productId} not found` });
      }
      subtotal += product.price * item.quantity;
    }

    const taxAmount = subtotal * 0.08; // 8% tax
    const shippingAmount = 10.0; // Fixed shipping
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Assuming single seller for now
    const firstProduct = await db('products')
      .where('id', items[0].productId)
      .first();
    const sellerId = firstProduct.seller_id;

    const [order] = await db('orders')
      .insert({
        order_number: orderNumber,
        buyer_id: buyerId,
        seller_id: sellerId,
        subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_method: paymentMethod
      })
      .returning('*');

    // Create order items
    for (const item of items) {
      const product = await db('products').where('id', item.productId).first();
      await db('order_items').insert({
        order_id: order.id,
        product_id: item.productId,
        product_title: product.title,
        product_sku: product.sku,
        product_variant: item.variant,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: product.price * item.quantity,
        product_image_url: product.images?.[0]
      });
    }

    res.status(201).json(order);
  } catch (error) {
    logger.error('Create order error', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await db('orders')
      .where('buyer_id', req.user.id)
      .orderBy('created_at', 'desc');

    res.json(orders);
  } catch (error) {
    logger.error('Get orders error', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await db('orders')
      .where('id', req.params.id)
      .where(function () {
        this.where('buyer_id', req.user.id).orWhere('seller_id', req.user.id);
      })
      .first();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    const items = await db('order_items').where('order_id', order.id);

    order.items = items;

    res.json(order);
  } catch (error) {
    logger.error('Get order error', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

module.exports = router;
