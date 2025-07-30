# 🎨 Pledgr - Support Artists, Fuel Creativity

A modern platform for creators to receive support from their audience, similar to Patreon and Fanbox.

## 🚀 Quick Launch Options

### Option 1: Deploy to Netlify (Recommended - 2 minutes)
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub/GitLab account
4. Select this repository
5. Deploy! Your site will be live at `https://your-site-name.netlify.app`

### Option 2: Deploy to Vercel (2 minutes)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import this repository
4. Deploy! Your site will be live at `https://your-project.vercel.app`

### Option 3: Deploy to GitHub Pages (3 minutes)
1. Push this code to a GitHub repository
2. Go to Settings > Pages
3. Select "Deploy from a branch"
4. Choose `main` branch
5. Your site will be live at `https://yourusername.github.io/repository-name`

### Option 4: Deploy to Surge.sh (1 minute)
```bash
npm install -g surge
surge
```
Follow the prompts and your site will be live!

## 🎯 Features

- **Pledge Levels**: Multiple subscription tiers for creators
- **Payment Processing**: Credit card integration with fee calculation
- **Creator Dashboard**: Manage pledge levels and track earnings
- **5% Platform Fee**: Transparent fee structure
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Live statistics and supporter counts

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start local server
npm start

# Or use live-server for auto-reload
npm run dev
```

## 📁 Project Structure

```
pledgr/
├── index.html          # Main application
├── styles.css          # Styling and responsive design
├── script.js           # Application logic and features
├── package.json        # Project configuration
└── README.md          # This file
```

## 🎨 Customization

### Adding New Artists
Edit the `artists` array in `script.js`:

```javascript
{
    id: 7,
    name: "Your Artist Name",
    category: "music", // music, visual, writing, film
    title: "Project Title",
    description: "Project description...",
    image: "image-url",
    profileImage: "profile-image-url",
    pledged: 0,
    goal: 5000,
    supporters: 0,
    daysLeft: 30,
    pledgeLevels: [
        {
            id: 1,
            name: "Supporter",
            amount: 5,
            description: "Basic support level",
            benefits: ["Benefit 1", "Benefit 2"],
            supporters: 0
        }
    ]
}
```

### Changing Platform Fee
Edit the `PLATFORM_FEE_PERCENTAGE` constant in `script.js`:

```javascript
const PLATFORM_FEE_PERCENTAGE = 5; // Change to your desired percentage
```

## 🌐 Deployment Checklist

- [ ] Choose deployment platform (Netlify/Vercel recommended)
- [ ] Connect repository
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate (automatic with most platforms)
- [ ] Test payment flow
- [ ] Add real payment processing (Stripe/PayPal)

## 💳 Payment Integration

Currently using simulated payments. For production:

1. **Stripe Integration**:
   ```javascript
   // Replace PaymentProcessor.simulatePayment with Stripe API calls
   const stripe = Stripe('your-publishable-key');
   ```

2. **PayPal Integration**:
   ```javascript
   // Add PayPal SDK and replace payment processing
   ```

## 📈 Analytics

Add Google Analytics or similar:

```html
<!-- Add to index.html head section -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## 🔒 Security Considerations

- Implement proper authentication
- Add CSRF protection
- Use HTTPS in production
- Validate all user inputs
- Implement rate limiting

## 📞 Support

For deployment help or questions:
- Create an issue in the repository
- Contact the development team
- Check platform documentation

---

**Pledgr** - Empowering creators, one pledge at a time. 🚀 