# 🎨 Pledgr.art - PayPal-Only Setup Guide

## ✅ **What's Ready:**

- **PayPal Integration**: Complete with real API credentials
- **Backend Processing**: Full payment handling and webhooks
- **Database**: Ready for production pledges
- **Frontend**: Clean, PayPal-focused payment flow

## 🚀 **Quick Start:**

### **1. Test the Application:**
```bash
# Open test.html in your browser
# Try making a pledge with PayPal
# All payments work in sandbox mode
```

### **2. Go Live (Production):**
1. **Update config.js:**
   ```javascript
   paypal: {
       mode: 'live', // Change from 'sandbox'
       // Your credentials are already set
   }
   ```

2. **Set up PayPal Webhooks:**
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
   - Add webhook URL: `https://yourdomain.com/api/paypal/webhook`
   - Events to listen for: `PAYMENT.CAPTURE.COMPLETED`

## 🎯 **Features:**

- ✅ **Real PayPal Payments** - No more simulated payments
- ✅ **Secure Processing** - All payments go through PayPal
- ✅ **Webhook Handling** - Automatic payment confirmations
- ✅ **Database Updates** - Pledges are recorded automatically
- ✅ **User Notifications** - Success/error messages for all payments

## 💳 **Payment Flow:**

1. **User selects pledge level**
2. **PayPal button appears**
3. **User completes PayPal payment**
4. **Payment is captured automatically**
5. **Webhook confirms payment**
6. **Database is updated**
7. **User sees success message**

## 🔧 **Customization:**

### **Change Platform Fee:**
```javascript
// In config.js
platform: {
    feePercentage: 5, // Change to your desired percentage
    currency: 'USD'
}
```

### **Add More Artists:**
```javascript
// In script.js, edit FALLBACK_ARTISTS array
{
    id: 5,
    name: "Your Artist Name",
    category: "music",
    title: "Project Title",
    // ... more fields
}
```

## 🌐 **Deployment:**

### **Netlify (Recommended):**
1. Drag and drop the Pledgr folder
2. Your site is live with PayPal payments!

### **Vercel:**
1. Connect your GitHub repository
2. Deploy automatically

### **GitHub Pages:**
1. Push to main branch
2. Enable Pages in repository settings

## 🎉 **What You Get:**

- **Professional crowdfunding platform**
- **Real PayPal payment processing**
- **Mobile-responsive design**
- **Artist discovery and filtering**
- **Pledge level management**
- **User authentication system**
- **Production-ready backend**

## 🔒 **Security Features:**

- PayPal handles all sensitive payment data
- JWT-based user authentication
- Input validation and sanitization
- HTTPS enforcement in production
- Webhook signature verification ready

---

**Pledgr.art is now a PayPal-powered crowdfunding platform ready for production!** 🚀

No more Stripe complexity - just clean, reliable PayPal payments that work immediately. 