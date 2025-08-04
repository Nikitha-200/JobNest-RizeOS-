import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Zap, 
  Star, 
  UserPlus, 
  Target,
  BarChart3,
  Sparkles,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Building,
  Calendar,
  Award
} from 'lucide-react';

const MatchAnalysis = ({ matchData }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    if (score >= 40) return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <Sparkles className="h-5 w-5 text-yellow-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">AI Match Analysis</h3>
      </div>

      {/* Overall Match Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Match</span>
          <span className={`text-lg font-bold ${getScoreColor(matchData.matchScore)}`}>
            {matchData.matchScore}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getScoreBgColor(matchData.matchScore)}`}
            style={{ width: `${matchData.matchScore}%` }}
          ></div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-3 rounded-lg ${getScoreBgColor(matchData.breakdown.skills)}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">Skills</span>
            <span className={`text-sm font-bold ${getScoreColor(matchData.breakdown.skills)}`}>
              {matchData.breakdown.skills}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getScoreColor(matchData.breakdown.skills)}`}
              style={{ width: `${matchData.breakdown.skills}%` }}
            ></div>
          </div>
        </div>

        <div className={`p-3 rounded-lg ${getScoreBgColor(matchData.breakdown.experience)}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">Experience</span>
            <span className={`text-sm font-bold ${getScoreColor(matchData.breakdown.experience)}`}>
              {matchData.breakdown.experience}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getScoreColor(matchData.breakdown.experience)}`}
              style={{ width: `${matchData.breakdown.experience}%` }}
            ></div>
          </div>
        </div>

        <div className={`p-3 rounded-lg ${getScoreBgColor(matchData.breakdown.location)}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">Location</span>
            <span className={`text-sm font-bold ${getScoreColor(matchData.breakdown.location)}`}>
              {matchData.breakdown.location}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getScoreColor(matchData.breakdown.location)}`}
              style={{ width: `${matchData.breakdown.location}%` }}
            ></div>
          </div>
        </div>

        <div className={`p-3 rounded-lg ${getScoreBgColor(matchData.breakdown.description)}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">Description</span>
            <span className={`text-sm font-bold ${getScoreColor(matchData.breakdown.description)}`}>
              {matchData.breakdown.description}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getScoreColor(matchData.breakdown.description)}`}
              style={{ width: `${matchData.breakdown.description}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Matching Skills */}
      {matchData.matchingSkills && matchData.matchingSkills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Matching Skills</h4>
          <div className="flex flex-wrap gap-2">
            {matchData.matchingSkills.map((skill, index) => (
              <span key={index} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                <CheckCircle size={12} className="inline mr-1" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-blue-50 p-3 rounded-md">
        <div className="flex items-start">
          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            {matchData.matchScore >= 80 ? (
              <p>Excellent match! This job aligns well with your skills and experience.</p>
            ) : matchData.matchScore >= 60 ? (
              <p>Good match! Consider applying if you're interested in this role.</p>
            ) : matchData.matchScore >= 40 ? (
              <p>Moderate match. You might need to learn some additional skills.</p>
            ) : (
              <p>Low match. Consider focusing on roles that better align with your skills.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CandidateRecommendation = ({ candidate }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
            <Users size={20} className="text-primary-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{candidate.name}</h4>
            <p className="text-sm text-gray-600">{candidate.location || 'Location not specified'}</p>
          </div>
        </div>
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(candidate.matchScore)}`}>
          <Target size={12} className="mr-1" />
          {candidate.matchScore}% Match
        </div>
      </div>

      {candidate.bio && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{candidate.bio}</p>
      )}

      {candidate.matchingSkills && candidate.matchingSkills.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Matching Skills:</p>
          <div className="flex flex-wrap gap-1">
            {candidate.matchingSkills.slice(0, 4).map((skill, index) => (
              <span key={index} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                {skill}
              </span>
            ))}
            {candidate.matchingSkills.length > 4 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{candidate.matchingSkills.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {candidate.experience} • {candidate.skills?.length || 0} skills
        </div>
        <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
          View Profile
        </button>
      </div>
    </div>
  );
};

const JobDetail = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showMatchAnalysis, setShowMatchAnalysis] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch job details
        const jobResponse = await axios.get(`/api/jobs/${jobId}`);
        setJob(jobResponse.data.job);

        // If user is logged in, get match analysis
        if (user) {
          try {
            const matchResponse = await axios.post('/api/ai/match-score', {
              jobId: jobId,
              userId: user._id
            });
            setMatchData(matchResponse.data);
            setShowMatchAnalysis(true);
          } catch (matchError) {
            console.error('Error fetching match data:', matchError);
          }

          // If user is the job poster, get candidate recommendations
          if (user._id === jobResponse.data.job.employer._id) {
            try {
              const candidatesResponse = await axios.get(`/api/ai/job/${jobId}/recommendations`);
              setCandidates(candidatesResponse.data.users || []);
            } catch (candidatesError) {
              console.error('Error fetching candidates:', candidatesError);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, user]);

  const handleApply = async () => {
    if (!user) {
      toast.error('Please log in to apply for this job');
      return;
    }

    try {
      setApplying(true);
      // Add application logic here
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatBudget = (budget) => {
    if (!budget) return 'Not specified';
    const { currency, min, max } = budget;
    const currencySymbol = currency === 'USD' ? '$' : currency;
    const formatValue = (value) => {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
      return value;
    };
    return `${currencySymbol}${formatValue(min)} - ${formatValue(max)}`;
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const jobDate = new Date(date);
    const diffTime = Math.abs(now - jobDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">Job not found</h2>
            <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
            <Link to="/jobs" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
              Browse Jobs
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Job Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center text-gray-600 mb-3">
                    <Building className="h-4 w-4 mr-1" />
                    <span>{job.employer.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>{job.jobType}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      <span>{job.experienceLevel}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{formatBudget(job.budget)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Posted {getRelativeTime(job.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {user && user._id !== job.employer._id && (
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className={`px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors ${applying ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {applying ? (
                      <>
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                        Applying...
                      </>
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                )}
              </div>

              {/* Job Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                <div className="prose max-w-none text-gray-700">
                  {job.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Match Analysis */}
            {showMatchAnalysis && matchData && (
              <MatchAnalysis matchData={matchData} />
            )}

            {/* Candidate Recommendations (for job poster) */}
            {user && user._id === job.employer._id && candidates.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Recommended Candidates</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidates.slice(0, 4).map(candidate => (
                    <CandidateRecommendation key={candidate._id} candidate={candidate} />
                  ))}
                </div>
                {candidates.length > 4 && (
                  <div className="mt-4 text-center">
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      View All {candidates.length} Candidates
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{job.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-medium">{job.applications?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-medium">{getRelativeTime(job.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                    job.status === 'Active' ? 'bg-green-100 text-green-800' :
                    job.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Employer Info */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Employer</h3>
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <Building className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{job.employer.name}</h4>
                  <p className="text-sm text-gray-600">{job.employer.location || 'Location not specified'}</p>
                </div>
              </div>
              {job.employer.isVerified && (
                <div className="flex items-center text-sm text-green-600 mb-3">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verified Employer
                </div>
              )}
              <Link 
                to={`/profile/${job.employer._id}`}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View Employer Profile
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                  <Star className="h-4 w-4 mr-2" />
                  Save Job
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  <Users className="h-4 w-4 mr-2" />
                  Share Job
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobDetail;