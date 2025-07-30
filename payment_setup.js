// Payment Integration Setup for Pledgr
// Replace the simulation with real payment processing

// ========================================
// STRIPE INTEGRATION (Recommended)
// ========================================

// Add this to your index.html head section:
/*
<script src="https://js.stripe.com/v3/"></script>
*/

// Replace PaymentProcessor.simulatePayment with this:
class StripePaymentProcessor {
    constructor() {
        this.stripe = Stripe('pk_test_your_stripe_key'); // Replace with your key
        this.elements = this.stripe.elements();
    }

    async processPledge(artistId, pledgeLevelId, paymentMethod) {
        const artist = artists.find(a => a.id === artistId);
        const pledgeLevel = artist.pledgeLevels.find(p => p.id === pledgeLevelId);
        
        if (!artist || !pledgeLevel) {
            throw new Error('Invalid artist or pledge level');
        }

        try {
            // Create payment method
            const {paymentMethod: stripePaymentMethod, error} = await this.stripe.createPaymentMethod({
                type: 'card',
                card: paymentMethod.cardElement,
                billing_details: {
                    name: paymentMethod.name,
                },
            });

            if (error) {
                throw new Error(error.message);
            }

            // Process payment (you'll need a backend for this)
            const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentMethodId: stripePaymentMethod.id,
                    amount: pledgeLevel.amount * 100, // Convert to cents
                    artistId: artistId,
                    pledgeLevelId: pledgeLevelId,
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Update artist stats
                artist.pledged += pledgeLevel.amount;
                artist.supporters += 1;
                pledgeLevel.supporters += 1;

                return {
                    success: true,
                    transactionId: result.transactionId,
                    amount: pledgeLevel.amount,
                    platformFee: (pledgeLevel.amount * 5) / 100,
                    artistReceives: pledgeLevel.amount - ((pledgeLevel.amount * 5) / 100),
                    message: `Successfully pledged $${pledgeLevel.amount} to ${artist.name}`
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            throw new Error(`Payment failed: ${error.message}`);
        }
    }
}

// ========================================
// PAYPAL INTEGRATION (Alternative)
// ========================================

// Add this to your index.html head section:
/*
<script src="https://www.paypal.com/sdk/js?client-id=your_paypal_client_id&currency=USD"></script>
*/

class PayPalPaymentProcessor {
    constructor() {
        this.paypal = window.paypal;
    }

    async processPledge(artistId, pledgeLevelId, paymentMethod) {
        const artist = artists.find(a => a.id === artistId);
        const pledgeLevel = artist.pledgeLevels.find(p => p.id === pledgeLevelId);
        
        if (!artist || !pledgeLevel) {
            throw new Error('Invalid artist or pledge level');
        }

        return new Promise((resolve, reject) => {
            this.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: pledgeLevel.amount.toString()
                            },
                            description: `Pledge to ${artist.name} - ${pledgeLevel.name}`
                        }]
                    });
                },
                onApprove: async (data, actions) => {
                    try {
                        const order = await actions.order.capture();
                        
                        // Update artist stats
                        artist.pledged += pledgeLevel.amount;
                        artist.supporters += 1;
                        pledgeLevel.supporters += 1;

                        resolve({
                            success: true,
                            transactionId: order.id,
                            amount: pledgeLevel.amount,
                            platformFee: (pledgeLevel.amount * 5) / 100,
                            artistReceives: pledgeLevel.amount - ((pledgeLevel.amount * 5) / 100),
                            message: `Successfully pledged $${pledgeLevel.amount} to ${artist.name}`
                        });
                    } catch (error) {
                        reject(new Error(`Payment failed: ${error.message}`));
                    }
                },
                onError: (err) => {
                    reject(new Error(`PayPal error: ${err.message}`));
                }
            }).render('#paypal-button-container');
        });
    }
}

// ========================================
// QUICK SETUP INSTRUCTIONS
// ========================================

/*
STEP 1: Choose Payment Provider

Option A - Stripe (Recommended):
1. Go to https://stripe.com
2. Sign up for free account
3. Get your publishable key from Dashboard
4. Replace 'pk_test_your_stripe_key' with your key

Option B - PayPal:
1. Go to https://paypal.com/developer
2. Create a PayPal app
3. Get your client ID
4. Replace 'your_paypal_client_id' with your ID

STEP 2: Update Your Code

Replace the PaymentProcessor class in script.js with:

// For Stripe:
const paymentProcessor = new StripePaymentProcessor();

// For PayPal:
const paymentProcessor = new PayPalPaymentProcessor();

STEP 3: Add Payment Elements

For Stripe, add this to your payment form:
<div id="card-element"></div>
<div id="card-errors" role="alert"></div>

For PayPal, add this:
<div id="paypal-button-container"></div>

STEP 4: Test Payments

- Stripe: Use test card 4242 4242 4242 4242
- PayPal: Use sandbox account for testing

STEP 5: Go Live

- Stripe: Switch to live keys
- PayPal: Switch to live environment
*/

// ========================================
// BACKEND API EXAMPLE (Node.js/Express)
// ========================================

/*
// You'll need a simple backend for Stripe
const express = require('express');
const stripe = require('stripe')('sk_test_your_secret_key');

app.post('/api/process-payment', async (req, res) => {
    try {
        const {paymentMethodId, amount, artistId, pledgeLevelId} = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
            return_url: 'https://your-domain.com/success',
        });

        res.json({
            success: true,
            transactionId: paymentIntent.id,
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
        });
    }
});
*/

// ========================================
// COST COMPARISON
// ========================================

/*
STRIPE:
- Setup: FREE
- Monthly: FREE
- Transaction: 2.9% + 30¢
- Features: Credit cards, Apple Pay, Google Pay
- Dashboard: Professional

PAYPAL:
- Setup: FREE
- Monthly: FREE
- Transaction: 2.9% + 30¢
- Features: PayPal, credit cards
- Dashboard: Basic

SQUARE:
- Setup: FREE
- Monthly: FREE
- Transaction: 2.9% + 30¢
- Features: Credit cards, contactless
- Dashboard: Good
*/

console.log('Payment setup ready! Follow the instructions above to integrate real payments.'); 