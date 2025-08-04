@echo off
echo 🚀 Setting up RizeOS Job Portal...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy env.example .env
    echo ⚠️  Please edit backend/.env with your configuration values
)

cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
npm install
cd ..

echo ✅ Setup complete!
echo.
echo 🎉 Next steps:
echo 1. Edit backend/.env with your configuration
echo 2. Start MongoDB (local or Atlas)
echo 3. Run 'npm run dev' to start both servers
echo 4. Open http://localhost:5173 in your browser
echo.
echo 📚 For detailed instructions, see README.md
pause 