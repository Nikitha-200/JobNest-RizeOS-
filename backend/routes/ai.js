const express = require('express');
const { body, validationResult } = require('express-validator');
const natural = require('natural');
const nlp = require('compromise');
const OpenAI = require('openai');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI (optional - for enhanced features)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Initialize tokenizer for text analysis
const tokenizer = new natural.WordTokenizer();

// Enhanced skill extraction with better NLP
router.post('/extract-skills', auth, [
  body('text').isString().isLength({ min: 10, max: 5000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text } = req.body;
    
    // Use compromise.js for advanced NLP processing
    const doc = nlp(text);
    
    // Extract potential skills using multiple methods
    const extractedSkills = new Set();
    
    // Method 1: Extract nouns and proper nouns (likely to be skills)
    const nouns = doc.nouns().out('array');
    const properNouns = doc.match('#ProperNoun').out('array');
    
    [...nouns, ...properNouns].forEach(noun => {
      if (noun.length > 2 && noun.length < 20) {
        extractedSkills.add(noun.toLowerCase());
      }
    });
    
    // Method 2: Look for technical terms and programming languages
    const technicalTerms = [
      // Programming Languages
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
      'typescript', 'dart', 'scala', 'r', 'matlab', 'perl', 'haskell', 'clojure', 'elixir',
      
      // Frameworks & Libraries
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
      'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'material-ui', 'ant design',
      'redux', 'vuex', 'mobx', 'graphql', 'apollo', 'prisma', 'sequelize', 'mongoose',
      
      // Databases
      'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'elasticsearch', 'dynamodb',
      'cassandra', 'neo4j', 'firebase', 'supabase', 'planetscale',
      
      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins',
      'git', 'github', 'gitlab', 'bitbucket', 'ci/cd', 'devops', 'microservices',
      
      // AI & ML
      'machine learning', 'ai', 'artificial intelligence', 'deep learning', 'neural networks',
      'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn',
      'opencv', 'nltk', 'spacy', 'transformers', 'bert', 'gpt', 'computer vision',
      
      // Web Technologies
      'html', 'css', 'sass', 'less', 'webpack', 'vite', 'babel', 'eslint', 'prettier',
      'rest', 'api', 'oauth', 'jwt', 'oauth2', 'openid', 'websocket', 'socket.io',
      
      // Mobile & Desktop
      'react native', 'flutter', 'xamarin', 'ionic', 'cordova', 'electron', 'tauri',
      'android', 'ios', 'swift', 'kotlin', 'objective-c',
      
      // Design & UX
      'ui/ux', 'design', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
      'invision', 'framer', 'protopie', 'user research', 'wireframing', 'prototyping',
      
      // Project Management
      'agile', 'scrum', 'kanban', 'jira', 'trello', 'asana', 'notion', 'confluence',
      'waterfall', 'lean', 'six sigma',
      
      // Testing
      'testing', 'qa', 'selenium', 'cypress', 'jest', 'mocha', 'chai', 'pytest',
      'unit testing', 'integration testing', 'e2e testing', 'tdd', 'bdd',
      
      // Blockchain & Web3
      'blockchain', 'web3', 'ethereum', 'solidity', 'smart contracts', 'defi', 'nft',
      'metamask', 'web3.js', 'ethers.js', 'hardhat', 'truffle', 'ipfs',
      
      // Data Science
      'data science', 'data analysis', 'data visualization', 'tableau', 'power bi',
      'sql', 'nosql', 'data mining', 'statistics', 'r', 'sas', 'spss'
    ];
    
    const lowerText = text.toLowerCase();
    technicalTerms.forEach(term => {
      if (lowerText.includes(term)) {
        extractedSkills.add(term);
      }
    });
    
    // Method 3: Use OpenAI for enhanced extraction (if available)
    let enhancedSkills = [];
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Extract technical skills, programming languages, frameworks, and tools from the following text. Return only the skills as a comma-separated list, no explanations. Focus on technical and professional skills."
            },
            {
              role: "user",
              content: text
            }
          ],
          max_tokens: 150,
          temperature: 0.3
        });
        
        const aiResponse = completion.choices[0].message.content;
        enhancedSkills = aiResponse.split(',').map(skill => skill.trim().toLowerCase());
        enhancedSkills.forEach(skill => extractedSkills.add(skill));
      } catch (error) {
        console.log('OpenAI extraction failed, using fallback methods');
      }
    }
    
    // Method 4: Extract skills from phrases like "experience with", "proficient in", etc.
    const skillPatterns = [
      /(?:experience with|proficient in|skilled in|expert in|knowledge of|familiar with)\s+([^,.\n]+)/gi,
      /(?:worked with|used|developed with|built with)\s+([^,.\n]+)/gi
    ];
    
    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const skill = match.replace(/^(?:experience with|proficient in|skilled in|expert in|knowledge of|familiar with|worked with|used|developed with|built with)\s+/i, '').trim();
          if (skill.length > 2 && skill.length < 30) {
            extractedSkills.add(skill.toLowerCase());
          }
        });
      }
    });
    
    // Convert to array and filter out common words
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
    const skills = Array.from(extractedSkills)
      .filter(skill => !commonWords.includes(skill) && skill.length > 2)
      .slice(0, 20); // Limit to top 20 skills
    
    res.json({
      skills,
      confidence: openai ? 'high' : 'medium',
      extractedFrom: text.length,
      totalFound: extractedSkills.size
    });
  } catch (error) {
    console.error('Skill extraction error:', error);
    res.status(500).json({ error: 'Server error extracting skills' });
  }
});

