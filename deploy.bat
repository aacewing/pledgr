@echo off
echo.
echo ========================================
echo 🚀 Pledgr - Quick Deployment Setup
echo ========================================
echo.

echo 📁 Current directory: %CD%
echo.

echo ✅ Checking files...
if exist "index.html" (
    echo ✅ index.html found
) else (
    echo ❌ index.html missing
    pause
    exit /b 1
)

if exist "styles.css" (
    echo ✅ styles.css found
) else (
    echo ❌ styles.css missing
    pause
    exit /b 1
)

if exist "script.js" (
    echo ✅ script.js found
) else (
    echo ❌ script.js missing
    pause
    exit /b 1
)

echo.
echo 🎯 Ready for deployment!
echo.
echo Choose your deployment option:
echo.
echo 1. Netlify (Recommended - 2 minutes)
echo    - Go to: https://netlify.com
echo    - Click "New site from Git"
echo    - Connect GitHub and deploy
echo.
echo 2. Vercel (Alternative - 2 minutes)
echo    - Go to: https://vercel.com
echo    - Click "New Project"
echo    - Import repository and deploy
echo.
echo 3. GitHub Pages (3 minutes)
echo    - Push to GitHub repository
echo    - Go to Settings > Pages
echo    - Deploy from main branch
echo.
echo 4. Surge.sh (1 minute)
echo    - Run: npm install -g surge
echo    - Run: surge
echo.
echo 📋 Files ready for deployment:
dir /b *.html *.css *.js *.json *.md
echo.
echo 🚀 Your Pledgr site will be live in minutes!
echo.
pause 