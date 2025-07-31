// PayPal Integration for Pledgr
// Replace with your actual PayPal Client ID

const PAYPAL_CLIENT_ID = 'AdBQySmH0HyRxh0x-lawNfC-c676fz5HDEssQsArZLgmyC_p9NaCatW4YA91gs5xf3ZyGjmoCSBvDlD3'; // Your PayPal Client ID
const PAYPAL_ENVIRONMENT = 'sandbox'; // Change to 'production' for live payments

// PayPal SDK Configuration
function loadPayPalSDK() {
    return new Promise((resolve, reject) => {
        if (window.paypal) {
            resolve(window.paypal);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
        script.onload = () => resolve(window.paypal);
        script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
        document.head.appendChild(script);
    });
}

// PayPal Payment Processor
class PayPalPaymentProcessor {
    static async initialize() {
        try {
            await loadPayPalSDK();
            console.log('PayPal SDK loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load PayPal SDK:', error);
            return false;
        }
    }

    static createPayPalButton(artistId, pledgeLevelId, containerId) {
        const artist = artists.find(a => a.id === artistId);
        const pledgeLevel = artist.pledgeLevels.find(p => p.id === pledgeLevelId);

        if (!artist || !pledgeLevel) {
            throw new Error('Invalid artist or pledge level');
        }

        const paypal = window.paypal;
        
        paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'pay'
            },
            
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: pledgeLevel.amount.toString()
                        },
                        description: `Pledge to ${artist.name} - ${pledgeLevel.name}`,
                        custom_id: `${artistId}_${pledgeLevelId}`
                    }]
                });
            },
            
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    // Payment successful
                    const paymentData = {
                        success: true,
                        transactionId: details.id,
                        amount: pledgeLevel.amount,
                        platformFee: (pledgeLevel.amount * PLATFORM_FEE_PERCENTAGE) / 100,
                        artistReceives: pledgeLevel.amount - ((pledgeLevel.amount * PLATFORM_FEE_PERCENTAGE) / 100),
                        message: `Successfully pledged $${pledgeLevel.amount} to ${artist.name}`,
                        payerEmail: details.payer.email_address,
                        payerName: details.payer.name.given_name + ' ' + details.payer.name.surname
                    };

                    // Update artist stats
                    artist.pledged += pledgeLevel.amount;
                    artist.supporters += 1;
                    pledgeLevel.supporters += 1;

                    // Add pledge to user's pledges if logged in
                    if (UserAuth.currentUser) {
                        UserAuth.addPledge({
                            artistId: artistId,
                            artistName: artist.name,
                            levelId: pledgeLevelId,
                            levelName: pledgeLevel.name,
                            amount: pledgeLevel.amount
                        });
                    }

                    // Show success message
                    showSuccessMessage(paymentData.message);
                    
                    // Close payment modal
                    setTimeout(() => {
                        closeModal('artistModal');
                    }, 2000);

                    return paymentData;
                });
            },
            
            onError: function(err) {
                console.error('PayPal payment error:', err);
                showErrorMessage('Payment failed. Please try again.');
            }
        }).render(`#${containerId}`);
    }

    static async processPayment(artistId, pledgeLevelId) {
        // This method is called when PayPal is selected as payment method
        const artist = artists.find(a => a.id === artistId);
        const pledgeLevel = artist.pledgeLevels.find(p => p.id === pledgeLevelId);

        if (!artist || !pledgeLevel) {
            throw new Error('Invalid artist or pledge level');
        }

        // For PayPal, we return a promise that resolves when the button is clicked
        return new Promise((resolve, reject) => {
            // The actual payment processing happens in the PayPal button's onApprove callback
            // This is just a placeholder for consistency with other payment processors
            resolve({
                success: true,
                message: 'PayPal payment initiated'
            });
        });
    }
}

// Initialize PayPal when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await PayPalPaymentProcessor.initialize();
        console.log('PayPal ready for payments');
    } catch (error) {
        console.error('PayPal initialization failed:', error);
    }
});

// Export for use in main script
window.PayPalPaymentProcessor = PayPalPaymentProcessor; 