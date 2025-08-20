# Chat Service

A comprehensive, scalable chat service built with NestJS, PostgreSQL, and WebSocket technology. This service provides real-time messaging capabilities with advanced features like file sharing, message reactions, and robust authentication.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[![NPM Version](https://img.shields.io/npm/v/@nestjs/core.svg)](https://www.npmjs.com/~nestjscore)
[![License](https://img.shields.io/npm/l/@nestjs/core.svg)](https://github.com/nestjs/nest/blob/master/LICENSE)
[![NPM Downloads](https://img.shields.io/npm/dm/@nestjs/common.svg)](https://www.npmjs.com/~nestjscore)

## 🌟 Features

### Authentication & Security

- 🔐 **JWT-based Authentication** with access and refresh tokens
- 🛡️ **Database-stored Refresh Tokens** with automatic rotation
- 🔑 **Secure Password Hashing** using bcrypt
- 🚫 **User Blocking** functionality
- 📵 **Multi-device Session Management**
- ⏱️ **Token Expiration & Cleanup** with scheduled tasks
- 🚦 **Rate Limiting** to prevent abuse

### Messaging

- 💬 **Real-time Messaging** via WebSocket
- 📎 **File Sharing** with MinIO integration
- 🎉 **Message Reactions** (like, love, laugh, etc.)
- 🔁 **Message Replies** and threading
- ✏️ **Message Editing** with history
- 🗑️ **Message Deletion** (soft delete)
- 📖 **Read Receipts** and unread counters
- 🔍 **Message Search** capabilities

### Users & Profiles

- 👤 **User Profiles** with avatars and bios
- 📇 **User Search** and discovery
- 🔐 **Privacy Controls** with blocking system
- 📊 **Online Status** tracking
- 🏷️ **User Verification** system

### Chats

- 👥 **Private & Group Chats**
- 📝 **Chat Descriptions** and metadata
- 🔗 **Invite Links** for group access
- 👑 **Admin/Moderator Roles** in chats
- 📌 **Chat Pinning** for quick access
- 📈 **Member Count** tracking

## 🏗️ Architecture

The application follows a modular architecture with clear separation of concerns:

```
src/
├── api/                 # API modules (REST & WebSocket)
│   ├── v1/              # API version 1
│   │   ├── auth/        # Authentication endpoints
│   │   ├── chat/        # Real-time chat WebSocket gateway
│   │   ├── chats/       # Chat management REST endpoints
│   │   ├── files/       # File handling endpoints
│   │   ├── message-reactions/ # Message reactions service
│   │   └── user/        # User management endpoints
│   └── health/          # Health check endpoints
├── common/              # Shared utilities and helpers
│   ├── errors/          # Custom error classes
│   ├── guards/          # Authentication guards
│   ├── helpers/         # Utility functions
│   ├── logger/          # Logging service
│   ├── middlewares/     # Middleware functions
│   └── zod/             # Validation utilities
├── services/            # External service integrations
│   ├── jwt/             # JWT service
│   ├── minio/           # File storage service
│   ├── prisma/          # Database service
│   └── token-cleanup/   # Scheduled token cleanup service
└── app.module.ts        # Root application module
```

## 🗃️ Database Schema

The service uses PostgreSQL with Prisma ORM for data persistence. Key models include:

- **User**: User accounts with profiles, authentication, and privacy settings
- **Session**: User sessions with device and IP tracking
- **RefreshToken**: Secure refresh token storage with expiration
- **Chat**: Chat rooms with metadata and settings
- **ChatParticipant**: User participation in chats with roles and permissions
- **Message**: Chat messages with reactions and file attachments
- **MessageReaction**: User reactions to messages
- **File**: File metadata and storage information
- **UserBlock**: User blocking relationships

See [DATABASE_ENHANCEMENT_GUIDE.md](DATABASE_ENHANCEMENT_GUIDE.md) for detailed schema information.

## 🔐 Authentication

The authentication system implements industry best practices:

### Token Management

- **Access Tokens**: Short-lived JWT tokens (default 1 hour)
- **Refresh Tokens**: Long-lived tokens stored in database with 30-day expiration
- **Automatic Token Rotation**: Refresh tokens are rotated on each use
- **Device Binding**: Tokens are bound to specific devices with fingerprinting

### Security Features

- **Rate Limiting**: Throttling on authentication endpoints
- **Password Validation**: Strong password requirements
- **Input Validation**: Zod-based validation for all inputs
- **Secure Headers**: Proper HTTP security headers
- **CORS Protection**: Configurable CORS settings

See [REFRESH_TOKEN_IMPLEMENTATION.md](REFRESH_TOKEN_IMPLEMENTATION.md) for detailed implementation.

## 📁 File Handling

Files are stored using MinIO (S3-compatible object storage):

- **Multiple File Types**: Images, videos, documents, audio
- **Metadata Tracking**: File type, size, dimensions, duration
- **Thumbnails**: Automatic thumbnail generation for images
- **Access Control**: File access restricted to chat participants
- **Validation**: File type and size validation

## ⚡ Real-time Messaging

WebSocket-based real-time communication:

- **Message Broadcasting**: Instant message delivery to chat participants
- **Typing Indicators**: Real-time typing status
- **Connection Management**: Robust connection handling with reconnection
- **Event-based Architecture**: Subscribe to specific events

## 🚀 API Endpoints

### Authentication

```
POST   /api/v1/auth/signup          # User registration
POST   /api/v1/auth/signin          # User login
POST   /api/v1/auth/refresh         # Token refresh
POST   /api/v1/auth/logout          # Logout current device
POST   /api/v1/auth/logout-all      # Logout all devices
GET    /api/v1/auth/sessions        # Get active sessions
GET    /api/v1/auth/refresh-tokens  # Get active refresh tokens
```

### Users

```
GET    /api/v1/user/profile         # Get user profile
PATCH  /api/v1/user/profile         # Update user profile
GET    /api/v1/user/search          # Search users
POST   /api/v1/user/block/:userId   # Block user
DELETE /api/v1/user/block/:userId   # Unblock user
```

### Chats

```
POST   /api/v1/chats                # Create new chat
GET    /api/v1/chats                # Get user chats
GET    /api/v1/chats/search         # Search chats
GET    /api/v1/chats/search/users   # Search chats by user
GET    /api/v1/chats/pinned         # Get pinned chats
POST   /api/v1/chats/direct/:userId # Create direct chat
DELETE /api/v1/chats/:chatId/leave  # Leave chat
PATCH  /api/v1/chats/:chatId/read   # Mark chat as read
PATCH  /api/v1/chats/:chatId/pin    # Pin/unpin chat
```

### Messages (WebSocket Events)

```
sendMessage    # Send a message to a chat
joinChat       # Join a chat room
getMessages    # Retrieve chat messages
deleteMessage  # Delete a message
```

## 🛠️ Installation

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 13
- MinIO or S3-compatible storage
- pnpm >= 8

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd chat-service
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
pnpm run start:dev
```

## ⚙️ Environment Configuration

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chatdb

# JWT
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRE=1h

# MinIO
MINIO_USER=minioadmin
MINIO_PASS=minioadmin
MINIO_URL=localhost
MINIO_PORT=9000

# Application
APP_TOKEN=your-app-token
```

## 🧪 Development

### Scripts

```bash
# Development
pnpm run start:dev

# Production build
pnpm run build
pnpm run start:prod

# Testing
pnpm run test
pnpm run test:e2e
pnpm run test:cov

# Linting
pnpm run lint
pnpm run format
```

### Project Structure Guidelines

- **Modular Design**: Each feature is a separate module
- **Single Responsibility**: Services have focused responsibilities
- **Dependency Injection**: All dependencies are injected via constructor
- **Error Handling**: Comprehensive error handling with proper HTTP codes
- **Validation**: Input validation using Zod schemas
- **Logging**: Structured logging with context

## 📊 Monitoring & Maintenance

### Scheduled Tasks

- **Daily at 2 AM**: Cleanup expired refresh tokens
- **Daily at 3 AM**: Cleanup inactive sessions
- **Weekly**: Cleanup old revoked tokens

### Health Checks

- **API Health**: `/api/health` endpoint
- **Database Health**: Connection status
- **Storage Health**: MinIO connectivity

## 🚀 Deployment

### Production Considerations

1. Use environment-specific configuration
2. Set up proper SSL certificates
3. Configure load balancing for horizontal scaling
4. Set up monitoring and alerting
5. Regular database backups
6. Secure storage access policies

### Docker Deployment

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .
EXPOSE 4001
CMD ["node", "dist/main"]
```

## 📚 Documentation

- [API Documentation](/docs) - Swagger/OpenAPI documentation
- [Database Schema](DATABASE_ENHANCEMENT_GUIDE.md) - Detailed database structure
- [Security Implementation](SECURITY_IMPROVEMENTS.md) - Security features and fixes
- [Refresh Token System](REFRESH_TOKEN_IMPLEMENTATION.md) - Token management details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Khamidov Rakhmatjon**

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [MinIO](https://min.io/) - High-performance object storage
- [Socket.IO](https://socket.io/) - Real-time communication engine
