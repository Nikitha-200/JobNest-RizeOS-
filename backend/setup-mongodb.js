const mongoose = require('mongoose');
const config = require('./config');

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB Atlas Connection...\n');
  
  console.log('Current MongoDB URI:', config.MONGODB_URI);
  console.log('JWT Secret configured:', config.JWT_SECRET ? 'Yes' : 'No');
  console.log('Frontend URL:', config.FRONTEND_URL);
  console.log('Port:', config.PORT);
  console.log('');

  try {
    // Test connection with more permissive SSL settings
    try {
      await mongoose.connect(config.MONGODB_URI, {
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
        retryWrites: true,
        w: 'majority'
      });
    } catch (error) {
      console.log('First connection attempt failed, trying without TLS options...');
      await mongoose.connect(config.MONGODB_URI);
    }
    
    console.log('✅ MongoDB Atlas connection successful!');
    console.log('✅ Database is ready for use');
    console.log('');
    
    // Test creating a collection
    const testCollection = mongoose.connection.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Database write test successful');
    
    // Clean up test data
    await testCollection.deleteOne({ test: 'connection' });
    console.log('✅ Database cleanup successful');
    
    console.log('\n🎉 MongoDB Atlas is properly configured and working!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Start the frontend: cd ../frontend && npm run dev');
    console.log('3. Test the application functionality');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your MongoDB Atlas connection string');
    console.log('2. Ensure your IP is whitelisted in Atlas');
    console.log('3. Verify username and password are correct');
    console.log('4. Check if your cluster is running');
    console.log('\n📝 Example connection string:');
    console.log('mongodb+srv://username:password@cluster0.abc123.mongodb.net/job-portal?retryWrites=true&w=majority');
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testMongoDBConnection(); 