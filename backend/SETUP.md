# Setup Guide for MongoDB Atlas and JWT Configuration

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account or sign in
3. Create a new cluster (free tier is fine)
4. Create a database user with read/write permissions
5. Get your connection string

## Step 2: Environment Configuration

Create a `.env` file in the backend directory with these 4 essential variables:

```env
# Essential Variables
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

## Step 3: MongoDB Atlas Connection String Format

Replace the placeholders in your MONGODB_URI:
- `your-username`: Your MongoDB Atlas database username
- `your-password`: Your MongoDB Atlas database password  
- `your-cluster`: Your cluster name (e.g., cluster0.abc123)

Example:
```
mongodb+srv://john:password123@cluster0.abc123.mongodb.net/job-portal?retryWrites=true&w=majority
```

## Step 4: JWT Secret

Generate a secure JWT secret. You can use:
- A random string of at least 32 characters
- An online JWT secret generator
- Or use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Step 5: Test the Connection

Run the backend server:
```bash
cd backend
npm install
npm start
```

You should see: "Connected to MongoDB" in the console.

## Step 6: Test Functionality

1. Start the frontend: `cd frontend && npm run dev`
2. Register a new user
3. Post a job
4. Apply for a job
5. Check if applications appear in dashboard

## Troubleshooting

- If MongoDB connection fails, check your connection string and network access settings in Atlas
- If JWT errors occur, ensure your JWT_SECRET is properly set
- Make sure both frontend and backend are running on the correct ports 