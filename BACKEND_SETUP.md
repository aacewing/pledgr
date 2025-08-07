# Backend Setup Guide

## What Changed

The authentication system has been upgraded from client-side localStorage to a proper backend with:

- **Express.js server** with RESTful API
- **SQLite database** for persistent data storage
- **JWT authentication** for secure sessions
- **bcrypt password hashing** for security
- **Proper user management** with profiles and pledges

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env` file in the root directory:
   ```
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

## Database Schema

The SQLite database includes these tables:

- **users** - User accounts and profiles
- **sessions** - JWT session management
- **artists** - Creator profiles and projects
- **pledge_levels** - Support tiers for creators
- **pledges** - User support commitments

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Artists
- `GET /api/artists` - List all artists (with optional category filter)
- `POST /api/artists` - Create new artist profile
- `GET /api/artists/:id` - Get artist details with pledge levels

### Pledges
- `POST /api/pledges` - Create new pledge
- `GET /api/pledges` - Get user's pledges
- `DELETE /api/pledges/:id` - Cancel pledge

## Security Features

- **Password hashing** with bcrypt
- **JWT tokens** for session management
- **Input validation** on all endpoints
- **SQL injection protection** with parameterized queries
- **CORS enabled** for cross-origin requests

## Migration from localStorage

The frontend has been updated to use the API instead of localStorage:

- User data is now stored in the database
- Sessions are managed with JWT tokens
- All authentication is server-side validated
- Data persists across devices and browser sessions

## Development

The server runs on `http://localhost:3000` by default. The frontend will automatically connect to the API endpoints.

For production deployment, consider:
- Using a production database (PostgreSQL, MySQL)
- Setting up proper environment variables
- Adding rate limiting and additional security measures
- Using HTTPS in production 