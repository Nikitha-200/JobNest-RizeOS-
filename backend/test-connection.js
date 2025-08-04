const mongoose = require('mongoose');
const config = require('./config');

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  console.log('Current MongoDB URI:', config.MONGODB_URI);
  console.log('URI length:', config.MONGODB_URI.length);
  console.log('Contains mongodb+srv:', config.MONGODB_URI.includes('mongodb+srv'));
  console.log('Contains retryWrites:', config.MONGODB_URI.includes('retryWrites'));
  console.log('Contains w=majority:', config.MONGODB_URI.includes('w=majority'));
  console.log('');

  // Test 1: Simple connection
  console.log('Test 1: Simple connection without options...');
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Simple connection successful!');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Simple connection failed:', error.message);
  }

  console.log('');

  // Test 2: Connection with TLS options
  console.log('Test 2: Connection with TLS options...');
  try {
    await mongoose.connect(config.MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });
    console.log('✅ TLS connection successful!');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ TLS connection failed:', error.message);
  }

  console.log('');

  // Test 3: Check if it's a local MongoDB
  if (config.MONGODB_URI.includes('localhost') || config.MONGODB_URI.includes('127.0.0.1')) {
    console.log('Test 3: Local MongoDB detected...');
    try {
      await mongoose.connect(config.MONGODB_URI);
      console.log('✅ Local MongoDB connection successful!');
      await mongoose.disconnect();
    } catch (error) {
      console.log('❌ Local MongoDB connection failed:', error.message);
    }
  }

  console.log('\n📋 Troubleshooting Tips:');
  console.log('1. Make sure your MongoDB Atlas cluster is running');
  console.log('2. Check if your IP is whitelisted in Atlas Network Access');
  console.log('3. Verify username and password in the connection string');
  console.log('4. Ensure the connection string format is correct');
  console.log('5. Try connecting from a different network if possible');
}

testConnection(); 