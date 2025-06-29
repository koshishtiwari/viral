# Copilot Instructions for Social Shopping App

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a mobile-first social shopping app built with React Native/Expo frontend and Node.js backend. The app merges Instagram-style product discovery with live shopping sessions.

## Tech Stack
- **Frontend**: React Native/Expo
- **Backend**: Node.js monolith
- **Database**: PostgreSQL with Redis caching
- **Storage**: AWS S3 for media
- **Live Streaming**: AWS IVS (Interactive Video Service)
- **Payments**: Escrow system with delivery confirmation

## Key Features
- Discovery feed with Instagram-style product posts
- Category-based search and filtering
- Live shopping sessions triggered by user voting
- Real-time inventory management
- Escrow payments released via delivery photo confirmation
- In-app purchases and cart system
- Activity tracking (orders, messages, delivery)
- Buyer and seller profiles with verification
- Product catalogs with variants and tags

## Architecture Patterns
- Use React Native best practices with hooks and context
- Implement clean backend architecture with controllers, services, and models
- Use PostgreSQL for transactional data, Redis for caching and real-time features
- Implement proper error handling and validation
- Use TypeScript for type safety where applicable
- Follow mobile-first responsive design principles

## Code Style
- Use functional components with hooks in React Native
- Implement proper state management with Context API or Redux Toolkit
- Use async/await for asynchronous operations
- Follow RESTful API design patterns
- Implement proper logging and monitoring
- Use environment variables for configuration
