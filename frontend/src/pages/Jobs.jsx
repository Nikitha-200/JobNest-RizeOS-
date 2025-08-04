import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import { Briefcase, MapPin, DollarSign, Clock, Search, Filter, Zap, Star, X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const JobCard = ({ job, matchScore }) => {
  // Format date as relative time
  const getRelativeTime = (date) => {
    const now = new Date();
    const jobDate = new Date(date);
    const diffTime = Math.abs(now - jobDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  };

  // Format salary/budget
  const formatBudget = (budget) => {
    if (!budget) return 'Not specified';
    
    const { currency, min, max } = budget;
    const currencySymbol = currency === 'USD' ? '$' : currency;
    
    const formatValue = (value) => {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}k`;
      }
      return value;
    };
    
    return `${currencySymbol}${formatValue(min)} - ${formatValue(max)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-100 hover:shadow-lg transition-all hover:border-primary-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-semibold text-gray-800">
              <Link to={`/jobs/${job._id}`} className="hover:text-primary-600 transition-colors">
                {job.title}
              </Link>
            </h2>
            {matchScore && (
              <div className="flex items-center bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm font-medium">
                <Zap size={14} className="mr-1" />
                {matchScore}% Match
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap text-sm text-gray-600 gap-4 mb-3">
            <div className="flex items-center">
              <Briefcase size={16} className="mr-1 text-gray-500" />
              <span>{job.jobType}</span>
            </div>
            {job.location && (
              <div className="flex items-center">
                <MapPin size={16} className="mr-1 text-gray-500" />
                <span>{job.location}</span>
              </div>
            )}
            <div className="flex items-center">
              <DollarSign size={16} className="mr-1 text-gray-500" />
              <span>{formatBudget(job.budget)}</span>
            </div>
          </div>
          
          <p className="text-gray-600 line-clamp-2 mb-4">{job.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full hover:bg-primary-50 hover:text-primary-700 transition-colors">
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <Clock size={16} className="mr-1" />
          <span>Posted {getRelativeTime(job.createdAt)}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.navigator.clipboard.writeText(window.location.origin + `/jobs/${job._id}`)} 
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Copy job link"
          >
            <Star size={18} />
          </button>
          <Link 
            to={`/jobs/${job._id}`} 
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
    jobType: '',
    experienceLevel: '',
    search: '',
    minSalary: '',
    location: '',
    remote: false,
    skills: []
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        // Build query parameters, excluding empty values
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value && (typeof value !== 'object' || value.length > 0)) {
            if (key === 'skills' && Array.isArray(value) && value.length > 0) {
              params[key] = value.join(',');
            } else {
              params[key] = value;
            }
          }
        });
        
        const response = await axios.get('/api/jobs', { params });
        
        // If user is logged in, try to get match scores for jobs
        if (user && user.skills && user.skills.length > 0) {
          try {
            const matchResponse = await axios.post('/api/ai/job-matches', {
              jobIds: response.data.jobs.map(job => job._id),
              userSkills: user.skills
            });
            
            // Merge match scores with job data
            if (matchResponse.data && matchResponse.data.matches) {
              const jobsWithScores = response.data.jobs.map(job => {
                const match = matchResponse.data.matches.find(m => m.jobId === job._id);
                return {
                  ...job,
                  matchScore: match ? match.score : null
                };
              });
              setJobs(jobsWithScores);
            } else {
              setJobs(response.data.jobs);
            }
          } catch (matchError) {
            console.error('Error fetching job matches:', matchError);
            setJobs(response.data.jobs);
          }
        } else {
          setJobs(response.data.jobs);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again later.');
        setLoading(false);
      }
    };

    fetchJobs();
    
    // Update active filters for display
    const newActiveFilters = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'search' && key !== 'skills') {
        if (key === 'remote' && value === true) {
          newActiveFilters.push({ key, label: 'Remote Only', value: 'Yes' });
        } else if (value) {
          const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          newActiveFilters.push({ key, label, value });
        }
      }
    });
    
    if (filters.skills && filters.skills.length > 0) {
      filters.skills.forEach(skill => {
        newActiveFilters.push({ key: `skill-${skill}`, label: 'Skill', value: skill });
      });
    }
    
    setActiveFilters(newActiveFilters);
  }, [filters, user]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The useEffect will trigger the API call
  };
  
  const handleAddSkill = (skill) => {
    if (skill && !filters.skills.includes(skill)) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };
  
  const handleRemoveSkill = (skill) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };
  
  const handleRemoveFilter = (key) => {
    if (key.startsWith('skill-')) {
      const skill = key.replace('skill-', '');
      handleRemoveSkill(skill);
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: key === 'remote' ? false : ''
      }));
    }
  };
  
  const clearAllFilters = () => {
    setFilters({
      jobType: '',
      experienceLevel: '',
      search: filters.search, // Keep the search term
      minSalary: '',
      location: '',
      remote: false,
      skills: []
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
          <Link 
            to="/post-job" 
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus size={18} className="mr-1" /> Post a Job
          </Link>
        </div>
        
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by title, skills, or keywords"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center px-4 py-2 border ${showFilterPanel ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-300 text-gray-700'} rounded-md hover:bg-gray-50 transition-colors`}
            >
              <Filter size={18} className="mr-2" />
              Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
            </button>
          </form>
        </div>
        
        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Active Filters:</h3>
              <button 
                onClick={clearAllFilters}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <div 
                  key={filter.key} 
                  className="flex items-center bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                >
                  <span className="font-medium mr-1">{filter.label}:</span> {filter.value}
                  <button
                    onClick={() => handleRemoveFilter(filter.key)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Advanced Filters Panel */}
        {showFilterPanel && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  id="jobType"
                  name="jobType"
                  value={filters.jobType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={filters.experienceLevel}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Levels</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Lead">Lead / Manager</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary</label>
                <select
                  id="minSalary"
                  name="minSalary"
                  value={filters.minSalary}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Any Salary</option>
                  <option value="30000">$30,000+</option>
                  <option value="50000">$50,000+</option>
                  <option value="70000">$70,000+</option>
                  <option value="100000">$100,000+</option>
                  <option value="150000">$150,000+</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="City, State, or Country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remote"
                  name="remote"
                  checked={filters.remote}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remote" className="ml-2 block text-sm text-gray-700">Remote Only</label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <div className="flex">
                  <input
                    type="text"
                    id="skillInput"
                    placeholder="Add a skill"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('skillInput');
                      handleAddSkill(input.value);
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {filters.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.skills.map((skill, index) => (
                      <div key={index} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full flex items-center">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Job Count */}
        {!loading && !error && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
            </p>
            {user && user.skills && user.skills.length > 0 && (
              <div className="text-sm text-gray-600">
                <span className="text-primary-600 font-medium">Pro tip:</span> Jobs are matched to your skills profile
              </div>
            )}
          </div>
        )}
        
        {/* Job Listings */}
        <div>
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-10 text-center">
              <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search filters or check back later for new opportunities.</p>
              <Link to="/post-job" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                Post a Job
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => (
                <JobCard 
                  key={job._id} 
                  job={job} 
                  matchScore={job.matchScore}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Jobs;