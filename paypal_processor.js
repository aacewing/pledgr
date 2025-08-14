// PayPal Payment Processor for Pledgr
// This handles real PayPal payments for the platform

class PayPalPaymentProcessor {
    constructor() {
        this.isInitialized = false;
        this.currentTransaction = null;
        this.initPayPal();
    }

    async initPayPal() {
        try {
            // Wait for PayPal to load
            if (typeof paypal !== 'undefined') {
                this.isInitialized = true;
                console.log('PayPal SDK loaded successfully');
            } else {
                // Retry after a short delay
                setTimeout(() => this.initPayPal(), 1000);
            }
        } catch (error) {
            console.error('PayPal initialization failed:', error);
        }
    }

    async processPledge(artistId, pledgeLevelId, userData = {}) {
        const artist = artists.find(a => a.id === artistId);
        const pledgeLevel = artist.pledgeLevels.find(p => p.id === pledgeLevelId);
        
        if (!artist || !pledgeLevel) {
            throw new Error('Invalid artist or pledge level');
        }

        return new Promise((resolve, reject) => {
            if (!this.isInitialized) {
                reject(new Error('PayPal not initialized. Please try again.'));
                return;
            }

            // Create PayPal button container
            const containerId = `paypal-button-${artistId}-${pledgeLevelId}`;
            let container = document.getElementById(containerId);
            
            if (!container) {
                container = document.createElement('div');
                container.id = containerId;
                document.body.appendChild(container);
            }

            // Clear previous buttons
            container.innerHTML = '';

            paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'rect',
                    label: 'pay'
                },

                createOrder: (data, actions) => {
                    const amount = pledgeLevel.amount;
                    const platformFee = (amount * 5) / 100; // 5% platform fee
                    const artistReceives = amount - platformFee;

                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: amount.toFixed(2),
                                currency_code: 'USD'
                            },
                            description: `Pledge to ${artist.name} - ${pledgeLevel.name}`,
                            custom_id: `${artistId}-${pledgeLevelId}`,
                            soft_descriptor: 'Pledgr Support',
                            payee: {
                                merchant_id: artist.paypalEmail || 'pledgr@example.com'
                            },
                            application_context: {
                                shipping_preference: 'NO_SHIPPING',
                                user_action: 'PAY_NOW',
                                return_url: window.location.origin + '/success',
                                cancel_url: window.location.origin + '/cancel'
                            }
                        }],
                        application_context: {
                            brand_name: 'Pledgr',
                            landing_page: 'LOGIN',
                            user_action: 'PAY_NOW'
                        }
                    });
                },

                onApprove: async (data, actions) => {
                    try {
                        // Show loading state
                        this.showPaymentLoading(container);
                        
                        const order = await actions.order.capture();
                        
                        // Process successful payment
                        const result = await this.handleSuccessfulPayment(order, artist, pledgeLevel, userData);
                        
                        // Hide loading and show success
                        this.hidePaymentLoading(container);
                        this.showPaymentSuccess(container, result);
                        
                        resolve(result);
                        
                    } catch (error) {
                        console.error('Payment capture failed:', error);
                        this.hidePaymentLoading(container);
                        this.showPaymentError(container, error.message);
                        reject(new Error(`Payment failed: ${error.message}`));
                    }
                },

                onError: (err) => {
                    console.error('PayPal error:', err);
                    this.showPaymentError(container, err.message);
                    reject(new Error(`PayPal error: ${err.message}`));
                },

                onCancel: (data) => {
                    console.log('Payment cancelled by user');
                    this.showPaymentCancelled(container);
                    reject(new Error('Payment was cancelled'));
                }
            }).render(`#${containerId}`);
        });
    }

    async handleSuccessfulPayment(order, artist, pledgeLevel, userData) {
        // Update artist statistics
        artist.pledged += pledgeLevel.amount;
        artist.supporters += 1;
        pledgeLevel.supporters += 1;

        // Calculate fees
        const platformFee = (pledgeLevel.amount * 5) / 100;
        const artistReceives = pledgeLevel.amount - platformFee;

        // Store transaction data
        const transaction = {
            id: order.id,
            artistId: artist.id,
            artistName: artist.name,
            pledgeLevelId: pledgeLevel.id,
            pledgeLevelName: pledgeLevel.name,
            amount: pledgeLevel.amount,
            platformFee: platformFee,
            artistReceives: artistReceives,
            timestamp: new Date().toISOString(),
            userData: userData,
            status: 'completed'
        };

        // Store in localStorage for demo purposes
        this.storeTransaction(transaction);

        return {
            success: true,
            transactionId: order.id,
            amount: pledgeLevel.amount,
            platformFee: platformFee,
            artistReceives: artistReceives,
            message: `Successfully pledged $${pledgeLevel.amount} to ${artist.name}`,
            transaction: transaction
        };
    }

    storeTransaction(transaction) {
        try {
            const transactions = JSON.parse(localStorage.getItem('pledgr_transactions') || '[]');
            transactions.push(transaction);
            localStorage.setItem('pledgr_transactions', JSON.stringify(transactions));
        } catch (error) {
            console.error('Failed to store transaction:', error);
        }
    }

    getTransactions() {
        try {
            return JSON.parse(localStorage.getItem('pledgr_transactions') || '[]');
        } catch (error) {
            console.error('Failed to get transactions:', error);
            return [];
        }
    }

    showPaymentLoading(container) {
        container.innerHTML = `
            <div class="payment-loading">
                <div class="spinner"></div>
                <p>Processing your payment...</p>
            </div>
        `;
    }

    hidePaymentLoading(container) {
        // This will be replaced by success/error message
    }

    showPaymentSuccess(container, result) {
        container.innerHTML = `
            <div class="payment-success">
                <i class="fas fa-check-circle"></i>
                <h3>Payment Successful!</h3>
                <p>${result.message}</p>
                <div class="transaction-details">
                    <p><strong>Amount:</strong> $${result.amount}</p>
                    <p><strong>Transaction ID:</strong> ${result.transactionId}</p>
                    <p><strong>Platform Fee:</strong> $${result.platformFee.toFixed(2)}</p>
                    <p><strong>Artist Receives:</strong> $${result.artistReceives.toFixed(2)}</p>
                </div>
            </div>
        `;
    }

    showPaymentError(container, error) {
        container.innerHTML = `
            <div class="payment-error">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Payment Failed</h3>
                <p>${error}</p>
                <button onclick="location.reload()" class="btn-primary">Try Again</button>
            </div>
        `;
    }

    showPaymentCancelled(container) {
        container.innerHTML = `
            <div class="payment-cancelled">
                <i class="fas fa-times-circle"></i>
                <h3>Payment Cancelled</h3>
                <p>You cancelled the payment process.</p>
                <button onclick="location.reload()" class="btn-primary">Try Again</button>
            </div>
        `;
    }

    // Get platform revenue (for admin dashboard)
    getPlatformRevenue() {
        const transactions = this.getTransactions();
        return transactions.reduce((total, transaction) => {
            return total + transaction.platformFee;
        }, 0);
    }

    // Get artist earnings
    getArtistEarnings(artistId) {
        const transactions = this.getTransactions();
        return transactions
            .filter(t => t.artistId === artistId)
            .reduce((total, transaction) => {
                return total + transaction.artistReceives;
            }, 0);
    }
}

// Initialize PayPal processor
const paypalProcessor = new PayPalPaymentProcessor();
window.paypalProcessor = paypalProcessor;

console.log('PayPal payment processor initialized'); 