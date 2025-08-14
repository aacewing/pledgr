const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? 
    (() => { throw new Error('JWT_SECRET must be set in production') })() : 
    'dev-secret-key-change-this-in-production');

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
const db = new sqlite3.Database('./pledgr.db');

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT,
        isCreator BOOLEAN DEFAULT 0,
        bio TEXT,
        website TEXT,
        social_twitter TEXT,
        social_instagram TEXT,
        social_youtube TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Sessions table
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Artists/Creators table
    db.run(`CREATE TABLE IF NOT EXISTS artists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        title TEXT,
        description TEXT,
        category TEXT,
        image TEXT,
        profile_image TEXT,
        goal REAL DEFAULT 0,
        pledged REAL DEFAULT 0,
        supporters INTEGER DEFAULT 0,
        days_left INTEGER DEFAULT 30,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Pledge levels table
    db.run(`CREATE TABLE IF NOT EXISTS pledge_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artist_id INTEGER,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        benefits TEXT,
        FOREIGN KEY (artist_id) REFERENCES artists (id)
    )`);

    // Pledges table
    db.run(`CREATE TABLE IF NOT EXISTS pledges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        artist_id INTEGER,
        level_id INTEGER,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (artist_id) REFERENCES artists (id),
        FOREIGN KEY (level_id) REFERENCES pledge_levels (id)
    )`);
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
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (row) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            db.run(
                'INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to create user' });
                    }

                    // Create JWT token
                    const token = jwt.sign({ userId: this.lastID }, JWT_SECRET, { expiresIn: '30d' });

                    res.json({
                        message: 'User registered successfully',
                        token,
                        user: {
                            id: this.lastID,
                            name,
                            email,
                            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
                        }
                    });
                }
            );
        });
    } catch (error) {
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

        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

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
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get('SELECT id, name, email, avatar, isCreator, bio, website, social_twitter, social_instagram, social_youtube FROM users WHERE id = ?', [req.user.userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    });
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, (req, res) => {
    const { name, bio, website, social } = req.body;

    db.run(
        'UPDATE users SET name = ?, bio = ?, website = ?, social_twitter = ?, social_instagram = ?, social_youtube = ? WHERE id = ?',
        [name, bio, website, social?.twitter || '', social?.instagram || '', social?.youtube || '', req.user.userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update profile' });
            }

            res.json({ message: 'Profile updated successfully' });
        }
    );
});

// Get all artists
app.get('/api/artists', (req, res) => {
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
        db.all(query, [category], (err, artists) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ artists });
        });
    } else {
        query += ' GROUP BY a.id';
        db.all(query, (err, artists) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ artists });
        });
    }
});

// Create new artist/creator
app.post('/api/artists', authenticateToken, (req, res) => {
    const { name, title, description, category, goal, image } = req.body;

    if (!name || !title || !description || !category || !goal) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
        'INSERT INTO artists (user_id, name, title, description, category, image, goal) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.userId, name, title, description, category, image, goal],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create artist profile' });
            }

            // Update user to be a creator
            db.run('UPDATE users SET isCreator = 1 WHERE id = ?', [req.user.userId], (err) => {
                if (err) {
                    console.error('Failed to update user creator status:', err);
                }
            });

            res.json({
                message: 'Artist profile created successfully',
                artistId: this.lastID
            });
        }
    );
});

// Get artist details with pledge levels
app.get('/api/artists/:id', (req, res) => {
    const artistId = req.params.id;

    db.get(`
        SELECT a.*, u.name as creator_name, u.avatar as creator_avatar,
               COUNT(DISTINCT p.id) as supporters,
               COALESCE(SUM(p.amount), 0) as pledged
        FROM artists a
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN pledges p ON a.id = p.artist_id AND p.status = 'active'
        WHERE a.id = ?
        GROUP BY a.id
    `, [artistId], (err, artist) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!artist) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        // Get pledge levels for this artist
        db.all('SELECT * FROM pledge_levels WHERE artist_id = ?', [artistId], (err, pledgeLevels) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({
                artist: {
                    ...artist,
                    pledgeLevels
                }
            });
        });
    });
});

// Create pledge
app.post('/api/pledges', authenticateToken, (req, res) => {
    const { artistId, levelId, amount } = req.body;

    if (!artistId || !levelId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
        'INSERT INTO pledges (user_id, artist_id, level_id, amount) VALUES (?, ?, ?, ?)',
        [req.user.userId, artistId, levelId, amount],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create pledge' });
            }

            res.json({
                message: 'Pledge created successfully',
                pledgeId: this.lastID
            });
        }
    );
});

// Get user pledges
app.get('/api/pledges', authenticateToken, (req, res) => {
    db.all(`
        SELECT p.*, a.name as artist_name, a.image as artist_image, pl.name as level_name
        FROM pledges p
        JOIN artists a ON p.artist_id = a.id
        JOIN pledge_levels pl ON p.level_id = pl.id
        WHERE p.user_id = ? AND p.status = 'active'
    `, [req.user.userId], (err, pledges) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ pledges });
    });
});

// Cancel pledge
app.delete('/api/pledges/:id', authenticateToken, (req, res) => {
    const pledgeId = req.params.id;

    db.run(
        'UPDATE pledges SET status = "cancelled" WHERE id = ? AND user_id = ?',
        [pledgeId, req.user.userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Pledge not found or not authorized' });
            }

            res.json({ message: 'Pledge cancelled successfully' });
        }
    );
});

// PayPal webhook endpoint
app.post('/api/paypal/webhook', async (req, res) => {
    try {
        const paypalBackend = new PayPalBackend();
        const result = await paypalBackend.processWebhook(req.body, req.headers);
        
        res.json(result);
    } catch (error) {
        console.error('PayPal webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// PayPal payment verification endpoint
app.post('/api/paypal/verify', async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }
        
        const paypalBackend = new PayPalBackend();
        const verification = await paypalBackend.verifyPayment(orderId);
        
        res.json(verification);
    } catch (error) {
        console.error('PayPal verification error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Database initialized successfully');
}); 