// Enhanced job match score calculation with better NLP
router.post('/match-score', auth, [
  body('jobId').isMongoId(),
  body('userId').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, userId } = req.body;
    const targetUser = userId ? await User.findById(userId) : req.user;
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Enhanced match score calculation using multiple factors
    const scores = {
      skills: 0,
      experience: 0,
      location: 0,
      budget: 0,
      description: 0
    };

    // Skills matching (35% weight) - Enhanced with fuzzy matching
    const userSkills = targetUser.skills || [];
    const jobSkills = job.skills || [];
    
    if (jobSkills.length > 0) {
      let totalSkillScore = 0;
      
      jobSkills.forEach(jobSkill => {
        let bestMatch = 0;
        userSkills.forEach(userSkill => {
          const similarity = calculateSimilarity(jobSkill.toLowerCase(), userSkill.toLowerCase());
          if (similarity > bestMatch) {
            bestMatch = similarity;
          }
        });
        totalSkillScore += bestMatch;
      });
      
      scores.skills = (totalSkillScore / jobSkills.length) * 100;
    }

    // Experience level matching (20% weight)
    if (job.experienceLevel && targetUser.experience) {
      const experienceLevels = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];
      const jobLevel = experienceLevels.indexOf(job.experienceLevel);
      const userLevel = experienceLevels.indexOf(targetUser.experience);
      
      if (userLevel >= jobLevel) {
        scores.experience = 100;
      } else {
        scores.experience = Math.max(0, 100 - (jobLevel - userLevel) * 20);
      }
    }

    // Location matching (15% weight) - Enhanced with fuzzy matching
    if (job.location && targetUser.location) {
      const jobLocation = job.location.toLowerCase();
      const userLocation = targetUser.location.toLowerCase();
      
      if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
        scores.location = 100;
      } else if (jobLocation.includes('remote') || userLocation.includes('remote')) {
        scores.location = 80;
      } else {
        // Calculate location similarity
        const locationSimilarity = calculateSimilarity(jobLocation, userLocation);
        scores.location = locationSimilarity * 100;
      }
    }

    // Budget compatibility (15% weight)
    if (job.budget && job.budget.min && job.budget.max) {
      // This would be more sophisticated in a real app
      scores.budget = 75; // Default score
    }

    // Description matching (15% weight) - New feature
    if (job.description && targetUser.bio) {
      const jobDoc = nlp(job.description);
      const userDoc = nlp(targetUser.bio);
      
      const jobKeywords = jobDoc.nouns().out('array').map(word => word.toLowerCase());
      const userKeywords = userDoc.nouns().out('array').map(word => word.toLowerCase());
      
      const commonKeywords = jobKeywords.filter(keyword => 
        userKeywords.some(userKeyword => 
          calculateSimilarity(keyword, userKeyword) > 0.7
        )
      );
      
      scores.description = jobKeywords.length > 0 
        ? (commonKeywords.length / jobKeywords.length) * 100 
        : 0;
    }

    // Calculate weighted final score
    const finalScore = Math.round(
      (scores.skills * 0.35) +
      (scores.experience * 0.20) +
      (scores.location * 0.15) +
      (scores.budget * 0.15) +
      (scores.description * 0.15)
    );

    // Get matching skills for detailed breakdown
    const matchingSkills = userSkills.filter(userSkill =>
      jobSkills.some(jobSkill => {
        const similarity = calculateSimilarity(userSkill.toLowerCase(), jobSkill.toLowerCase());
        return similarity > 0.7;
      })
    );

    res.json({
      matchScore: finalScore,
      breakdown: scores,
      matchingSkills,
      totalJobSkills: jobSkills.length,
      totalUserSkills: userSkills.length
    });
  } catch (error) {
    console.error('Match score calculation error:', error);
    res.status(500).json({ error: 'Server error calculating match score' });
  }
});

