const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  linkedinUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(v);
      },
      message: 'Please provide a valid LinkedIn URL'
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  walletAddress: {
    type: String,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Please provide a valid Ethereum wallet address'
    }
  },
  profileImage: {
    type: String
  },
  location: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    enum: ['Entry', 'Mid', 'Senior', 'Lead', 'Executive']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  paymentHistory: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    amount: Number,
    transactionHash: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for public profile (without sensitive data)
userSchema.virtual('publicProfile').get(function() {
  return {
    _id: this._id,
    name: this.name,
    bio: this.bio,
    linkedinUrl: this.linkedinUrl,
    skills: this.skills,
    walletAddress: this.walletAddress,
    profileImage: this.profileImage,
    location: this.location,
    experience: this.experience,
    isVerified: this.isVerified,
    createdAt: this.createdAt
  };
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema); 