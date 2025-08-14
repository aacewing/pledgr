# Contributing to Pledgr

Thank you for your interest in contributing to Pledgr! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct.

## How Can I Contribute?

### Reporting Bugs
- Use the GitHub issue tracker
- Include detailed steps to reproduce
- Include your environment details
- Include error messages and logs

### Suggesting Enhancements
- Use the GitHub issue tracker
- Describe the enhancement clearly
- Explain why this enhancement would be useful
- Include mockups if applicable

### Pull Requests
- Fork the repository
- Create a feature branch (`git checkout -b feature/amazing-feature`)
- Make your changes
- Add tests if applicable
- Ensure all tests pass
- Submit a pull request

## Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Local Development
```bash
# Clone the repository
git clone https://github.com/pledgr/pledgr.git
cd pledgr

# Install dependencies
npm install

# Create environment file
cp env.template .env
# Edit .env with your local settings

# Start development server
npm run dev
```

## Code Style

### JavaScript/Node.js
- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### Git Commit Messages
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests after the first line

### Example:
```
Add user authentication system

- Implement JWT token authentication
- Add bcrypt password hashing
- Create user registration and login endpoints
- Add rate limiting for security

Closes #123
```

## Testing

### Before Submitting
- [ ] Code runs without errors
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Code follows style guidelines
- [ ] Documentation updated if needed

## Security

### Never Commit
- `.env` files
- API keys or secrets
- Database files
- Log files
- Node modules

### Security Best Practices
- Validate all user inputs
- Use parameterized queries
- Implement proper authentication
- Follow OWASP guidelines
- Keep dependencies updated

## Questions?

If you have questions about contributing, please:
1. Check existing issues and discussions
2. Create a new issue with the "question" label
3. Contact the maintainers

## Thank You!

Your contributions help make Pledgr better for everyone! 🎉
