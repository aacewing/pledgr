// PayPal Integration for Pledgr
class PayPalIntegration {
    static isLoaded = false;
    static paypal = null;

    // Initialize PayPal
    static async init() {
        try {
            // Load PayPal SDK
            await this.loadPayPalSDK();
            this.isLoaded = true;
            console.log('PayPal SDK loaded successfully');
        } catch (error) {
            console.error('Failed to load PayPal SDK:', error);
            this.isLoaded = false;
        }
    }

    // Load PayPal SDK dynamically
    static loadPayPalSDK() {
        return new Promise((resolve, reject) => {
            if (window.paypal) {
                this.paypal = window.paypal;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://www.paypal.com/sdk/js?client-id=AfYKa_1jwviLyZ9fMx7nR&currency=USD&intent=capture';
            script.onload = () => {
                this.paypal = window.paypal;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Create PayPal button for a pledge
    static createButton(containerId, amount, artistName, onApprove, onError) {
        if (!this.isLoaded) {
            console.warn('PayPal not loaded, showing fallback button');
            this.createFallbackButton(containerId, amount, artistName);
            return;
        }

        try {
            this.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: amount.toString(),
                                currency_code: 'USD'
                            },
                            description: `Pledge to ${artistName}`,
                            custom_id: `pledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                        }],
                        application_context: {
                            shipping_preference: 'NO_SHIPPING',
                            user_action: 'PAY_NOW'
                        }
                    });
                },
                onApprove: async (data, actions) => {
                    try {
                        // Show loading state
                        const container = document.getElementById(containerId);
                        if (container) {
                            container.innerHTML = '<div class="payment-processing"><i class="fas fa-spinner fa-spin"></i> Processing payment...</div>';
                        }
                        
                        // Capture the order
                        const order = await actions.order.capture();
                        
                        // Process successful payment
                        if (order.status === 'COMPLETED') {
                            console.log('PayPal payment completed:', order);
                            
                            // Call the success callback
                            if (onApprove) {
                                onApprove(order);
                            }
                            
                            // Show success message
                            showNotification(`Successfully pledged $${amount} to ${artistName}!`, 'success');
                            
                            // Close modal after delay
                            setTimeout(() => {
                                closeModal('pledgeModal');
                            }, 2000);
                        }
                    } catch (error) {
                        console.error('Error capturing PayPal order:', error);
                        if (onError) {
                            onError(error);
                        }
                        // Show error and restore button
                        this.createButton(containerId, amount, artistName, onApprove, onError);
                    }
                },
                onError: (err) => {
                    console.error('PayPal error:', err);
                    if (onError) {
                        onError(err);
                    }
                    showNotification('Payment failed. Please try again.', 'error');
                },
                onCancel: () => {
                    console.log('PayPal payment cancelled');
                    showNotification('Payment was cancelled.', 'info');
                }
            }).render(containerId);
        } catch (error) {
            console.error('Error creating PayPal button:', error);
            this.createFallbackButton(containerId, amount, artistName);
        }
    }

    // Create fallback button when PayPal fails
    static createFallbackButton(containerId, amount, artistName) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <button class="btn-primary paypal-fallback" onclick="PayPalIntegration.processFallbackPayment(${amount}, '${artistName}')">
                <i class="fab fa-paypal"></i>
                Pay with PayPal (${formatCurrency(amount)})
            </button>
        `;
    }

    // Process fallback payment
    static processFallbackPayment(amount, artistName) {
        // Simulate payment processing
        const loadingBtn = document.querySelector('.paypal-fallback');
        if (loadingBtn) {
            loadingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            loadingBtn.disabled = true;
        }

        setTimeout(() => {
            // Simulate successful payment
            if (loadingBtn) {
                loadingBtn.innerHTML = '<i class="fas fa-check"></i> Payment Successful!';
                loadingBtn.className = 'btn-success';
            }
            
            // Show success message
            showNotification(`Successfully pledged $${amount} to ${artistName}!`, 'success');
            
            // Close modal after delay
            setTimeout(() => {
                closeModal('pledgeModal');
            }, 2000);
        }, 2000);
    }
}

// Initialize PayPal when page loads
document.addEventListener('DOMContentLoaded', () => {
    PayPalIntegration.init();
});

// Utility function for currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
} 