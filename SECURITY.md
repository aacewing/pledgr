# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** create a public GitHub issue
### 2. **DO** email us at: security@pledgr.art
### 3. **DO** include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Features

### Authentication & Authorization
- JWT tokens with configurable expiration
- bcrypt password hashing (cost factor 10)
- Rate limiting on authentication endpoints
- Session management with secure tokens

### API Security
- CORS protection with origin validation
- Rate limiting on all API endpoints
- Input validation and sanitization
- SQL injection protection with parameterized queries

### Production Security
- Environment variable configuration
- Secure headers with Helmet.js
- Production-only JWT secret requirement
- CORS origin restriction in production

## Security Best Practices

### For Developers
- Never commit `.env` files
- Use strong, unique JWT secrets
- Regularly update dependencies
- Follow OWASP guidelines

### For Users
- Use strong, unique passwords
- Enable 2FA when available
- Report suspicious activity
- Keep your account information updated

## Updates

Security updates will be released as patch versions (1.0.x) and should be applied immediately in production environments.

## Contact

- **Security Issues**: security@pledgr.art
- **General Support**: support@pledgr.art
- **GitHub Issues**: For non-security bugs and feature requests
