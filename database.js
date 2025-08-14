const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

class Database {
    constructor() {
        this.type = process.env.DATABASE_TYPE || 'sqlite';
        this.connection = null;
        this.init();
    }

    async init() {
        if (this.type === 'postgres') {
            await this.initPostgres();
        } else {
            this.initSQLite();
        }
    }

    async initPostgres() {
        try {
            this.connection = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
                max: 20, // Maximum number of clients in the pool
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            // Test connection
            await this.connection.query('SELECT NOW()');
            console.log('✅ PostgreSQL connected successfully');
            
            // Initialize tables
            await this.createTables();
        } catch (error) {
            console.error('❌ PostgreSQL connection failed:', error.message);
            console.log('🔄 Falling back to SQLite...');
            this.type = 'sqlite';
            this.initSQLite();
        }
    }

    initSQLite() {
        this.connection = new sqlite3.Database('./pledgr.db');
        console.log('✅ SQLite connected (development mode)');
        this.createTables();
    }

    async createTables() {
        if (this.type === 'postgres') {
            await this.createPostgresTables();
        } else {
            this.createSQLiteTables();
        }
    }

    async createPostgresTables() {
        const queries = [
            `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                avatar TEXT,
                is_creator BOOLEAN DEFAULT FALSE,
                bio TEXT,
                website VARCHAR(500),
                social_twitter VARCHAR(255),
                social_instagram VARCHAR(255),
                social_youtube VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS artists (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                title VARCHAR(500),
                description TEXT,
                category VARCHAR(100),
                image TEXT,
                profile_image TEXT,
                goal DECIMAL(10,2) DEFAULT 0,
                pledged DECIMAL(10,2) DEFAULT 0,
                supporters INTEGER DEFAULT 0,
                days_left INTEGER DEFAULT 30,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS pledge_levels (
                id SERIAL PRIMARY KEY,
                artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                description TEXT,
                benefits TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS pledges (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
                level_id INTEGER REFERENCES pledge_levels(id) ON DELETE CASCADE,
                amount DECIMAL(10,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const query of queries) {
            try {
                await this.connection.query(query);
            } catch (error) {
                if (!error.message.includes('already exists')) {
                    console.error('Table creation error:', error.message);
                }
            }
        }

        // Create indexes for performance
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_artists_user_id ON artists(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_pledges_user_id ON pledges(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_pledges_artist_id ON pledges(artist_id)',
            'CREATE INDEX IF NOT EXISTS idx_pledges_status ON pledges(status)'
        ];

        for (const index of indexes) {
            try {
                await this.connection.query(index);
            } catch (error) {
                console.log('Index creation note:', error.message);
            }
        }
    }

    createSQLiteTables() {
        const db = this.connection;
        db.serialize(() => {
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

            db.run(`CREATE TABLE IF NOT EXISTS pledge_levels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                artist_id INTEGER,
                name TEXT NOT NULL,
                amount REAL NOT NULL,
                description TEXT,
                benefits TEXT,
                FOREIGN KEY (artist_id) REFERENCES artists (id)
            )`);

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
    }

    // Generic query method that works with both databases
    async query(sql, params = []) {
        if (this.type === 'postgres') {
            try {
                const result = await this.connection.query(sql, params);
                return result.rows;
            } catch (error) {
                throw new Error(`PostgreSQL query error: ${error.message}`);
            }
        } else {
            return new Promise((resolve, reject) => {
                this.connection.all(sql, params, (err, rows) => {
                    if (err) reject(new Error(`SQLite query error: ${err.message}`));
                    else resolve(rows);
                });
            });
        }
    }

    // Generic single row query
    async get(sql, params = []) {
        if (this.type === 'postgres') {
            try {
                const result = await this.connection.query(sql, params);
                return result.rows[0] || null;
            } catch (error) {
                throw new Error(`PostgreSQL query error: ${error.message}`);
            }
        } else {
            return new Promise((resolve, reject) => {
                this.connection.get(sql, params, (err, row) => {
                    if (err) reject(new Error(`SQLite query error: ${err.message}`));
                    else resolve(row || null);
                });
            });
        }
    }

    // Generic run method for INSERT/UPDATE/DELETE
    async run(sql, params = []) {
        if (this.type === 'postgres') {
            try {
                const result = await this.connection.query(sql, params);
                return { lastID: result.rows[0]?.id, changes: result.rowCount };
            } catch (error) {
                throw new Error(`PostgreSQL query error: ${error.message}`);
            }
        } else {
            return new Promise((resolve, reject) => {
                this.connection.run(sql, params, function(err) {
                    if (err) reject(new Error(`SQLite query error: ${err.message}`));
                    else resolve({ lastID: this.lastID, changes: this.changes });
                });
            });
        }
    }

    // Close connection
    async close() {
        if (this.type === 'postgres' && this.connection) {
            await this.connection.end();
        } else if (this.connection) {
            this.connection.close();
        }
    }
}

module.exports = Database;
