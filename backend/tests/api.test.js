const request = require('supertest');
const { app } = require('../src/index');

describe('Health Check', () => {
  test('GET /health should return status OK', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('environment', 'development');
  });
});

describe('Auth Endpoints', () => {
  test('POST /api/auth/register should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', userData.email);
  });
});
