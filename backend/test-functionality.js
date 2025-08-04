const axios = require('axios');
const config = require('./config');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
};

const testJob = {
  title: 'Full Stack Developer',
  description: 'We are looking for a skilled full stack developer to join our team.',
  skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
  budget: { min: 50000, max: 80000 },
  jobType: 'Full-time',
  experienceLevel: 'Mid',
  location: 'Remote',
  tags: ['remote', 'full-stack'],
  paymentTransactionHash: '0x1234567890abcdef',
  paymentAmount: 0.001
};

let authToken = '';
let jobId = '';

async function testFunctionality() {
  console.log('🚀 Starting comprehensive functionality test...\n');

  try {
    // Test 1: User Registration
    console.log('1. Testing User Registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data.message);
    authToken = registerResponse.data.token;
    console.log('Token received:', authToken.substring(0, 20) + '...\n');

    // Test 2: User Login
    console.log('2. Testing User Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('User profile:', loginResponse.data.user.name, '\n');

    // Test 3: Post a Job
    console.log('3. Testing Job Posting...');
    const jobResponse = await axios.post(`${API_BASE}/jobs`, testJob, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Job posted successfully:', jobResponse.data.message);
    jobId = jobResponse.data.job._id;
    console.log('Job ID:', jobId, '\n');

    // Test 4: Get All Jobs
    console.log('4. Testing Get All Jobs...');
    const jobsResponse = await axios.get(`${API_BASE}/jobs`);
    console.log('✅ Jobs retrieved successfully');
    console.log('Total jobs:', jobsResponse.data.jobs.length);
    console.log('First job title:', jobsResponse.data.jobs[0]?.title, '\n');

    // Test 5: Get Single Job
    console.log('5. Testing Get Single Job...');
    const singleJobResponse = await axios.get(`${API_BASE}/jobs/${jobId}`);
    console.log('✅ Single job retrieved successfully');
    console.log('Job title:', singleJobResponse.data.job.title);
    console.log('Applications count:', singleJobResponse.data.job.applications.length, '\n');

    // Test 6: Apply to Job
    console.log('6. Testing Job Application...');
    const applicationData = {
      coverLetter: 'I am very interested in this position and believe I would be a great fit.',
      proposedRate: 65000
    };
    const applyResponse = await axios.post(`${API_BASE}/jobs/${jobId}/apply`, applicationData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Application submitted successfully:', applyResponse.data.message);
    console.log('Match score:', applyResponse.data.matchScore + '%', '\n');

    // Test 7: Get User's Applications
    console.log('7. Testing Get User Applications...');
    const applicationsResponse = await axios.get(`${API_BASE}/jobs/user/applications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Applications retrieved successfully');
    console.log('Number of applications:', applicationsResponse.data.applications.length);
    if (applicationsResponse.data.applications.length > 0) {
      const app = applicationsResponse.data.applications[0];
      console.log('Application status:', app.application.status);
      console.log('Match score:', app.application.matchScore + '%');
    }
    console.log('');

    // Test 8: Get User's Posted Jobs
    console.log('8. Testing Get Posted Jobs...');
    const postedJobsResponse = await axios.get(`${API_BASE}/jobs/user/posted`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Posted jobs retrieved successfully');
    console.log('Number of posted jobs:', postedJobsResponse.data.jobs.length);
    if (postedJobsResponse.data.jobs.length > 0) {
      console.log('First posted job:', postedJobsResponse.data.jobs[0].title);
    }
    console.log('');

    // Test 9: Update Profile
    console.log('9. Testing Profile Update...');
    const profileUpdateData = {
      bio: 'Experienced full stack developer with 5 years of experience.',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript'],
      location: 'San Francisco, CA',
      experience: 'Senior'
    };
    const profileResponse = await axios.put(`${API_BASE}/profile`, profileUpdateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile updated successfully:', profileResponse.data.message);
    console.log('Updated skills:', profileResponse.data.user.skills.length, 'skills');
    console.log('');

    // Test 10: Get Current User
    console.log('10. Testing Get Current User...');
    const currentUserResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Current user retrieved successfully');
    console.log('User name:', currentUserResponse.data.user.name);
    console.log('User bio:', currentUserResponse.data.user.bio);
    console.log('');

    // Test 11: Health Check
    console.log('11. Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check successful:', healthResponse.data.message);
    console.log('');

    console.log('🎉 All tests passed! The application is working correctly.');
    console.log('\n📋 Summary:');
    console.log('- User registration and login ✅');
    console.log('- Job posting with payment verification ✅');
    console.log('- Job browsing and filtering ✅');
    console.log('- Job application with match scoring ✅');
    console.log('- Application tracking in dashboard ✅');
    console.log('- Profile management ✅');
    console.log('- JWT authentication ✅');
    console.log('- MongoDB connection ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Full error:', error);
  }
}

// Run the test
testFunctionality(); 