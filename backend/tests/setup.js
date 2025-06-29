// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DB_NAME = 'pipal_test';
process.env.PORT = '3001'; // Use different port for tests

const db = require('../src/config/database');

// Clean up database before each test suite
beforeEach(async () => {
  // Clean up test data
  await db('likes').del();
  await db('follows').del();
  await db('cart_items').del();
  await db('order_items').del();
  await db('orders').del();
  await db('votes').del();
  await db('live_sessions').del();
  await db('posts').del();
  await db('products').del();
  await db('users').del();
});

// Close database connection after all tests
afterAll(async () => {
  await db.destroy();
});
