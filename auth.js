// 🔒 Pledgr IAM System - Secure Authentication & Authorization
// This module provides a complete IAM solution for the Pledgr platform

class PledgrAuth {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.isAuthenticated = false;
        
        // Security configuration
        this.config = {
            tokenExpiryMinutes: 60,
            refreshTokenExpiryDays: 7,
            maxLoginAttempts: 5,
            lockoutDurationMinutes: 15,
            passwordMinLength: 8,
            requireSpecialChars: true,
            requireNumbers: true,
            requireUppercase: true
        };
        
        this.init();
    }

    // Initialize authentication system
    init() {
        this.loadSession();
        this.setupSecurityHeaders();
        this.updateUI();
        this.startTokenRefresh();
    }

    // 🔐 User Registration
    async register(userData) {
        try {
            // Validate input data
            const validation = this.validateRegistrationData(userData);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Check if user already exists
            const existingUser = this.getUserByEmail(userData.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash password securely
            const hashedPassword = await this.hashPassword(userData.password);
            
            // Create user object
            const user = {
                id: this.generateUserId(),
                email: userData.email.toLowerCase().trim(),
                name: userData.name.trim(),
                passwordHash: hashedPassword,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true,
                role: 'user',
                preferences: {
                    emailNotifications: true,
                    marketingEmails: false
                },
                security: {
                    loginAttempts: 0,
                    lastFailedLogin: null,
                    passwordChangedAt: new Date().toISOString()
                }
            };

            // Store user (in production, this would go to a database)
            this.storeUser(user);
            
            // Log registration
            this.logSecurityEvent('user_registered', user.id);
            
            // Auto-login after registration
            await this.login(userData.email, userData.password);
            
            return { success: true, user: this.sanitizeUser(user) };
            
        } catch (error) {
            this.logSecurityEvent('registration_failed', null, error.message);
            throw error;
        }
    }

    // 🔑 User Login
    async login(email, password) {
        try {
            // Rate limiting check
            if (this.isRateLimited(email)) {
                throw new Error('Too many login attempts. Please try again later.');
            }

            // Find user
            const user = this.getUserByEmail(email);
            if (!user) {
                this.incrementLoginAttempts(email);
                throw new Error('Invalid email or password');
            }

            // Check if account is locked
            if (this.isAccountLocked(user)) {
                throw new Error('Account is temporarily locked due to too many failed attempts');
            }

            // Verify password
            const isValidPassword = await this.verifyPassword(password, user.passwordHash);
            if (!isValidPassword) {
                this.incrementLoginAttempts(email);
                throw new Error('Invalid email or password');
            }

            // Reset login attempts on successful login
            this.resetLoginAttempts(user.id);

            // Update last login
            user.lastLogin = new Date().toISOString();
            this.updateUser(user);

            // Generate tokens
            const tokens = this.generateTokens(user);
            
            // Set session
            this.setSession(user, tokens);
            
            // Log successful login
            this.logSecurityEvent('login_successful', user.id);
            
            // Update UI
            this.updateUI();
            
            return { success: true, user: this.sanitizeUser(user) };
            
        } catch (error) {
            this.logSecurityEvent('login_failed', null, error.message);
            throw error;
        }
    }

    // 🚪 User Logout
    logout() {
        try {
            if (this.currentUser) {
                this.logSecurityEvent('logout', this.currentUser.id);
            }
            
            this.clearSession();
            this.updateUI();
            
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    // 🔄 Token Management
    generateTokens(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (this.config.tokenExpiryMinutes * 60)
        };

        const refreshPayload = {
            userId: user.id,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (this.config.refreshTokenExpiryDays * 24 * 60 * 60)
        };

        return {
            accessToken: this.encodeJWT(payload),
            refreshToken: this.encodeJWT(refreshPayload),
            expiresIn: this.config.tokenExpiryMinutes * 60
        };
    }

    // 🔄 Refresh Token
    async refreshAccessToken() {
        try {
            if (!this.refreshToken) {
                throw new Error('No refresh token available');
            }

            const decoded = this.decodeJWT(this.refreshToken);
            if (!decoded || decoded.type !== 'refresh') {
                throw new Error('Invalid refresh token');
            }

            const user = this.getUserById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }

            const tokens = this.generateTokens(user);
            this.setSession(user, tokens);
            
            return { success: true, tokens };
            
        } catch (error) {
            this.logout();
            throw error;
        }
    }

    // 🔒 Password Management
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = this.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Verify current password
            const isValidCurrent = await this.verifyPassword(currentPassword, user.passwordHash);
            if (!isValidCurrent) {
                throw new Error('Current password is incorrect');
            }

            // Validate new password
            const validation = this.validatePassword(newPassword);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Hash new password
            const newPasswordHash = await this.hashPassword(newPassword);
            
            // Update user
            user.passwordHash = newPasswordHash;
            user.security.passwordChangedAt = new Date().toISOString();
            this.updateUser(user);

            // Log password change
            this.logSecurityEvent('password_changed', userId);
            
            return { success: true };
            
        } catch (error) {
            this.logSecurityEvent('password_change_failed', userId, error.message);
            throw error;
        }
    }

    // 🔐 Password Hashing (using Web Crypto API)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const salt = crypto.getRandomValues(new Uint8Array(16));
        
        const key = await crypto.subtle.importKey(
            'raw',
            data,
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
        
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            key,
            256
        );
        
        const hashArray = new Uint8Array(derivedBits);
        const saltArray = new Uint8Array(salt);
        
        return btoa(String.fromCharCode(...saltArray)) + ':' + btoa(String.fromCharCode(...hashArray));
    }

    // 🔍 Password Verification
    async verifyPassword(password, hash) {
        try {
            const [saltB64, hashB64] = hash.split(':');
            const salt = new Uint8Array(atob(saltB64).split('').map(c => c.charCodeAt(0)));
            const storedHash = new Uint8Array(atob(hashB64).split('').map(c => c.charCodeAt(0)));
            
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            
            const key = await crypto.subtle.importKey(
                'raw',
                data,
                { name: 'PBKDF2' },
                false,
                ['deriveBits']
            );
            
            const derivedBits = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                key,
                256
            );
            
            const newHash = new Uint8Array(derivedBits);
            
            // Constant-time comparison
            if (storedHash.length !== newHash.length) {
                return false;
            }
            
            let result = 0;
            for (let i = 0; i < storedHash.length; i++) {
                result |= storedHash[i] ^ newHash[i];
            }
            
            return result === 0;
            
        } catch (error) {
            console.error('Password verification error:', error);
            return false;
        }
    }

    // ✅ Input Validation
    validateRegistrationData(data) {
        const errors = [];
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            errors.push('Valid email is required');
        }
        
        // Name validation
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }
        
        // Password validation
        const passwordValidation = this.validatePassword(data.password);
        if (!passwordValidation.isValid) {
            errors.push(...passwordValidation.errors);
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    validatePassword(password) {
        const errors = [];
        
        if (!password || password.length < this.config.passwordMinLength) {
            errors.push(`Password must be at least ${this.config.passwordMinLength} characters`);
        }
        
        if (this.config.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (this.config.requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (this.config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // 🛡️ Security Features
    setupSecurityHeaders() {
        // Add security headers to prevent common attacks
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self'";
        document.head.appendChild(meta);
    }

    isRateLimited(email) {
        const attempts = this.getLoginAttempts(email);
        return attempts.count >= this.config.maxLoginAttempts && 
               (Date.now() - attempts.lastAttempt) < (this.config.lockoutDurationMinutes * 60 * 1000);
    }

    incrementLoginAttempts(email) {
        const attempts = this.getLoginAttempts(email);
        attempts.count++;
        attempts.lastAttempt = Date.now();
        localStorage.setItem(`login_attempts_${email}`, JSON.stringify(attempts));
    }

    resetLoginAttempts(userId) {
        // Clear login attempts for user
        const user = this.getUserById(userId);
        if (user) {
            user.security.loginAttempts = 0;
            user.security.lastFailedLogin = null;
            this.updateUser(user);
        }
    }

    getLoginAttempts(email) {
        const stored = localStorage.getItem(`login_attempts_${email}`);
        return stored ? JSON.parse(stored) : { count: 0, lastAttempt: 0 };
    }

    isAccountLocked(user) {
        return user.security.loginAttempts >= this.config.maxLoginAttempts &&
               user.security.lastFailedLogin &&
               (Date.now() - new Date(user.security.lastFailedLogin).getTime()) < (this.config.lockoutDurationMinutes * 60 * 1000);
    }

    // 📊 Session Management
    setSession(user, tokens) {
        this.currentUser = user;
        this.token = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        this.tokenExpiry = Date.now() + (tokens.expiresIn * 1000);
        this.isAuthenticated = true;
        
        // Store in localStorage (in production, use httpOnly cookies)
        localStorage.setItem('pledgr_session', JSON.stringify({
            user: this.sanitizeUser(user),
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: this.tokenExpiry
        }));
    }

    loadSession() {
        try {
            const session = localStorage.getItem('pledgr_session');
            if (session) {
                const sessionData = JSON.parse(session);
                
                // Check if session is still valid
                if (sessionData.expiresAt > Date.now()) {
                    this.currentUser = sessionData.user;
                    this.token = sessionData.token;
                    this.refreshToken = sessionData.refreshToken;
                    this.tokenExpiry = sessionData.expiresAt;
                    this.isAuthenticated = true;
                } else {
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('Session loading error:', error);
            this.clearSession();
        }
    }

    clearSession() {
        this.currentUser = null;
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.isAuthenticated = false;
        localStorage.removeItem('pledgr_session');
    }

    // 🔄 Token Refresh Timer
    startTokenRefresh() {
        setInterval(() => {
            if (this.isAuthenticated && this.tokenExpiry) {
                const timeUntilExpiry = this.tokenExpiry - Date.now();
                if (timeUntilExpiry < 5 * 60 * 1000) { // Refresh 5 minutes before expiry
                    this.refreshAccessToken().catch(error => {
                        console.error('Token refresh failed:', error);
                        this.logout();
                    });
                }
            }
        }, 60000); // Check every minute
    }

    // 🎨 UI Updates
    updateUI() {
        const authButton = document.querySelector('button[onclick="openModal(\'loginModal\')"]');
        const userMenu = document.querySelector('.nav-menu');
        
        if (this.isAuthenticated && this.currentUser) {
            // Show user menu
            if (authButton) {
                authButton.style.display = 'none';
            }
            
            // Add user menu if it doesn't exist
            if (!document.querySelector('.user-menu')) {
                const userMenuHTML = `
                    <div class="user-menu">
                        <button class="user-menu-btn">
                            <i class="fas fa-user"></i>
                            ${this.currentUser.name}
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="user-dropdown">
                            <a href="#" onclick="pledgrAuth.showProfile()">
                                <i class="fas fa-user-circle"></i> Profile
                            </a>
                            <a href="#" onclick="pledgrAuth.showSettings()">
                                <i class="fas fa-cog"></i> Settings
                            </a>
                            <a href="#" onclick="pledgrAuth.showPledges()">
                                <i class="fas fa-heart"></i> My Pledges
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="#" onclick="pledgrAuth.logout()">
                                <i class="fas fa-sign-out-alt"></i> Sign Out
                            </a>
                        </div>
                    </div>
                `;
                userMenu.insertAdjacentHTML('beforeend', userMenuHTML);
            }
        } else {
            // Show login button
            if (authButton) {
                authButton.style.display = 'inline-block';
            }
            
            // Remove user menu
            const userMenuElement = document.querySelector('.user-menu');
            if (userMenuElement) {
                userMenuElement.remove();
            }
        }
    }

    // 🔧 Utility Methods
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    sanitizeUser(user) {
        const { passwordHash, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    getUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(user => user.email === email.toLowerCase());
    }

    getUserById(id) {
        const users = this.getAllUsers();
        return users.find(user => user.id === id);
    }

    storeUser(user) {
        const users = this.getAllUsers();
        users.push(user);
        localStorage.setItem('pledgr_users', JSON.stringify(users));
    }

    updateUser(updatedUser) {
        const users = this.getAllUsers();
        const index = users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('pledgr_users', JSON.stringify(users));
        }
    }

    getAllUsers() {
        const users = localStorage.getItem('pledgr_users');
        return users ? JSON.parse(users) : [];
    }

    encodeJWT(payload) {
        // Simple JWT encoding (in production, use a proper JWT library)
        const header = { alg: 'HS256', typ: 'JWT' };
        const encodedHeader = btoa(JSON.stringify(header));
        const encodedPayload = btoa(JSON.stringify(payload));
        const signature = btoa('pledgr-secret-key'); // In production, use proper secret
        
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    decodeJWT(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            
            const payload = JSON.parse(atob(parts[1]));
            return payload;
        } catch (error) {
            return null;
        }
    }

    // 📝 Security Logging
    logSecurityEvent(event, userId, details = '') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            userId: userId,
            details: details,
            userAgent: navigator.userAgent,
            ip: 'client-side' // In production, get from server
        };
        
        const logs = this.getSecurityLogs();
        logs.push(logEntry);
        
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('pledgr_security_logs', JSON.stringify(logs));
    }

    getSecurityLogs() {
        const logs = localStorage.getItem('pledgr_security_logs');
        return logs ? JSON.parse(logs) : [];
    }

    // 🎯 Public API Methods
    showProfile() {
        alert('Profile page - Coming soon!');
    }

    showSettings() {
        alert('Settings page - Coming soon!');
    }

    showPledges() {
        alert('My Pledges page - Coming soon!');
    }

    // 🔍 Authorization Methods
    hasRole(role) {
        return this.isAuthenticated && this.currentUser && this.currentUser.role === role;
    }

    isAdmin() {
        return this.hasRole('admin');
    }

    isCreator() {
        return this.hasRole('creator') || this.hasRole('admin');
    }

    canAccessCreatorDashboard() {
        return this.isAuthenticated && this.isCreator();
    }
}

// Initialize the authentication system
const pledgrAuth = new PledgrAuth();

// Export for use in other modules
window.pledgrAuth = pledgrAuth; 