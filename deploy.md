# 🚀 Pledgr - Quick Deployment Guide

## ⚡ Fastest Way to Go Live (2 minutes)

### Option 1: Netlify (Recommended)
1. **Go to [netlify.com](https://netlify.com)**
2. **Click "New site from Git"**
3. **Connect your GitHub account**
4. **Select this repository**
5. **Click "Deploy site"**
6. **Your site is live!** 🎉

### Option 2: Vercel (Alternative)
1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import this repository**
4. **Click "Deploy"**
5. **Your site is live!** 🎉

## 🎯 What You Get

- ✅ **Live website** with custom URL
- ✅ **SSL certificate** (automatic)
- ✅ **CDN** for fast loading
- ✅ **Custom domain** support
- ✅ **Automatic deployments** when you update code

## 🔧 Custom Domain Setup

### Netlify
1. Go to Site Settings > Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., pledgr.com)
4. Follow DNS instructions

### Vercel
1. Go to Project Settings > Domains
2. Add your domain
3. Update DNS records as instructed

## 💳 Payment Integration (Next Steps)

### Stripe Integration
```javascript
// Add to index.html head
<script src="https://js.stripe.com/v3/"></script>

// Replace PaymentProcessor.simulatePayment with:
const stripe = Stripe('pk_test_your_key');
const {paymentMethod} = await stripe.createPaymentMethod({
  type: 'card',
  card: cardElement,
});
```

### PayPal Integration
```javascript
// Add PayPal SDK
<script src="https://www.paypal.com/sdk/js?client-id=your_client_id"></script>
```

## 📊 Analytics Setup

### Google Analytics
```html
<!-- Add to index.html head -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔒 Security Checklist

- [ ] Enable HTTPS (automatic with Netlify/Vercel)
- [ ] Add real payment processing
- [ ] Implement user authentication
- [ ] Add rate limiting
- [ ] Set up monitoring

## 🎨 Customization

### Change Platform Fee
Edit `script.js` line 108:
```javascript
const PLATFORM_FEE_PERCENTAGE = 5; // Change to your desired percentage
```

### Add New Artists
Edit the `artists` array in `script.js` to add your creators.

### Custom Branding
Update colors in `styles.css`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
}
```

## 📞 Need Help?

- **Deployment issues**: Check platform documentation
- **Custom domain**: Contact your domain registrar
- **Payment setup**: Contact Stripe/PayPal support
- **Code changes**: Edit files and redeploy automatically

---

**Your Pledgr site will be live in under 2 minutes!** 🚀 