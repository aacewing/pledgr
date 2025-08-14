// Configuration file for Pledgr
module.exports = {
    // PayPal Configuration
    paypal: {
        clientId: 'AfYKa_1jwviLyZ9fMx7nR',
        clientSecret: 'EI34KmtEKTZtaTuSezpNWwDI4UUdmr4yDkUOsg4c_G6g_zngs906cR0Lv1e8f_5Om6aBGytWonYaCfzI',
        mode: 'sandbox', // Change to 'live' for production
        webhookId: process.env.PAYPAL_WEBHOOK_ID || 'your_webhook_id_here'
    },
    
    // Payment Configuration
    payment: {
        primary: 'paypal',
        supported: ['paypal']
    },
    
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production'
    },
    
    // Database Configuration
    database: {
        url: process.env.DATABASE_URL || './pledgr.db'
    },
    
    // Environment
    environment: process.env.NODE_ENV || 'development',
    
    // Platform Configuration
    platform: {
        feePercentage: 5, // 5% platform fee
        currency: 'USD'
    }
}; 