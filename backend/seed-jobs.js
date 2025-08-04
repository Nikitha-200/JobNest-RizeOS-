const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Job = require('./models/Job');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/job-portal')
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      // Create a test employer if none exists
      let employer = await User.findOne({ email: 'employer@test.com' });
      
      if (!employer) {
        employer = new User({
          name: 'Test Employer',
          email: 'employer@test.com',
          password: await bcrypt.hash('password123', 10),
          role: 'employer',
          bio: 'A test employer account',
          location: 'Remote',
          profileImage: 'https://ui-avatars.com/api/?name=Test+Employer',
          experience: 'Senior'
        });
        try {
          await employer.save();
          console.log('Created test employer:', employer._id);
        } catch (err) {
          if (err.code === 11000) {
            // Handle duplicate key error
            employer = await User.findOne({ email: 'employer@test.com' });
            console.log('Using existing employer:', employer._id);
          } else {
            throw err;
          }
        }
      } else {
        console.log('Using existing employer:', employer._id);
      }

      // Create sample jobs
      const sampleJobs = [
        {
          title: 'Frontend Developer',
          description: 'We need a skilled frontend developer with React experience.',
          employer: employer._id,
          skills: ['React', 'JavaScript', 'CSS'],
          budget: {
            min: 30,
            max: 50,
            currency: 'USD'
          },
          jobType: 'Contract',
          experienceLevel: 'Mid',
          location: 'Remote',
          tags: ['frontend', 'web development'],
          status: 'Active',
          paymentVerified: true
        },
        {
          title: 'Backend Engineer',
          description: 'Looking for a Node.js developer to build RESTful APIs.',
          employer: employer._id,
          skills: ['Node.js', 'Express', 'MongoDB'],
          budget: {
            min: 40,
            max: 60,
            currency: 'USD'
          },
          jobType: 'Full-time',
          experienceLevel: 'Senior',
          location: 'New York, USA',
          tags: ['backend', 'api development'],
          status: 'Active',
          paymentVerified: true
        },
        {
          title: 'Full Stack Developer',
          description: 'Join our team to work on exciting web applications.',
          employer: employer._id,
          skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
          budget: {
            min: 45,
            max: 70,
            currency: 'USD'
          },
          jobType: 'Full-time',
          experienceLevel: 'Mid',
          location: 'Remote',
          tags: ['fullstack', 'web development'],
          status: 'Active',
          paymentVerified: true
        }
      ];

      // Check if jobs already exist
      const existingCount = await Job.countDocuments();
      if (existingCount > 0) {
        console.log(`${existingCount} jobs already exist in the database. Skipping seed.`);
      } else {
        // Insert the jobs
        const result = await Job.insertMany(sampleJobs);
        console.log(`${result.length} sample jobs created successfully!`);
        result.forEach(job => console.log(`- ${job.title} (${job._id})`));
      }
    } catch (err) {
      console.error('Error seeding database:', err);
    } finally {
      mongoose.disconnect();
      console.log('Database connection closed');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));