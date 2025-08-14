// Pledgr Backend Server - Updated for Render deployment
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const Database = require('./database.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? 
    (() => { throw new Error('JWT_SECRET must be set in production') })() : 
    'dev-secret-key-change-this-in-production');

// Trust proxy for rate limiting (needed on Render)
app.set('trust proxy', 1);

// Middleware
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://pledgr.art', 'https://www.pledgr.art']
        : true,
    credentials: true,
    optionsSuccessStatus: 200
};

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/auth/', authLimiter);

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static('.'));

// Database setup
const db = new Database();

// Wait for database to initialize
db.init().then(() => {
    console.log('✅ Database initialized successfully');
}).catch(err => {
    console.error('❌ Database initialization failed:', err);
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// User registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        // Check if user already exists
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await db.run(
            'INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`]
        );

        // Create JWT token
        const token = jwt.sign({ userId: result.lastID }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            message: 'User registered successfully',
            token,
            user: {
                id: result.lastID,
                name,
                email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                isCreator: user.isCreator
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.get('SELECT id, name, email, avatar, isCreator, bio, website, social_twitter, social_instagram, social_youtube FROM users WHERE id = ?', [req.user.userId]);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { name, bio, website, social } = req.body;
        
        await db.run(
            'UPDATE users SET name = ?, bio = ?, website = ?, social_twitter = ?, social_instagram = ?, social_youtube = ? WHERE id = ?',
            [name, bio, website, social?.twitter || '', social?.instagram || '', social?.youtube || '', req.user.userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get all artists
app.get('/api/artists', async (req, res) => {
    try {
        const category = req.query.category;
        
        let query = `
            SELECT a.*, u.name as creator_name, u.avatar as creator_avatar,
                   COUNT(DISTINCT p.id) as supporters,
                   COALESCE(SUM(p.amount), 0) as pledged
            FROM artists a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN pledges p ON a.id = p.artist_id AND p.status = 'active'
        `;
        
        if (category && category !== 'all') {
            query += ' WHERE a.category = ?';
            query += ' GROUP BY a.id';
            const artists = await db.query(query, [category]);
            res.json({ artists });
        } else {
            query += ' GROUP BY a.id';
            const artists = await db.query(query);
            res.json({ artists });
        }
    } catch (error) {
        console.error('Get artists error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Create artist profile
app.post('/api/artists', authenticateToken, async (req, res) => {
    try {
        const { name, title, description, category, image, goal } = req.body;
        
        if (!name || !title || !description || !category) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const result = await db.run(
            'INSERT INTO artists (user_id, name, title, description, category, image, goal) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.userId, name, title, description, category, image, goal || 0]
        );

        // Update user to creator status
        await db.run('UPDATE users SET isCreator = 1 WHERE id = ?', [req.user.userId]);

        res.json({
            message: 'Artist profile created successfully',
            artistId: result.lastID
        });
    } catch (error) {
        console.error('Create artist error:', error);
        res.status(500).json({ error: 'Failed to create artist profile' });
    }
});

// Get artist by ID
app.get('/api/artists/:id', async (req, res) => {
    try {
        const artist = await db.get(`
            SELECT a.*, u.name as creator_name, u.avatar as creator_avatar,
                   COUNT(DISTINCT p.id) as supporters,
                   COALESCE(SUM(p.amount), 0) as pledged
            FROM artists a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN pledges p ON a.id = p.artist_id AND p.status = 'active'
            WHERE a.id = ?
            GROUP BY a.id
        `, [req.params.id]);

        if (!artist) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        res.json({ artist });
    } catch (error) {
        console.error('Get artist error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Create pledge
app.post('/api/pledges', authenticateToken, async (req, res) => {
    try {
        const { artistId, amount, levelId } = req.body;
        
        if (!artistId || !amount) {
            return res.status(400).json({ error: 'Artist ID and amount are required' });
        }
        
        const result = await db.run(
            'INSERT INTO pledges (user_id, artist_id, level_id, amount) VALUES (?, ?, ?, ?)',
            [req.user.userId, artistId, levelId || null, amount]
        );

        // Update artist pledged amount
        await db.run(
            'UPDATE artists SET pledged = pledged + ? WHERE id = ?',
            [amount, artistId]
        );

        res.json({
            message: 'Pledge created successfully',
            pledgeId: result.lastID
        });
    } catch (error) {
        console.error('Create pledge error:', error);
        res.status(500).json({ error: 'Failed to create pledge' });
    }
});

// Get user pledges
app.get('/api/pledges', authenticateToken, async (req, res) => {
    try {
        const pledges = await db.query(`
            SELECT p.*, a.name as artist_name, a.image as artist_image
            FROM pledges p
            JOIN artists a ON p.artist_id = a.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        `, [req.user.userId]);

        res.json({ pledges });
    } catch (error) {
        console.error('Get pledges error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Cancel pledge
app.delete('/api/pledges/:id', authenticateToken, async (req, res) => {
    try {
        const pledgeId = req.params.id;

        const result = await db.run(
            'UPDATE pledges SET status = "cancelled" WHERE id = ? AND user_id = ?',
            [pledgeId, req.user.userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Pledge not found or not authorized' });
        }

        res.json({ message: 'Pledge cancelled successfully' });
    } catch (error) {
        console.error('Cancel pledge error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: db.type,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Catch-all for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ Database: ${process.env.DATABASE_TYPE || 'sqlite'}`);
    console.log(`🔍 DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
    console.log(`🔍 DATABASE_TYPE: ${process.env.DATABASE_TYPE || 'Not set'}`);
});
