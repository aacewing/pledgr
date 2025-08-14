# 🚀 Deploy Pledgr.art to Vercel (100% FREE!)

## ✅ **Why Vercel?**
- **Completely FREE forever** - No subscription, no credit card required
- **Custom domains** - Use pledgr.art
- **Automatic SSL certificates** - HTTPS included
- **Global CDN** - Fast loading worldwide
- **Automatic deployments** - Updates when you push to Git
- **Unlimited bandwidth** - No traffic limits

## 🎯 **Quick Deploy (5 minutes)**

### **Step 1: Install Prerequisites**
```bash
# Check if Node.js is installed
node --version

# If not installed, download from: https://nodejs.org/
```

### **Step 2: Deploy with One Click**
1. **Double-click** `deploy-vercel-free.bat`
2. **Follow the prompts** (choose defaults)
3. **Wait for deployment** (2-3 minutes)
4. **Your site is live!** 🎉

## 🔧 **Manual Deployment Steps**

### **Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to your project
cd "C:\Users\A\Pledgr"

# Deploy
vercel --prod
```

### **Option B: Using Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)
3. Click "New Project"
4. Import your GitHub repository
5. Deploy automatically

## 🌐 **Custom Domain Setup**

### **After Deployment:**
1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Settings" → "Domains"
4. Add `pledgr.art`
5. Update your domain's DNS records

### **DNS Records to Add:**
```
Type: A
Name: @
Value: 76.76.19.76

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 💳 **Payment Processing Setup**

### **Stripe (Free to start)**
1. Sign up at [stripe.com](https://stripe.com)
2. Get your publishable key
3. Update `stripe-integration.js`

### **PayPal (Free to start)**
1. Sign up at [developer.paypal.com](https://developer.paypal.com)
2. Get your client ID
3. Update `paypal-integration.js`

## 🔄 **Updating Your Site**

### **Automatic Updates (Recommended)**
- Push changes to GitHub
- Vercel automatically redeploys

### **Manual Updates**
```bash
vercel --prod
```

## 📱 **Mobile App (Optional)**

### **PWA Features Already Included:**
- ✅ Responsive design
- ✅ Offline functionality
- ✅ Install prompts
- ✅ Touch gestures

## 🎨 **Customization**

### **Change Colors/Theme:**
Edit `styles.css` - look for CSS variables:
```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #8b5cf6;
  --accent-color: #f59e0b;
}
```

### **Add New Artists:**
Edit the `FALLBACK_ARTISTS` array in `script.js`

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Command not found: vercel"**
   - Run: `npm install -g vercel`

2. **"Build failed"**
   - Check Node.js version (use 16+)
   - Ensure all files are present

3. **"Domain not working"**
   - Wait 24-48 hours for DNS propagation
   - Check DNS records are correct

### **Get Help:**
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## 💰 **Cost Breakdown**

### **Vercel (FREE):**
- ✅ Hosting: $0/month
- ✅ Custom domains: $0/month
- ✅ SSL certificates: $0/month
- ✅ CDN: $0/month
- ✅ Deployments: Unlimited

### **Optional Services:**
- Domain registration: ~$10-15/year (Namecheap, GoDaddy)
- Payment processing: % of transactions (Stripe/PayPal)

## 🎉 **You're All Set!**

After deployment, your Pledgr.art will be:
- 🌐 Live at your custom domain
- 🔒 Secure with HTTPS
- 📱 Mobile-optimized
- 🚀 Fast with global CDN
- 💰 Completely free to host

**No monthly fees, no subscriptions, no hidden costs!** 🎯


