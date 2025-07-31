// Stripe Integration for Pledgr
// Replace 'YOUR_STRIPE_PUBLISHABLE_KEY' with your actual Stripe Publishable Key

const STRIPE_PUBLISHABLE_KEY = 'YOUR_STRIPE_PUBLISHABLE_KEY'; // Replace with your Stripe Publishable Key
const STRIPE_ENVIRONMENT = 'test'; // Change to 'live' for production payments

// Stripe SDK Configuration
function loadStripeSDK() {
    return new Promise((resolve, reject) => {
        if (window.Stripe) {
            resolve(window.Stripe);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = () => resolve(window.Stripe);
        script.onerror = () => reject(new Error('Failed to load Stripe SDK'));
        document.head.appendChild(script);
    });
}

// Stripe Payment Processor
class StripePaymentProcessor {
    static async initialize() {
        try {
            await loadStripeSDK();
            console.log('Stripe SDK loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load Stripe SDK:', error);
            return false;
        }
    }

    static async createPaymentMethod(artistId, pledgeLevelId, cardElement) {
        const artist = artists.find(a => a.id === artistId);
        const pledgeLevel = artist.pledgeLevels.find(p => p.id === pledgeLevelId);

        if (!artist || !pledgeLevel) {
            throw new Error('Invalid artist or pledge level');
        }

        const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
        
        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                name: document.getElementById('cardholder-name').value || 'Anonymous Supporter',
            },
        });

        if (error) {
            throw new Error(error.message);
        }

        return {
            paymentMethod,
            amount: pledgeLevel.amount,
            artistId,
            pledgeLevelId,
            artistName: artist.name,
            pledgeLevelName: pledgeLevel.name
        };
    }

    static async processPayment(paymentData) {
        try {
            // In a real implementation, you'd send this to your server
            // For now, we'll simulate the payment processing
            const { paymentMethod, amount, artistId, pledgeLevelId, artistName, pledgeLevelName } = paymentData;
            
            // Simulate server-side payment processing
            const success = await this.simulateServerPayment(paymentMethod.id, amount);
            
            if (success) {
                // Update artist stats
                const artist = artists.find(a => a.id === artistId);
                const pledgeLevel = artist.pledgeLevels.find(p => p.id === pledgeLevelId);

                artist.pledged += amount;
                artist.supporters += 1;
                pledgeLevel.supporters += 1;

                return {
                    success: true,
                    transactionId: 'stripe_' + Date.now(),
                    amount: amount,
                    platformFee: (amount * PLATFORM_FEE_PERCENTAGE) / 100,
                    artistReceives: amount - ((amount * PLATFORM_FEE_PERCENTAGE) / 100),
                    message: `Successfully pledged $${amount} to ${artistName}`
                };
            } else {
                throw new Error('Payment processing failed');
            }
        } catch (error) {
            throw new Error('Payment failed: ' + error.message);
        }
    }

    static async simulateServerPayment(paymentMethodId, amount) {
        // Simulate server-side processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate 95% success rate
        return Math.random() > 0.05;
    }

    static createCardElement() {
        const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
        const elements = stripe.elements();
        
        const cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#9e2146',
                },
            },
        });

        return cardElement;
    }
}

// Initialize Stripe when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await StripePaymentProcessor.initialize();
        console.log('Stripe ready for payments');
    } catch (error) {
        console.error('Stripe initialization failed:', error);
    }
});

// Export for use in main script
window.StripePaymentProcessor = StripePaymentProcessor; 