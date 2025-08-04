require('dotenv').config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-this-in-production',
  
  // Frontend URL (for CORS)
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Ethereum Configuration (Optional)
  ETHEREUM_NETWORK: process.env.ETHEREUM_NETWORK || 'sepolia',
  INFURA_API_KEY: process.env.INFURA_API_KEY || 'your-infura-api-key',
  ADMIN_WALLET: process.env.ADMIN_WALLET || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  
  // OpenAI Configuration (Optional)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your-openai-api-key',
  
  // Payment Configuration
  PLATFORM_FEE: process.env.PLATFORM_FEE || 0.001,
  MIN_PAYMENT_AMOUNT: process.env.MIN_PAYMENT_AMOUNT || 0.001
}; 