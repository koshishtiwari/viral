const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const postRoutes = require('./routes/posts');
const liveRoutes = require('./routes/live');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const voteRoutes = require('./routes/votes');
const chatRoutes = require('./routes/chat');
const deliveryRoutes = require('./routes/delivery');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: [
      'http://localhost:8081', 
      'http://localhost:3001', 
      'http://172.26.95.185:8081',
      process.env.FRONTEND_URL || '*'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/delivery', deliveryRoutes);

// Socket.IO for real-time features
io.on('connection', socket => {
  logger.info('User connected', { socketId: socket.id });

  // Join live session room
  socket.on('join-live-session', sessionId => {
    socket.join(`live-${sessionId}`);
    logger.info('User joined live session', { socketId: socket.id, sessionId });
  });

  // Leave live session room
  socket.on('leave-live-session', sessionId => {
    socket.leave(`live-${sessionId}`);
    logger.info('User left live session', { socketId: socket.id, sessionId });
  });

  // Handle voting
  socket.on('vote', data => {
    io.to(`live-${data.sessionId}`).emit('vote-update', data);
  });

  // Handle live chat
  socket.on('live-chat', data => {
    io.to(`live-${data.sessionId}`).emit('new-message', data);
  });

  // Handle inventory updates
  socket.on('inventory-update', data => {
    io.emit('inventory-changed', data);
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected', { socketId: socket.id });
  });
});

// Make io available to routes
app.set('io', io);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`🚀 Pipal Backend Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = { app, server, io };