// Helper function to calculate string similarity
function calculateSimilarity(str1, str2) {
  if (str1 === str2) return 1;
  if (str1.includes(str2) || str2.includes(str1)) return 0.9;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1;
  
  const distance = natural.LevenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Enhanced job recommendations with better matching
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { limit = 10, minScore = 30 } = req.query;
    
    // Get user's skills and profile
    const userSkills = req.user.skills || [];
    const userBio = req.user.bio || '';
    
    if (userSkills.length === 0) {
      return res.json({ jobs: [], message: 'Add skills to your profile to get personalized recommendations' });
    }

    // Find jobs that match user's skills with enhanced scoring
    const allJobs = await Job.find({ status: 'Active' })
      .populate('employer', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) * 2); // Get more jobs to filter by score

    // Calculate enhanced match scores for each job
    const jobsWithScores = await Promise.all(
      allJobs.map(async (job) => {
        const jobSkills = job.skills || [];
        
        // Calculate skill match score
        let totalSkillScore = 0;
        if (jobSkills.length > 0) {
          jobSkills.forEach(jobSkill => {
            let bestMatch = 0;
            userSkills.forEach(userSkill => {
              const similarity = calculateSimilarity(jobSkill.toLowerCase(), userSkill.toLowerCase());
              if (similarity > bestMatch) {
                bestMatch = similarity;
              }
            });
            totalSkillScore += bestMatch;
          });
        }
        
        const skillScore = jobSkills.length > 0 
          ? (totalSkillScore / jobSkills.length) * 100 
          : 0;

        // Calculate experience match
        let experienceScore = 0;
        if (job.experienceLevel && req.user.experience) {
          const experienceLevels = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];
          const jobLevel = experienceLevels.indexOf(job.experienceLevel);
          const userLevel = experienceLevels.indexOf(req.user.experience);
          
          if (userLevel >= jobLevel) {
            experienceScore = 100;
          } else {
            experienceScore = Math.max(0, 100 - (jobLevel - userLevel) * 20);
          }
        }

        // Calculate location match
        let locationScore = 0;
        if (job.location && req.user.location) {
          const jobLocation = job.location.toLowerCase();
          const userLocation = req.user.location.toLowerCase();
          
          if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
            locationScore = 100;
          } else if (jobLocation.includes('remote') || userLocation.includes('remote')) {
            locationScore = 80;
          }
        }

        // Calculate description match
        let descriptionScore = 0;
        if (job.description && userBio) {
          const jobDoc = nlp(job.description);
          const userDoc = nlp(userBio);
          
          const jobKeywords = jobDoc.nouns().out('array').map(word => word.toLowerCase());
          const userKeywords = userDoc.nouns().out('array').map(word => word.toLowerCase());
          
          const commonKeywords = jobKeywords.filter(keyword => 
            userKeywords.some(userKeyword => 
              calculateSimilarity(keyword, userKeyword) > 0.7
            )
          );
          
          descriptionScore = jobKeywords.length > 0 
            ? (commonKeywords.length / jobKeywords.length) * 100 
            : 0;
        }

        // Calculate final weighted score
        const finalScore = Math.round(
          (skillScore * 0.4) +
          (experienceScore * 0.25) +
          (locationScore * 0.2) +
          (descriptionScore * 0.15)
        );

        return {
          ...job.summary,
          employer: job.employer,
          matchScore: finalScore,
          skillScore,
          experienceScore,
          locationScore,
          descriptionScore
        };
      })
    );

    // Filter by minimum score and sort by match score
    const filteredJobs = jobsWithScores
      .filter(job => job.matchScore >= parseInt(minScore))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(limit));

    res.json({
      jobs: filteredJobs,
      userSkills,
      totalJobsAnalyzed: allJobs.length,
      jobsReturned: filteredJobs.length
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Server error getting recommendations' });
  }
});

