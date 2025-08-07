@echo off
echo ========================================
echo Pledgr Backend Setup
echo ========================================

echo.
echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo After installation, run this script again.
    echo.
    pause
    exit /b 1
)

echo Node.js found! Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo Creating .env file...
echo PORT=3000 > .env
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production >> .env

echo.
echo Starting the server...
echo The application will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause 