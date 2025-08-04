const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Create a new job (requires payment verification)
router.post('/', auth, [
  body('title').trim().isLength({ min: 5, max: 100 }),
  body('description').trim().isLength({ min: 20, max: 2000 }),
  body('skills').isArray({ min: 1 }),
  body('budget.min').isNumeric(),
  body('budget.max').isNumeric(),
  body('jobType').isIn(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']),
  body('experienceLevel').isIn(['Entry', 'Mid', 'Senior', 'Lead', 'Executive']),
  body('location').optional().trim(),
  body('tags').optional().isArray(),
  body('paymentTransactionHash').notEmpty(),
  body('paymentAmount').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      skills,
      budget,
      jobType,
      experienceLevel,
      location,
      tags,
      paymentTransactionHash,
      paymentAmount
    } = req.body;

    // Verify payment (in a real app, you'd verify on-chain)
    if (paymentAmount < 0.001) { // Minimum fee in ETH
      return res.status(400).json({ error: 'Insufficient payment amount' });
    }

    // Create job
    const job = new Job({
      title,
      description,
      employer: req.user._id,
      skills,
      budget,
      jobType,
      experienceLevel,
      location,
      tags: tags || [],
      paymentVerified: true,
      paymentTransactionHash,
      paymentAmount
    });

    await job.save();

    // Update user's payment history
    req.user.paymentHistory.push({
      jobId: job._id,
      amount: paymentAmount,
      transactionHash: paymentTransactionHash
    });
    await req.user.save();

    res.status(201).json({
      message: 'Job posted successfully',
      job: job.summary
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Server error creating job' });
  }
});

// Get all jobs with filtering
router.get('/', optionalAuth, [
  query('search').optional().trim(),
  query('skills').optional(),
  query('location').optional().trim(),
  query('jobType').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']),
  query('experienceLevel').optional().isIn(['Entry', 'Mid', 'Senior', 'Lead', 'Executive']),
  query('minBudget').optional().isNumeric(),
  query('maxBudget').optional().isNumeric(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      search,
      skills,
      location,
      jobType,
      experienceLevel,
      minBudget,
      maxBudget,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = { status: 'Active' };

    if (search) {
      filter.$text = { $search: search };
    }

    if (skills) {
      const skillArray = skills.split(',').map(skill => skill.trim());
      filter.skills = { $in: skillArray };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      filter.jobType = jobType;
    }

    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    if (minBudget || maxBudget) {
      filter['budget.min'] = {};
      if (minBudget) filter['budget.min'].$gte = parseFloat(minBudget);
      if (maxBudget) filter['budget.max'].$lte = parseFloat(maxBudget);
    }

    // Execute query
    const skip = (page - 1) * limit;
    
    const jobs = await Job.find(filter)
      .populate('employer', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      jobs: jobs.map(job => ({
        ...job.summary,
        employer: job.employer
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Server error getting jobs' });
  }
});

// Get single job
router.get('/:jobId', optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate('employer', 'name bio profileImage location experience')
      .populate('applications.applicant', 'name bio profileImage');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment views
    await job.incrementViews();

    res.json({
      job: {
        ...job.toJSON(),
        employer: job.employer
      }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Server error getting job' });
  }
});

// Apply to job
router.post('/:jobId/apply', auth, [
  body('coverLetter').optional().isLength({ max: 1000 }),
  body('proposedRate').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already applied
    const alreadyApplied = job.applications.some(
      app => app.applicant.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ error: 'Already applied to this job' });
    }

    // Check if job is active
    if (job.status !== 'Active') {
      return res.status(400).json({ error: 'Job is not accepting applications' });
    }

    const { coverLetter, proposedRate } = req.body;

    // Calculate match score (simplified - would use AI in real app)
    const userSkills = req.user.skills || [];
    const jobSkills = job.skills || [];
    const matchingSkills = userSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
    
    const matchScore = Math.round((matchingSkills.length / jobSkills.length) * 100);

    // Add application
    job.applications.push({
      applicant: req.user._id,
      coverLetter,
      proposedRate,
      matchScore
    });

    await job.save();

    res.json({
      message: 'Application submitted successfully',
      matchScore
    });
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ error: 'Server error applying to job' });
  }
});

// Get user's posted jobs
router.get('/user/posted', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      jobs: jobs.map(job => job.summary)
    });
  } catch (error) {
    console.error('Get posted jobs error:', error);
    res.status(500).json({ error: 'Server error getting posted jobs' });
  }
});

// Get user's applications
router.get('/user/applications', auth, async (req, res) => {
  try {
    const jobs = await Job.find({
      'applications.applicant': req.user._id
    })
    .populate('employer', 'name profileImage')
    .sort({ createdAt: -1 });

    const applications = jobs.map(job => {
      const application = job.applications.find(
        app => app.applicant.toString() === req.user._id.toString()
      );
      
      return {
        job: job.summary,
        application: {
          coverLetter: application.coverLetter,
          proposedRate: application.proposedRate,
          matchScore: application.matchScore,
          status: application.status,
          appliedAt: application.appliedAt
        }
      };
    });

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Server error getting applications' });
  }
});

// Update application status (employer only)
router.put('/:jobId/applications/:applicationId', auth, [
  body('status').isIn(['Pending', 'Shortlisted', 'Rejected', 'Hired'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user is the employer
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }

    const { status } = req.body;
    const application = job.applications.id(req.params.applicationId);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.status = status;
    await job.save();

    res.json({
      message: 'Application status updated successfully',
      status
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Server error updating application status' });
  }
});

module.exports = router; 