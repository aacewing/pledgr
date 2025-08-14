@echo off
echo 🔧 Installing Node.js and Deploying Pledgr.art
echo ===============================================
echo.

echo 📋 Checking if Node.js is already installed...
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js is already installed!
    goto :deploy
) else (
    echo ❌ Node.js not found. Let's install it!
)

echo.
echo 🌐 Opening Node.js download page...
echo Please download and install Node.js LTS version
echo.
start https://nodejs.org/

echo.
echo ⏳ After installing Node.js:
echo 1. Close this window
echo 2. Restart your computer
echo 3. Run deploy-vercel-free.bat
echo.
pause
exit

:deploy
echo.
echo 🚀 Node.js found! Now deploying to Vercel...
echo.

echo 📁 Installing Vercel CLI...
npm install -g vercel

echo.
echo 🚀 Starting deployment...
echo.
echo ⚠️  When prompted:
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
echo.
pause


