# PayPal Setup Guide for Pledgr

## Quick Setup (5 minutes)

### 1. Create PayPal Developer Account
1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Click "Log in to Dashboard" and sign in with your PayPal account
3. Complete the developer account setup if prompted

### 2. Create a PayPal App
1. In your PayPal Developer Dashboard, go to **My Apps & Credentials**
2. Click **Create App**
3. Enter app name: `Pledgr Payments`
4. Select **Business** account type
5. Click **Create App**

### 3. Get Your Client ID
1. In your app details, copy the **Client ID** (starts with `AQ...`)
2. Keep your **Secret** safe (you'll need this for server-side integration later)

### 4. Update Your Code
1. Open `paypal-integration.js`
2. Replace `YOUR_PAYPAL_CLIENT_ID` with your actual Client ID:
   ```javascript
   const PAYPAL_CLIENT_ID = 'AQ...your_actual_client_id_here';
   ```

### 5. Test Payments
1. Deploy your updated code to Netlify
2. Test with PayPal Sandbox accounts:
   - **Buyer Account**: `sb-buyer@business.example.com` / `password123`
   - **Seller Account**: `sb-seller@business.example.com` / `password123`

## Going Live

### 1. Switch to Live Mode
1. In PayPal Developer Dashboard, toggle from "Sandbox" to "Live"
2. Get your live Client ID (starts with `AQ...`)
3. Update your code with the live Client ID
4. Change `PAYPAL_ENVIRONMENT` from `'sandbox'` to `'production'`

### 2. Complete Business Verification
1. Ensure your PayPal Business account is verified
2. Add your business information
3. Complete identity verification if required

## PayPal Features & Benefits

### ✅ What's Included
- **Secure payments** - PCI compliant
- **Global support** - 200+ countries
- **Multiple currencies** - 25+ currencies
- **Mobile optimized** - Works on all devices
- **Buyer protection** - Built-in security
- **Instant payments** - Real-time processing

### 💰 Fees
- **2.9% + 30¢** per successful transaction
- **No monthly fees**
- **No setup fees**
- **No hidden charges**

### 🔒 Security
- **PCI DSS Level 1** compliance
- **Encrypted data** transmission
- **Fraud protection** algorithms
- **Chargeback protection**

## Advanced Configuration

### Custom Branding
You can customize the PayPal button styling in `paypal-integration.js`:

```javascript
paypal.Buttons({
    style: {
        layout: 'vertical',
        color: 'blue', // blue, gold, silver, black
        shape: 'rect', // rect, pill
        label: 'pay' // pay, paypal, buynow, checkout
    },
    // ... rest of configuration
});
```

### Webhook Setup (Optional)
For production, you'll want to set up webhooks to handle payment confirmations:

1. In PayPal Developer Dashboard, go to **Webhooks**
2. Add endpoint: `https://your-domain.com/webhook`
3. Select events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

## Troubleshooting

### Common Issues

**"PayPal not configured"**
- Check that your Client ID is correct
- Ensure `paypal-integration.js` is loaded before `script.js`
- Verify PayPal SDK loaded successfully

**"Payment failed"**
- Verify you're using sandbox accounts in test mode
- Check browser console for error messages
- Ensure your PayPal app is active

**"PayPal button not showing"**
- Check that PayPal SDK loaded successfully
- Verify the `#paypal-button-container` div exists
- Check for JavaScript errors in console

### Getting Help
- **PayPal Documentation**: [developer.paypal.com/docs](https://developer.paypal.com/docs)
- **PayPal Support**: Available in your developer dashboard
- **Community**: [developer.paypal.com/community](https://developer.paypal.com/community)

## Next Steps

1. **Test thoroughly** with sandbox accounts
2. **Deploy to production** with live credentials
3. **Monitor payments** in PayPal Dashboard
4. **Set up webhooks** for production
5. **Configure payouts** to your bank account

Your Pledgr site now supports both PayPal and Stripe payments! 🚀

## Payment Flow

### For Users:
1. **Select pledge level** from artist page
2. **Choose payment method**: PayPal, Stripe, or Manual Entry
3. **Complete payment** through selected method
4. **Receive confirmation** and pledge is tracked

### For Creators:
1. **Pledges are tracked** in user accounts
2. **Payments processed** through selected gateway
3. **Platform fees calculated** and deducted
4. **Funds transferred** to creator accounts

## Integration Benefits

- **Multiple payment options** increase conversion
- **Familiar payment methods** build trust
- **Global reach** with PayPal's international support
- **Mobile-friendly** payment experience
- **Automatic pledge tracking** for users 