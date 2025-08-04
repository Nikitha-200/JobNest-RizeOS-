const mongoose = require('mongoose');
const Job = require('./models/Job');

mongoose.connect('mongodb://localhost:27017/job-portal')
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      const count = await Job.countDocuments();
      console.log(`Number of jobs in database: ${count}`);
      
      if (count === 0) {
        console.log('No jobs found in database. You may need to seed some data.');
      } else {
        // Try to fetch one job to see if it works
        const job = await Job.findOne().exec();
        console.log('Sample job:', job ? job._id : 'None found');
      }
    } catch (err) {
      console.error('Error querying database:', err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));