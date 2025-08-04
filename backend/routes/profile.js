const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:userId', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: user.publicProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update own profile
router.put('/update', auth, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('bio').optional().isLength({ max: 500 }),
  body('linkedinUrl').optional().isURL(),
  body('location').optional().trim(),
  body('experience').optional().isIn(['Entry', 'Mid', 'Senior', 'Lead', 'Executive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, bio, linkedinUrl, location, experience } = req.body;

    // Update fields if provided
    if (name) req.user.name = name;
    if (bio !== undefined) req.user.bio = bio;
    if (linkedinUrl !== undefined) req.user.linkedinUrl = linkedinUrl;
    if (location !== undefined) req.user.location = location;
    if (experience) req.user.experience = experience;

    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      user: req.user.publicProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// Update skills
router.put('/skills', auth, [
  body('skills').isArray({ min: 1 }),
  body('skills.*').isString().trim().isLength({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skills } = req.body;
    
    // Remove duplicates and trim
    const uniqueSkills = [...new Set(skills.map(skill => skill.trim()))];
    
    req.user.skills = uniqueSkills;
    await req.user.save();

    res.json({
      message: 'Skills updated successfully',
      skills: req.user.skills
    });
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({ error: 'Server error updating skills' });
  }
});

// Add single skill
router.post('/skills', auth, [
  body('skill').isString().trim().isLength({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skill } = req.body;
    const trimmedSkill = skill.trim();
    
    if (!req.user.skills.includes(trimmedSkill)) {
      req.user.skills.push(trimmedSkill);
      await req.user.save();
    }

    res.json({
      message: 'Skill added successfully',
      skills: req.user.skills
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ error: 'Server error adding skill' });
  }
});

// Remove skill
router.delete('/skills/:skill', auth, async (req, res) => {
  try {
    const skillToRemove = req.params.skill;
    
    req.user.skills = req.user.skills.filter(skill => skill !== skillToRemove);
    await req.user.save();

    res.json({
      message: 'Skill removed successfully',
      skills: req.user.skills
    });
  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({ error: 'Server error removing skill' });
  }
});

// Upload profile image (placeholder - would need file upload middleware)
router.post('/image', auth, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    req.user.profileImage = imageUrl;
    await req.user.save();

    res.json({
      message: 'Profile image updated successfully',
      profileImage: req.user.profileImage
    });
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ error: 'Server error updating profile image' });
  }
});

// Get users by skills (for recommendations)
router.get('/recommendations/skills', auth, async (req, res) => {
  try {
    const { skills } = req.query;
    
    if (!skills) {
      return res.status(400).json({ error: 'Skills parameter is required' });
    }

    const skillArray = skills.split(',').map(skill => skill.trim());
    
    const users = await User.find({
      skills: { $in: skillArray },
      _id: { $ne: req.user._id }
    })
    .select('name bio skills location experience profileImage')
    .limit(10);

    res.json({
      users: users.map(user => user.publicProfile)
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Server error getting recommendations' });
  }
});

module.exports = router; 