# Rize-OS Job & Networking Portal

A full-stack job portal application with AI-powered features, Web3 integration, and blockchain payments.

## 🚀 Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd Rize-OS

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Sign up for a free account
   - Create a new cluster (free tier is fine)

2. **Configure Database Access**
   - Go to Database Access
   - Create a new database user with read/write permissions
   - Note down username and password

3. **Configure Network Access**
   - Go to Network Access
   - Add your IP address or use `0.0.0.0/0` for all IPs (development only)

4. **Get Connection String**
   - Go to your cluster
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Essential Variables (Required)
PORT=5000
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/job-portal?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:5173

# Optional Variables (can be added later)
NODE_ENV=development
ETHEREUM_NETWORK=sepolia
INFURA_API_KEY=your-infura-api-key
ADMIN_WALLET=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
OPENAI_API_KEY=your-openai-api-key
PLATFORM_FEE=0.001
MIN_PAYMENT_AMOUNT=0.001
```

**Important:** Replace the placeholders:
- `your-username`: Your MongoDB Atlas database username
- `your-password`: Your MongoDB Atlas database password
- `your-cluster`: Your cluster name (e.g., cluster0.abc123)
- `your-super-secure-jwt-secret-key`: Generate a secure JWT secret

### 4. Test Configuration

```bash
cd backend
node setup-mongodb.js
```

This will test your MongoDB Atlas connection and verify all configuration.

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Test Functionality

Run the comprehensive test suite:

```bash
cd backend
node test-functionality.js
```

This will test all features including:
- User registration and login
- Job posting with payment verification
- Job applications with match scoring
- Dashboard functionality
- Profile management

## 🧪 Manual Testing

1. **Register a new user** at `http://localhost:5173/register`
2. **Post a job** at `http://localhost:5173/post-job`
3. **Browse jobs** at `http://localhost:5173/jobs`
4. **Apply for a job** and check your applications at `http://localhost:5173/applications`
5. **Update your profile** at `http://localhost:5173/profile`

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Verify your connection string format
- Check if your IP is whitelisted in Atlas
- Ensure username/password are correct
- Make sure your cluster is running

### JWT Issues
- Ensure JWT_SECRET is properly set
- Check that the secret is at least 32 characters
- Verify the token is being sent in Authorization header

### Frontend Issues
- Check if backend is running on port 5000
- Verify CORS settings in backend
- Check browser console for errors

## 📁 Project Structure

```
Rize-OS/
├── backend/
│   ├── config.js              # Environment configuration
│   ├── server.js              # Express server
│   ├── routes/                # API routes
│   ├── models/                # MongoDB models
│   ├── middleware/            # Auth middleware
│   ├── setup-mongodb.js      # MongoDB connection test
│   └── test-functionality.js # Comprehensive test suite
├── frontend/
│   ├── src/
│   │   ├── pages/            # React components
│   │   ├── components/       # Reusable components
│   │   └── contexts/         # React contexts
│   └── package.json
└── README.md
```

## 🚀 Features

### ✅ Core Functionality
- User authentication with JWT
- Job posting with blockchain payment verification
- Job browsing and filtering
- Job applications with AI-powered match scoring
- User profiles and skill management
- Application tracking dashboard

### ✅ AI Features
- Skill-based job matching
- Resume skill extraction (placeholder)
- Smart job recommendations

### ✅ Web3 Integration
- MetaMask wallet connection
- Ethereum payment verification
- Blockchain transaction logging

### ✅ Modern UI/UX
- Responsive design with Tailwind CSS
- Real-time notifications
- Clean and intuitive interface

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- Helmet security headers

## 📊 Database Schema

### Users Collection
- Email, password, name, bio
- Skills, location, experience level
- Wallet address for payments
- Payment history

### Jobs Collection
- Title, description, requirements
- Budget range and job type
- Employer reference
- Applications with match scores
- Payment verification status

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Jobs
- `POST /api/jobs` - Create job (requires payment)
- `GET /api/jobs` - Get all jobs with filtering
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs/:id/apply` - Apply to job
- `GET /api/jobs/user/applications` - Get user applications
- `GET /api/jobs/user/posted` - Get posted jobs

### Profile
- `PUT /api/profile` - Update user profile
- `PUT /api/auth/wallet` - Update wallet address

## 🚀 Deployment

### Backend (Render/Heroku)
1. Set environment variables
2. Deploy to your preferred platform
3. Update FRONTEND_URL in production

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy to your preferred platform
3. Update API base URL for production

## 📝 License

This project is part of the RizeOS Core Team Internship assessment.

## 🤝 Contributing

This is an assessment project. For questions or issues, please refer to the project requirements. 