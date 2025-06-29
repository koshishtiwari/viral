# Pipal Backend - Social Shopping App

A Node.js backend for a mobile-first social shopping app that merges Instagram-style product discovery with live shopping sessions.

## Features

- **Discovery Feed**: Instagram-style product posts
- **Live Shopping**: 5-minute live showcases triggered by user voting
- **Real-time Features**: WebSocket support for live sessions, chat, voting
- **Escrow Payments**: Secure payments released via delivery photo confirmation
- **User Management**: Buyer/seller profiles with verification
- **Product Catalog**: Full product management with variants and tags
- **Cart & Orders**: Shopping cart and order management
- **Activity Tracking**: Orders, messages, delivery tracking

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Knex.js migrations
- **Cache**: Redis for real-time features
- **Real-time**: Socket.IO for live features
- **Storage**: AWS S3 for media files
- **Live Streaming**: AWS IVS (Interactive Video Service)
- **Payments**: Stripe integration
- **Authentication**: JWT tokens

## Quick Start

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- Redis
- AWS Account (for S3 and IVS)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up database:
```bash
# Create database
createdb pipal_dev

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

4. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/follow` - Follow/unfollow user
- `GET /api/users/:id/followers` - Get followers
- `GET /api/users/:id/following` - Get following

### Posts
- `GET /api/posts/feed` - Get discovery feed
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get single post
- `POST /api/posts/:id/like` - Like/unlike post

### Products
- `GET /api/products` - Get products with filters
- `POST /api/products` - Create product (sellers only)
- `GET /api/products/:id` - Get single product

### Live Sessions
- `POST /api/live` - Create live session
- `GET /api/live` - Get live sessions
- `POST /api/live/:id/start` - Start session
- `POST /api/live/:id/end` - End session

### Voting
- `POST /api/votes/:postId` - Vote for post to go live
- `GET /api/votes/:postId` - Get votes for post

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get single order

### Delivery
- `POST /api/delivery/confirm/:orderId` - Confirm delivery with photo

## Database Schema

The app uses PostgreSQL with the following main tables:

- `users` - User accounts (buyers/sellers)
- `categories` - Product categories
- `products` - Product catalog
- `posts` - Social posts with products
- `live_sessions` - Live shopping sessions
- `votes` - Voting for live sessions
- `orders` - Purchase orders
- `order_items` - Order line items
- `cart_items` - Shopping cart
- `follows` - User follow relationships
- `likes` - Post likes

## Real-time Features

Socket.IO events:
- `join-live-session` - Join live session room
- `leave-live-session` - Leave live session room
- `vote` - Vote for live session
- `live-chat` - Live chat messages
- `inventory-update` - Real-time inventory changes

## Development

### Database Operations

```bash
# Create new migration
npx knex migrate:make migration_name

# Run migrations
npm run db:migrate

# Rollback migration
npm run db:rollback

# Create new seed
npx knex seed:make seed_name

# Run seeds
npm run db:seed
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Environment Variables

Key environment variables needed:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pipal_dev
DB_USER=pipal_user
DB_PASSWORD=pipal_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# AWS
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_key
```

## Architecture

The backend follows a clean architecture pattern:

```
src/
├── config/         # Database, Redis, AWS configuration
├── controllers/    # Route handlers
├── services/       # Business logic
├── models/         # Data models
├── routes/         # API routes
├── middleware/     # Custom middleware
├── utils/          # Utility functions
└── index.js        # Main application entry
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
