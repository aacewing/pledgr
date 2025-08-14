// PayPal Backend Payment Processing
const axios = require('axios');
const config = require('./config');

class PayPalBackend {
    constructor() {
        this.clientId = config.paypal.clientId;
        this.clientSecret = config.paypal.clientSecret;
        this.baseURL = config.paypal.mode === 'live' 
            ? 'https://api-m.paypal.com' 
            : 'https://api-m.sandbox.paypal.com';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // Get access token for PayPal API
    async getAccessToken() {
        try {
            // Check if we have a valid token
            if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                return this.accessToken;
            }

            const response = await axios.post(`${this.baseURL}/v1/oauth2/token`, 
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Expire 1 minute early

            return this.accessToken;
        } catch (error) {
            console.error('Error getting PayPal access token:', error);
            throw new Error('Failed to authenticate with PayPal');
        }
    }

    // Verify PayPal payment
    async verifyPayment(orderId) {
        try {
            const accessToken = await this.getAccessToken();
            
            const response = await axios.get(`${this.baseURL}/v2/checkout/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const order = response.data;
            
            // Verify the order is valid
            if (order.status === 'COMPLETED') {
                return {
                    isValid: true,
                    orderId: order.id,
                    amount: order.purchase_units[0].amount.value,
                    currency: order.purchase_units[0].amount.currency_code,
                    payerId: order.payer.payer_id,
                    customId: order.purchase_units[0].custom_id,
                    timestamp: order.create_time
                };
            } else {
                return {
                    isValid: false,
                    status: order.status,
                    reason: 'Order not completed'
                };
            }
        } catch (error) {
            console.error('Error verifying PayPal payment:', error);
            throw new Error('Failed to verify PayPal payment');
        }
    }

    // Process webhook events
    async processWebhook(eventBody, eventHeaders) {
        try {
            // Verify webhook signature (you should implement this for production)
            // const isValidSignature = this.verifyWebhookSignature(eventBody, eventHeaders);
            // if (!isValidSignature) {
            //     throw new Error('Invalid webhook signature');
            // }

            const event = eventBody;
            
            switch (event.event_type) {
                case 'PAYMENT.CAPTURE.COMPLETED':
                    return await this.handlePaymentCompleted(event);
                
                case 'PAYMENT.CAPTURE.DENIED':
                    return await this.handlePaymentDenied(event);
                
                case 'PAYMENT.CAPTURE.PENDING':
                    return await this.handlePaymentPending(event);
                
                default:
                    console.log('Unhandled webhook event:', event.event_type);
                    return { status: 'ignored' };
            }
        } catch (error) {
            console.error('Error processing webhook:', error);
            throw error;
        }
    }

    // Handle completed payment
    async handlePaymentCompleted(event) {
        try {
            const payment = event.resource;
            const customId = payment.custom_id;
            
            // Extract pledge information from custom_id
            // custom_id format: pledge_timestamp_randomstring
            const pledgeInfo = this.parseCustomId(customId);
            
            // Update database with successful payment
            // This would typically update your pledges table
            console.log('Payment completed:', {
                orderId: payment.id,
                amount: payment.amount.value,
                currency: payment.amount.currency_code,
                customId: customId,
                pledgeInfo: pledgeInfo
            });

            // Send confirmation email to user
            // await this.sendConfirmationEmail(payment);

            return {
                status: 'success',
                message: 'Payment processed successfully',
                paymentId: payment.id
            };
        } catch (error) {
            console.error('Error handling completed payment:', error);
            throw error;
        }
    }

    // Handle denied payment
    async handlePaymentDenied(event) {
        const payment = event.resource;
        console.log('Payment denied:', payment.id);
        
        // Update database to mark payment as failed
        // Send notification to user about failed payment
        
        return {
            status: 'denied',
            message: 'Payment was denied',
            paymentId: payment.id
        };
    }

    // Handle pending payment
    async handlePaymentPending(event) {
        const payment = event.resource;
        console.log('Payment pending:', payment.id);
        
        // Update database to mark payment as pending
        // Send notification to user about pending payment
        
        return {
            status: 'pending',
            message: 'Payment is pending',
            paymentId: payment.id
        };
    }

    // Parse custom ID to extract pledge information
    parseCustomId(customId) {
        try {
            const parts = customId.split('_');
            if (parts.length >= 3) {
                return {
                    type: parts[0],
                    timestamp: parseInt(parts[1]),
                    randomId: parts[2]
                };
            }
            return null;
        } catch (error) {
            console.error('Error parsing custom ID:', error);
            return null;
        }
    }

    // Send confirmation email (placeholder)
    async sendConfirmationEmail(payment) {
        // Implement email sending logic here
        // You could use services like SendGrid, Mailgun, or AWS SES
        console.log('Sending confirmation email for payment:', payment.id);
    }

    // Get payment details
    async getPaymentDetails(paymentId) {
        try {
            const accessToken = await this.getAccessToken();
            
            const response = await axios.get(`${this.baseURL}/v2/payments/captures/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error getting payment details:', error);
            throw new Error('Failed to get payment details');
        }
    }
}

module.exports = PayPalBackend; 