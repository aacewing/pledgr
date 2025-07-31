@echo off
echo Deploying Pledgr with PayPal Integration...
echo.

echo 1. Adding files to Git...
git add .

echo 2. Committing changes...
git commit -m "Add PayPal payment integration alongside Stripe for multiple payment options"

echo 3. Pushing to GitHub...
git push origin main

echo.
echo ✅ Deployment complete!
echo.
echo 🚀 Your Pledgr site now has:
echo    • PayPal payment integration
echo    • Stripe payment integration
echo    • Manual payment entry option
echo    • User authentication system
echo    • Pledge management and tracking
echo    • Creator dashboard for artists
echo    • Multiple payment methods for users
echo.
echo 🌐 Visit: https://pledgr.art
echo.
echo 📋 Next Steps:
echo    1. Get your PayPal Client ID from developer.paypal.com
echo    2. Update PAYPAL_CLIENT_ID in paypal-integration.js
echo    3. Test payments with PayPal sandbox
echo    4. Go live with real payments
echo.
pause 