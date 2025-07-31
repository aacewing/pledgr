# Stripe Setup Guide for Pledgr

## Quick Setup (5 minutes)

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Click "Start now" and create a free account
3. Verify your email and complete basic setup

### 2. Get Your API Keys
1. In your Stripe Dashboard, go to **Developers** → **API keys**
2. Copy your **Publishable key** (starts with `pk_test_` for testing)
3. Keep your **Secret key** safe (starts with `sk_test_` for testing)

### 3. Update Your Code
1. Open `stripe-integration.js`
2. Replace `YOUR_STRIPE_PUBLISHABLE_KEY` with your actual publishable key:
   ```javascript
   const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_actual_key_here';
   ```

### 4. Test Payments
1. Deploy your updated code to Netlify
2. Test with these Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Expiry**: Any future date
   - **CVC**: Any 3 digits

## Going Live

### 1. Switch to Live Mode
1. In Stripe Dashboard, toggle from "Test mode" to "Live mode"
2. Get your live publishable key (starts with `pk_live_`)
3. Update your code with the live key
4. Change `STRIPE_ENVIRONMENT` from `'test'` to `'live'`

### 2. Complete Business Verification
1. Add your business information
2. Verify your identity
3. Add a bank account for payouts

## Stripe Features & Benefits

### ✅ What's Included
- **Secure payments** - PCI compliant
- **Global support** - 135+ currencies
- **Automatic payouts** - Daily/weekly/monthly
- **Fraud protection** - Built-in security
- **Mobile optimized** - Works on all devices
- **Analytics** - Detailed payment reports

### 💰 Fees
- **2.9% + 30¢** per successful transaction
- **No monthly fees**
- **No setup fees**
- **No hidden charges**

### 🔒 Security
- **PCI DSS Level 1** compliance
- **Encrypted data** transmission
- **Fraud detection** algorithms
- **Chargeback protection**

## Advanced Configuration

### Custom Branding
You can customize the Stripe Elements styling in `stripe-integration.js`:

```javascript
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
```

### Webhook Setup (Optional)
For production, you'll want to set up webhooks to handle payment confirmations:

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-domain.com/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Troubleshooting

### Common Issues

**"Stripe not configured"**
- Check that your publishable key is correct
- Ensure `stripe-integration.js` is loaded before `script.js`

**"Payment failed"**
- Verify you're using test card numbers in test mode
- Check browser console for error messages
- Ensure your Stripe account is activated

**"Card element not showing"**
- Check that Stripe SDK loaded successfully
- Verify the `#stripe-card-element` div exists
- Check for JavaScript errors in console

### Getting Help
- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: Available in your dashboard
- **Community**: [stripe.com/community](https://stripe.com/community)

## Next Steps

1. **Test thoroughly** with test cards
2. **Deploy to production** with live keys
3. **Monitor payments** in Stripe Dashboard
4. **Set up webhooks** for production
5. **Configure payouts** to your bank account

Your Pledgr site is now ready to accept real payments! 🚀 