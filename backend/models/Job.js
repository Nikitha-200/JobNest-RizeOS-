const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  budget: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'],
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    coverLetter: {
      type: String,
      maxlength: 1000
    },
    proposedRate: {
      type: Number
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['Pending', 'Shortlisted', 'Rejected', 'Hired'],
      default: 'Pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  paymentVerified: {
    type: Boolean,
    default: false
  },
  paymentTransactionHash: {
    type: String
  },
  paymentAmount: {
    type: Number
  },
  views: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({
  title: 'text',
  description: 'text',
  skills: 'text',
  tags: 'text'
});

// Virtual for job summary
jobSchema.virtual('summary').get(function() {
  return {
    _id: this._id,
    title: this.title,
    employer: this.employer,
    location: this.location,
    budget: this.budget,
    jobType: this.jobType,
    experienceLevel: this.experienceLevel,
    skills: this.skills,
    status: this.status,
    createdAt: this.createdAt,
    expiresAt: this.expiresAt,
    applicationsCount: this.applications.length,
    views: this.views
  };
});

// Method to check if job is expired
jobSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to increment views
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

jobSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema); 