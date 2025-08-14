# 🚀 Complete Free Deployment Guide for Pledgr.art

## 🎯 **Goal: Deploy pledgr.art for FREE (No subscriptions ever!)**

## 📋 **What You'll Get:**
- ✅ **Free hosting forever** (Vercel)
- ✅ **Custom domain** (pledgr.art)
- ✅ **SSL certificate** (HTTPS)
- ✅ **Global CDN** (Fast worldwide)
- ✅ **Automatic deployments** (Updates when you push code)
- ✅ **Unlimited bandwidth** (No traffic limits)

---

## 🔧 **Step 1: Install Node.js (Required)**

### **Download Node.js:**
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (recommended)
3. Run the installer
4. **Restart your computer** after installation

### **Verify Installation:**
Open Command Prompt and type:
```bash
node --version
npm --version
```

You should see version numbers like `v18.17.0` and `9.6.7`

---

## 🚀 **Step 2: Deploy to Vercel (5 minutes)**

### **Option A: One-Click Deploy (Easiest)**
1. **Double-click** `deploy-vercel-free.bat`
2. Follow the prompts
3. Wait 2-3 minutes
4. Your site is live! 🎉

### **Option B: Manual Deploy**
Open Command Prompt in your Pledgr folder:
```bash
cd "C:\Users\A\Pledgr"

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## 🌐 **Step 3: Set Up Custom Domain**

### **After Deployment:**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your account
3. Click on your project
4. Go to **Settings** → **Domains**
5. Add `pledgr.art`

### **DNS Configuration:**
In your domain registrar (where you bought pledgr.art):
```
Type: A
Name: @
Value: 76.76.19.76

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

---

## 💳 **Step 4: Payment Processing (Optional)**

### **Stripe (Free to start):**
1. Sign up at [stripe.com](https://stripe.com)
2. Get your publishable key
3. Update `stripe-integration.js`

### **PayPal (Free to start):**
1. Sign up at [developer.paypal.com](https://developer.paypal.com)
2. Get your client ID
3. Update `paypal-integration.js`

---

## 🔄 **Updating Your Site**

### **Automatic (Recommended):**
- Push changes to GitHub
- Vercel automatically redeploys

### **Manual:**
```bash
vercel --prod
```

---

## 🚨 **Troubleshooting**

### **"Node not found":**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart computer after installation

### **"Build failed":**
- Ensure all files are in the Pledgr folder
- Check Node.js version (16+ recommended)

### **"Domain not working":**
- Wait 24-48 hours for DNS propagation
- Check DNS records are correct

---

## 💰 **Cost Breakdown**

### **Vercel Hosting: $0/month forever**
- ✅ Hosting: FREE
- ✅ Custom domains: FREE  
- ✅ SSL certificates: FREE
- ✅ CDN: FREE
- ✅ Deployments: Unlimited

### **Optional Costs:**
- Domain registration: ~$10-15/year (one-time)
- Payment processing: % of transactions (only when you make money)

---

## 🎉 **You're Done!**

After following these steps:
- 🌐 **pledgr.art** will be live
- 🔒 **HTTPS** secured
- 📱 **Mobile optimized**
- 🚀 **Fast worldwide**
- 💰 **Completely free to host**

**No monthly fees, no subscriptions, no hidden costs!** 🎯

---

## 📞 **Need Help?**

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Node.js Help**: [nodejs.org](https://nodejs.org/)

---

**Remember: This deployment is 100% FREE forever!** 🚀✨


