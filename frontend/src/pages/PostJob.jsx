import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import { useWeb3 } from '../contexts/Web3Context';
import { Plus, X, DollarSign, AlertCircle, CheckCircle, Wallet, Upload, Check, Zap, Lightbulb, Sparkles } from 'lucide-react';

const PostJob = () => {
  const navigate = useNavigate();
  const { account, connectWallet, sendPayment, getPaymentRequirements } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentTxHash, setPaymentTxHash] = useState('');
  const [paymentRequirements, setPaymentRequirements] = useState({
    amount: 0.001,
    currency: 'ETH',
    adminWallet: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: [],
    location: '',
    budget: {
      min: '',
      max: '',
      currency: 'USD'
    },
    jobType: 'Full-time',
    experienceLevel: 'Mid',
    tags: []
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  
  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Generate AI suggestions based on job description
  const generateSuggestions = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please add a job title and description first');
      return;
    }

    try {
      setGeneratingSuggestions(true);
      const response = await axios.post('/api/ai/job-suggestions', {
        title: formData.title,
        description: formData.description
      });

      setAiSuggestions(response.data);
      setShowSuggestions(true);
      toast.success('AI suggestions generated successfully!');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate AI suggestions');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  // Apply AI suggestions
  const applySuggestion = (type, value) => {
    switch (type) {
      case 'skills':
        const newSkills = value.filter(skill => !formData.skills.includes(skill));
        if (newSkills.length > 0) {
          setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, ...newSkills]
          }));
          toast.success(`Added ${newSkills.length} suggested skills`);
        }
        break;
      case 'experience':
        setFormData(prev => ({ ...prev, experienceLevel: value }));
        toast.success('Applied suggested experience level');
        break;
      case 'jobType':
        setFormData(prev => ({ ...prev, jobType: value }));
        toast.success('Applied suggested job type');
        break;
      case 'budget':
        setFormData(prev => ({
          ...prev,
          budget: { ...prev.budget, ...value }
        }));
        toast.success('Applied suggested budget range');
        break;
    }
  };

  // Fetch payment requirements on component mount
  useEffect(() => {
    const fetchPaymentRequirements = async () => {
      try {
        const requirements = await getPaymentRequirements('postJob');
        if (requirements) {
          setPaymentRequirements(requirements);
        }
      } catch (error) {
        console.error('Error fetching payment requirements:', error);
        toast.error('Failed to fetch payment requirements');
      }
    };

    fetchPaymentRequirements();
  }, [getPaymentRequirements]);

  // Handle blockchain payment
  const handlePayment = async () => {
    if (!account) {
      try {
        await connectWallet();
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast.error('Please connect your wallet to continue');
        return;
      }
    }

    try {
      setPaymentLoading(true);
      
      // Send payment to admin wallet
      const paymentResult = await sendPayment({
        to: paymentRequirements.adminWallet,
        amount: paymentRequirements.amount,
        currency: paymentRequirements.currency
      });
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }
      
      // Verify payment on backend
      const verificationResponse = await axios.post('/api/payments/verify', {
        txHash: paymentResult.transactionHash,
        amount: paymentRequirements.amount,
        currency: paymentRequirements.currency,
        type: 'postJob',
        blockNumber: paymentResult.blockNumber
      });
      
      if (verificationResponse.data.verified) {
        setPaymentSuccess(true);
        setPaymentTxHash(paymentResult.transactionHash);
        toast.success(
          <div>
            <p className="font-medium">Payment successful!</p>
            <p className="text-sm mt-1">Your job posting will be live after submission.</p>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error('Payment verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    if (!paymentSuccess) {
      toast.error('Please complete the payment before posting the job');
      return;
    }

    try {
      setLoading(true);
      
      const jobData = {
        ...formData,
        budget: {
          ...formData.budget,
          min: parseFloat(formData.budget.min),
          max: parseFloat(formData.budget.max)
        },
        paymentTransactionHash: paymentTxHash,
        paymentAmount: paymentRequirements.amount,
        paymentCurrency: paymentRequirements.currency
      };
      
      const response = await axios.post('/api/jobs', jobData);
      
      toast.success('Job posted successfully!');
      navigate(`/jobs/${response.data.job._id}`);
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error(error.response?.data?.error || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Post a Job</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* Job Title */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                minLength={5}
                maxLength={100}
                placeholder="e.g. Senior React Developer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* Job Description */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description *</label>
                <button
                  type="button"
                  onClick={generateSuggestions}
                  disabled={generatingSuggestions || !formData.title.trim() || !formData.description.trim()}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center disabled:opacity-50"
                >
                  {generatingSuggestions ? (
                    <>
                      <div className="animate-spin h-3 w-3 border-2 border-primary-500 border-t-transparent rounded-full mr-1"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Get AI Suggestions
                    </>
                  )}
                </button>
              </div>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                minLength={20}
                maxLength={2000}
                rows={6}
                placeholder="Describe the job responsibilities, requirements, and company information"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
            </div>

            {/* AI Suggestions Panel */}
            {aiSuggestions && showSuggestions && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
                    AI Suggestions
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Suggested Skills */}
                  {aiSuggestions.suggestedSkills && aiSuggestions.suggestedSkills.length > 0 && (
                    <div className="bg-white p-3 rounded-md border">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Skills</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {aiSuggestions.suggestedSkills.slice(0, 6).map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => applySuggestion('skills', aiSuggestions.suggestedSkills)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Add All Skills
                      </button>
                    </div>
                  )}

                  {/* Suggested Experience Level */}
                  {aiSuggestions.suggestedExperience && (
                    <div className="bg-white p-3 rounded-md border">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Experience Level</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{aiSuggestions.suggestedExperience}</span>
                        <button
                          type="button"
                          onClick={() => applySuggestion('experience', aiSuggestions.suggestedExperience)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Suggested Job Type */}
                  {aiSuggestions.suggestedJobType && (
                    <div className="bg-white p-3 rounded-md border">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Job Type</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{aiSuggestions.suggestedJobType}</span>
                        <button
                          type="button"
                          onClick={() => applySuggestion('jobType', aiSuggestions.suggestedJobType)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Suggested Budget */}
                  {aiSuggestions.suggestedBudget && (
                    <div className="bg-white p-3 rounded-md border">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Budget Range</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          ${aiSuggestions.suggestedBudget.min.toLocaleString()} - ${aiSuggestions.suggestedBudget.max.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => applySuggestion('budget', aiSuggestions.suggestedBudget)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {aiSuggestions.confidence && (
                  <p className="text-xs text-gray-500 mt-3">
                    Confidence: {aiSuggestions.confidence} • Based on AI analysis of your job description
                  </p>
                )}
              </div>
            )}
            
            {/* Skills */}
            <div className="mb-6">
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">Skills Required *</label>
              <div className="flex">
                <input
                  type="text"
                  id="skills"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="e.g. React, JavaScript, Node.js"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full flex items-center">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Job Type and Experience Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">Experience Level *</label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Lead">Lead / Manager</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>
            
            {/* Location */}
            <div className="mb-6">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Remote, New York, NY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* Budget */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    id="budget.min"
                    name="budget.min"
                    value={formData.budget.min}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="Min"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-500" />
                  </div>
                  <input
                    type="number"
                    id="budget.max"
                    name="budget.max"
                    value={formData.budget.max}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="Max"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <select
                  id="budget.currency"
                  name="budget.currency"
                  value={formData.budget.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
            
            {/* Tags */}
            <div className="mb-8">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (Optional)</label>
              <div className="flex">
                <input
                  type="text"
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="e.g. Remote, Startup, AI"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full flex items-center">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Payment Section */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Required</h3>
              
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    Posting a job requires a one-time payment of <strong>{paymentRequirements.amount} {paymentRequirements.currency}</strong> to prevent spam and ensure quality listings.
                  </p>
                </div>
              </div>
              
              {!account && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Wallet size={18} />
                    Connect Wallet
                  </button>
                </div>
              )}
              
              {account && !paymentSuccess && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Connected Wallet:</span>
                    <span className="text-sm font-medium">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors ${paymentLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {paymentLoading ? (
                      <>
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        Pay {paymentRequirements.amount} {paymentRequirements.currency}
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {paymentSuccess && (
                <div className="bg-green-50 p-4 rounded-md mb-4">
                  <div className="flex items-start">
                    <CheckCircle size={20} className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Payment Successful!</p>
                      <p className="text-xs text-green-700 mt-1">Transaction: {paymentTxHash.substring(0, 10)}...{paymentTxHash.substring(paymentTxHash.length - 6)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !paymentSuccess}
                className={`px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors ${(loading || !paymentSuccess) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                    Processing...
                  </>
                ) : (
                  'Post Job'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default PostJob;