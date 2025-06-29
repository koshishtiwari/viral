const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../utils/logger');

class AuthService {
  async registerUser({
    email,
    username,
    password,
    firstName,
    lastName,
    role = 'buyer'
  }) {
    // Check if user already exists
    const existingUser = await db('users')
      .where('email', email)
      .orWhere('username', username)
      .first();

    if (existingUser) {
      throw new Error('User already exists with this email or username');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [user] = await db('users')
      .insert({
        email,
        username,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role
      })
      .returning([
        'id',
        'email',
        'username',
        'first_name',
        'last_name',
        'role',
        'is_verified'
      ]);

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email
    });

    return user;
  }

  async loginUser({ login, password }) {
    // Find user by email or username
    const user = await db('users')
      .where('email', login)
      .orWhere('username', login)
      .first();

    if (!user || !user.is_active) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email
    });

    return user;
  }

  generateToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  formatUserResponse(user) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isVerified: user.is_verified,
      profileImageUrl: user.profile_image_url
    };
  }
}

module.exports = new AuthService();
