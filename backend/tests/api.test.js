const request = require('supertest');

// Import app without starting the server
let app;

beforeAll(() => {
  // Import after environment is set
  const { app: testApp } = require('../src/index');
  app = testApp;
});

describe('Health Check', () => {
  test('GET /health should return status OK', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('environment', 'test');
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

  test('POST /api/auth/login should authenticate user', async () => {
    // First register a user
    const userData = {
      email: 'login@example.com',
      username: 'loginuser',
      password: 'password123',
      firstName: 'Login',
      lastName: 'User'
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // Then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        login: userData.email,
        password: userData.password
      })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', userData.email);
  });
});