// Enhanced user recommendations for a job
router.get('/job/:jobId/recommendations', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const jobSkills = job.skills || [];
    
    if (jobSkills.length === 0) {
      return res.json({ users: [], message: 'No skills specified for this job' });
    }

    // Find users with matching skills
    const matchingUsers = await User.find({
      skills: { $in: jobSkills },
      _id: { $ne: req.user._id }
    })
    .select('name bio skills location experience profileImage')
    .limit(20);

    // Calculate enhanced match scores
    const usersWithScores = matchingUsers.map(user => {
      const userSkills = user.skills || [];
      
      // Calculate skill match score
      let totalSkillScore = 0;
      jobSkills.forEach(jobSkill => {
        let bestMatch = 0;
        userSkills.forEach(userSkill => {
          const similarity = calculateSimilarity(jobSkill.toLowerCase(), userSkill.toLowerCase());
          if (similarity > bestMatch) {
            bestMatch = similarity;
          }
        });
        totalSkillScore += bestMatch;
      });
      
      const skillScore = jobSkills.length > 0 
        ? (totalSkillScore / jobSkills.length) * 100 
        : 0;

      // Calculate experience match
      let experienceScore = 0;
      if (job.experienceLevel && user.experience) {
        const experienceLevels = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];
        const jobLevel = experienceLevels.indexOf(job.experienceLevel);
        const userLevel = experienceLevels.indexOf(user.experience);
        
        if (userLevel >= jobLevel) {
          experienceScore = 100;
        } else {
          experienceScore = Math.max(0, 100 - (jobLevel - userLevel) * 20);
        }
      }

      // Calculate location match
      let locationScore = 0;
      if (job.location && user.location) {
        const jobLocation = job.location.toLowerCase();
        const userLocation = user.location.toLowerCase();
        
        if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
          locationScore = 100;
        } else if (jobLocation.includes('remote') || userLocation.includes('remote')) {
          locationScore = 80;
        }
      }

      // Calculate description match
      let descriptionScore = 0;
      if (job.description && user.bio) {
        const jobDoc = nlp(job.description);
        const userDoc = nlp(user.bio);
        
        const jobKeywords = jobDoc.nouns().out('array').map(word => word.toLowerCase());
        const userKeywords = userDoc.nouns().out('array').map(word => word.toLowerCase());
        
        const commonKeywords = jobKeywords.filter(keyword => 
          userKeywords.some(userKeyword => 
            calculateSimilarity(keyword, userKeyword) > 0.7
          )
        );
        
        descriptionScore = jobKeywords.length > 0 
          ? (commonKeywords.length / jobKeywords.length) * 100 
          : 0;
      }

      // Calculate final weighted score
      const finalScore = Math.round(
        (skillScore * 0.4) +
        (experienceScore * 0.25) +
        (locationScore * 0.2) +
        (descriptionScore * 0.15)
      );

      const matchingSkills = userSkills.filter(userSkill =>
        jobSkills.some(jobSkill => {
          const similarity = calculateSimilarity(userSkill.toLowerCase(), jobSkill.toLowerCase());
          return similarity > 0.7;
        })
      );

      return {
        ...user.publicProfile,
        matchScore: finalScore,
        skillScore,
        experienceScore,
        locationScore,
        descriptionScore,
        matchingSkills
      };
    });

    // Sort by match score
    usersWithScores.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      users: usersWithScores.slice(0, 10),
      jobSkills,
      totalUsersAnalyzed: matchingUsers.length
    });
  } catch (error) {
    console.error('Get job recommendations error:', error);
    res.status(500).json({ error: 'Server error getting job recommendations' });
  }
});

