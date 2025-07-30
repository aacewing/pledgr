# 🚀 GitHub Setup for Pledgr Deployment

## Quick GitHub Repository Setup

### Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name it `pledgr` or `pledgr-platform`
4. Make it **Public** (for free hosting)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### Step 2: Upload Files
1. **Option A: Drag & Drop (Easiest)**
   - Go to your new repository
   - Drag all Pledgr files into the repository
   - Commit with message "Initial Pledgr platform"

2. **Option B: Git Commands**
   ```bash
   git init
   git add .
   git commit -m "Initial Pledgr platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/pledgr.git
   git push -u origin main
   ```

### Step 3: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub account
4. Select your `pledgr` repository
5. Click "Deploy site"
6. **Your site is live!** 🎉

### Step 4: Custom Domain (Optional)
1. In Netlify dashboard, go to Site Settings
2. Click "Domain management"
3. Add your custom domain (e.g., pledgr.com)
4. Update DNS records as instructed

## 🎯 What You Get

- ✅ **Live website** at `https://your-site-name.netlify.app`
- ✅ **SSL certificate** (automatic)
- ✅ **Custom domain** support
- ✅ **Automatic deployments** when you push code
- ✅ **CDN** for fast global loading

## 📊 Next Steps

1. **Add Analytics**
   - Google Analytics
   - Facebook Pixel
   - Custom tracking

2. **Payment Integration**
   - Stripe for credit cards
   - PayPal for alternative payments
   - Webhook handling

3. **Customization**
   - Update colors and branding
   - Add your own artists
   - Modify platform fee

## 🔧 File Structure
```
pledgr/
├── index.html          # Main application
├── styles.css          # Styling
├── script.js           # Functionality
├── package.json        # Project config
├── README.md          # Documentation
├── deploy.md          # Deployment guide
└── GITHUB_SETUP.md   # This file
```

## 🚀 Deployment Checklist

- [ ] Create GitHub repository
- [ ] Upload all files
- [ ] Deploy to Netlify/Vercel
- [ ] Test the live site
- [ ] Set up custom domain
- [ ] Add analytics
- [ ] Configure payments

---

**Your Pledgr platform will be live in under 5 minutes!** 🚀 