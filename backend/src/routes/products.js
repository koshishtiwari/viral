const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { category, search, minPrice, maxPrice, sortBy } = req.query;

    let query = db('products')
      .join('users', 'products.seller_id', 'users.id')
      .select(
        'products.*',
        'users.username as seller_username',
        'users.seller_rating'
      )
      .where('products.is_active', true)
      .where('users.is_active', true);

    if (category) {
      query = query.where('products.category_id', category);
    }

    if (search) {
      query = query.where(function () {
        this.where('products.title', 'ilike', `%${search}%`).orWhere(
          'products.description',
          'ilike',
          `%${search}%`
        );
      });
    }

    if (minPrice) {
      query = query.where('products.price', '>=', minPrice);
    }

    if (maxPrice) {
      query = query.where('products.price', '<=', maxPrice);
    }

    // Sorting
    switch (sortBy) {
      case 'price_low':
        query = query.orderBy('products.price', 'asc');
        break;
      case 'price_high':
        query = query.orderBy('products.price', 'desc');
        break;
      case 'newest':
        query = query.orderBy('products.created_at', 'desc');
        break;
      case 'popular':
        query = query.orderBy('products.views_count', 'desc');
        break;
      default:
        query = query.orderBy('products.created_at', 'desc');
    }

    const products = await query.limit(limit).offset(offset);

    res.json(products);
  } catch (error) {
    logger.error('Get products error', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Create product (sellers only)
router.post(
  '/',
  authenticateToken,
  requireRole(['seller']),
  async (req, res) => {
    try {
      const productData = {
        ...req.body,
        seller_id: req.user.id,
        slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      };

      const [product] = await db('products').insert(productData).returning('*');

      res.status(201).json(product);
    } catch (error) {
      logger.error('Create product error', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await db('products')
      .join('users', 'products.seller_id', 'users.id')
      .select(
        'products.*',
        'users.username as seller_username',
        'users.seller_rating'
      )
      .where('products.id', req.params.id)
      .where('products.is_active', true)
      .first();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment view count
    await db('products').where('id', req.params.id).increment('views_count', 1);

    res.json(product);
  } catch (error) {
    logger.error('Get product error', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

module.exports = router;