// Enhanced smart suggestions for job posting
router.post('/job-suggestions', auth, [
  body('title').isString().isLength({ min: 5 }),
  body('description').isString().isLength({ min: 20 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;
    
    // Extract skills from job description using enhanced NLP
    const doc = nlp(description);
    const nouns = doc.nouns().out('array');
    const properNouns = doc.match('#ProperNoun').out('array');
    
    const technicalTerms = [
      // Programming Languages
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
      'typescript', 'dart', 'scala', 'r', 'matlab', 'perl', 'haskell', 'clojure', 'elixir',
      
      // Frameworks & Libraries
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
      'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'material-ui', 'ant design',
      'redux', 'vuex', 'mobx', 'graphql', 'apollo', 'prisma', 'sequelize', 'mongoose',
      
      // Databases
      'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'elasticsearch', 'dynamodb',
      'cassandra', 'neo4j', 'firebase', 'supabase', 'planetscale',
      
      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins',
      'git', 'github', 'gitlab', 'bitbucket', 'ci/cd', 'devops', 'microservices',
      
      // AI & ML
      'machine learning', 'ai', 'artificial intelligence', 'deep learning', 'neural networks',
      'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn',
      'opencv', 'nltk', 'spacy', 'transformers', 'bert', 'gpt', 'computer vision',
      
      // Web Technologies
      'html', 'css', 'sass', 'less', 'webpack', 'vite', 'babel', 'eslint', 'prettier',
      'rest', 'api', 'oauth', 'jwt', 'oauth2', 'openid', 'websocket', 'socket.io',
      
      // Mobile & Desktop
      'react native', 'flutter', 'xamarin', 'ionic', 'cordova', 'electron', 'tauri',
      'android', 'ios', 'swift', 'kotlin', 'objective-c',
      
      // Design & UX
      'ui/ux', 'design', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
      'invision', 'framer', 'protopie', 'user research', 'wireframing', 'prototyping',
      
      // Project Management
      'agile', 'scrum', 'kanban', 'jira', 'trello', 'asana', 'notion', 'confluence',
      'waterfall', 'lean', 'six sigma',
      
      // Testing
      'testing', 'qa', 'selenium', 'cypress', 'jest', 'mocha', 'chai', 'pytest',
      'unit testing', 'integration testing', 'e2e testing', 'tdd', 'bdd',
      
      // Blockchain & Web3
      'blockchain', 'web3', 'ethereum', 'solidity', 'smart contracts', 'defi', 'nft',
      'metamask', 'web3.js', 'ethers.js', 'hardhat', 'truffle', 'ipfs',
      
      // Data Science
      'data science', 'data analysis', 'data visualization', 'tableau', 'power bi',
      'sql', 'nosql', 'data mining', 'statistics', 'r', 'sas', 'spss'
    ];
    
    const lowerText = description.toLowerCase();
    const suggestedSkills = technicalTerms.filter(term => lowerText.includes(term));
    
    // Add extracted nouns as potential skills
    [...nouns, ...properNouns].forEach(noun => {
      if (noun.length > 3 && noun.length < 20 && !suggestedSkills.includes(noun.toLowerCase())) {
        suggestedSkills.push(noun.toLowerCase());
      }
    });

    // Enhanced experience level suggestion based on skills and description
    let suggestedExperience = 'Mid';
    const seniorKeywords = ['senior', 'lead', 'architect', 'principal', 'manager', 'director', 'head of'];
    const entryKeywords = ['junior', 'entry', 'intern', 'graduate', 'fresh', 'new grad'];
    
    const lowerTitle = title.toLowerCase();
    const lowerDesc = description.toLowerCase();
    
    if (seniorKeywords.some(keyword => lowerTitle.includes(keyword) || lowerDesc.includes(keyword))) {
      suggestedExperience = 'Senior';
    } else if (entryKeywords.some(keyword => lowerTitle.includes(keyword) || lowerDesc.includes(keyword))) {
      suggestedExperience = 'Entry';
    }

    // Enhanced job type suggestion
    let suggestedJobType = 'Full-time';
    const jobTypeKeywords = {
      'Part-time': ['part-time', 'part time', 'parttime'],
      'Contract': ['contract', 'freelance', 'consulting'],
      'Freelance': ['freelance', 'contract', 'consulting'],
      'Internship': ['internship', 'intern', 'student']
    };
    
    for (const [jobType, keywords] of Object.entries(jobTypeKeywords)) {
      if (keywords.some(keyword => lowerTitle.includes(keyword) || lowerDesc.includes(keyword))) {
        suggestedJobType = jobType;
        break;
      }
    }

    // Suggest budget range based on experience level and skills
    let suggestedBudget = { min: 50000, max: 80000, currency: 'USD' };
    if (suggestedExperience === 'Senior') {
      suggestedBudget = { min: 80000, max: 150000, currency: 'USD' };
    } else if (suggestedExperience === 'Entry') {
      suggestedBudget = { min: 30000, max: 60000, currency: 'USD' };
    }

    // Use OpenAI for enhanced suggestions if available
    let aiSuggestions = {};
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Analyze this job posting and provide suggestions for: 1) Additional skills that might be relevant, 2) Experience level, 3) Job type, 4) Budget range. Return as JSON with keys: additionalSkills, experienceLevel, jobType, budgetRange."
            },
            {
              role: "user",
              content: `Title: ${title}\nDescription: ${description}`
            }
          ],
          max_tokens: 200,
          temperature: 0.3
        });
        
        try {
          aiSuggestions = JSON.parse(completion.choices[0].message.content);
        } catch (parseError) {
          console.log('Failed to parse AI suggestions');
        }
      } catch (error) {
        console.log('OpenAI suggestions failed, using fallback');
      }
    }

    res.json({
      suggestedSkills: suggestedSkills.slice(0, 15),
      suggestedExperience: aiSuggestions.experienceLevel || suggestedExperience,
      suggestedJobType: aiSuggestions.jobType || suggestedJobType,
      suggestedBudget: aiSuggestions.budgetRange || suggestedBudget,
      additionalSkills: aiSuggestions.additionalSkills || [],
      confidence: openai ? 'high' : 'medium'
    });
  } catch (error) {
    console.error('Job suggestions error:', error);
    res.status(500).json({ error: 'Server error generating job suggestions' });
  }
});

