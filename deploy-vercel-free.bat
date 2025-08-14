@echo off
echo 🚀 Deploying Pledgr.art to Vercel (100% FREE!)
echo ================================================
echo.

echo 📋 Prerequisites:
echo - Node.js installed (check with: node --version)
echo - Git repository initialized
echo - Vercel CLI installed
echo.

echo 🔧 Installing Vercel CLI globally...
npm install -g vercel

echo.
echo 📁 Checking current directory...
cd /d "%~dp0"
echo Current directory: %CD%

echo.
echo 🚀 Starting Vercel deployment...
echo.
echo ⚠️  IMPORTANT: When prompted:
echo    1. Choose "Y" to link to existing project (if you have one)
echo    2. Or choose "N" to create new project
echo    3. Choose "Y" to override settings
echo    4. Project name: pledgr-art
echo    5. Directory: . (current directory)
echo    6. Override: Y
echo.

vercel --prod

echo.
echo ✅ Deployment complete!
echo 🌐 Your site will be available at: https://pledgr-art.vercel.app
echo 🔗 Or your custom domain if configured
echo.
echo 💡 To update your site later, just run: vercel --prod
echo.
pause