// New endpoint for smart connections based on profile
router.get('/connections', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const userSkills = req.user.skills || [];
    const userBio = req.user.bio || '';
    
    if (userSkills.length === 0) {
      return res.json({ connections: [], message: 'Add skills to your profile to find connections' });
    }

    // Find users with similar skills or backgrounds
    const potentialConnections = await User.find({
      _id: { $ne: req.user._id },
      skills: { $in: userSkills }
    })
    .select('name bio skills location experience profileImage')
    .limit(parseInt(limit) * 2);

    // Calculate connection scores
    const connectionsWithScores = potentialConnections.map(user => {
      const userSkills = user.skills || [];
      
      // Calculate skill similarity
      const commonSkills = userSkills.filter(skill => 
        req.user.skills.some(userSkill => 
          calculateSimilarity(skill.toLowerCase(), userSkill.toLowerCase()) > 0.7
        )
      );
      
      const skillScore = req.user.skills.length > 0 
        ? (commonSkills.length / req.user.skills.length) * 100 
        : 0;

      // Calculate experience similarity
      let experienceScore = 0;
      if (req.user.experience && user.experience) {
        const experienceLevels = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];
        const userLevel = experienceLevels.indexOf(req.user.experience);
        const connectionLevel = experienceLevels.indexOf(user.experience);
        
        // Prefer similar experience levels
        const levelDiff = Math.abs(userLevel - connectionLevel);
        experienceScore = Math.max(0, 100 - (levelDiff * 25));
      }

      // Calculate location similarity
      let locationScore = 0;
      if (req.user.location && user.location) {
        const userLocation = req.user.location.toLowerCase();
        const connectionLocation = user.location.toLowerCase();
        
        if (userLocation.includes(connectionLocation) || connectionLocation.includes(userLocation)) {
          locationScore = 100;
        } else if (userLocation.includes('remote') || connectionLocation.includes('remote')) {
          locationScore = 80;
        }
      }

      // Calculate bio similarity
      let bioScore = 0;
      if (req.user.bio && user.bio) {
        const userDoc = nlp(req.user.bio);
        const connectionDoc = nlp(user.bio);
        
        const userKeywords = userDoc.nouns().out('array').map(word => word.toLowerCase());
        const connectionKeywords = connectionDoc.nouns().out('array').map(word => word.toLowerCase());
        
        const commonKeywords = userKeywords.filter(keyword => 
          connectionKeywords.some(connectionKeyword => 
            calculateSimilarity(keyword, connectionKeyword) > 0.7
          )
        );
        
        bioScore = userKeywords.length > 0 
          ? (commonKeywords.length / userKeywords.length) * 100 
          : 0;
      }

      // Calculate final connection score
      const connectionScore = Math.round(
        (skillScore * 0.4) +
        (experienceScore * 0.25) +
        (locationScore * 0.2) +
        (bioScore * 0.15)
      );

      return {
        ...user.publicProfile,
        connectionScore,
        commonSkills,
        skillScore,
        experienceScore,
        locationScore,
        bioScore
      };
    });

    // Sort by connection score and return top results
    const topConnections = connectionsWithScores
      .sort((a, b) => b.connectionScore - a.connectionScore)
      .slice(0, parseInt(limit));

    res.json({
      connections: topConnections,
      userSkills,
      totalAnalyzed: potentialConnections.length
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Server error getting connections' });
  }
});

module.exports = router; 