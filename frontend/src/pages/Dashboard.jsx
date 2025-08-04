import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  TrendingUp, 
  Zap, 
  Star, 
  UserPlus, 
  Target,
  BarChart3,
  Sparkles,
  Lightbulb
} from 'lucide-react';

const JobRecommendationCard = ({ job, onApply }) => {
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

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            <Link to={`/jobs/${job._id}`} className="hover:text-primary-600 transition-colors">
              {job.title}
            </Link>
          </h3>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin size={14} className="mr-1" />
            <span>{job.location || 'Remote'}</span>
            <span className="mx-2">•</span>
            <DollarSign size={14} className="mr-1" />
            <span>{formatBudget(job.budget)}</span>
          </div>
        </div>
        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(job.matchScore)}`}>
          <Zap size={14} className="mr-1" />
          {job.matchScore}% Match
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

      {/* Match Breakdown */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
          <BarChart3 size={12} className="mr-1" />
          Match Breakdown
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Skills:</span>
            <span className="font-medium">{job.skillScore || 0}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Experience:</span>
            <span className="font-medium">{job.experienceScore || 0}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{job.locationScore || 0}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Description:</span>
            <span className="font-medium">{job.descriptionScore || 0}%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 4).map((skill, index) => (
          <span key={index} className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            +{job.skills.length - 4} more
          </span>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          <Clock size={12} className="inline mr-1" />
          Posted {getRelativeTime(job.createdAt)}
        </div>
        <Link 
          to={`/jobs/${job._id}`}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

const ConnectionCard = ({ connection }) => {
  const getConnectionColor = (score) => {
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
            <h4 className="font-medium text-gray-800">{connection.name}</h4>
            <p className="text-sm text-gray-600">{connection.location || 'Location not specified'}</p>
          </div>
        </div>
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConnectionColor(connection.connectionScore)}`}>
          <UserPlus size={12} className="mr-1" />
          {connection.connectionScore}% Match
        </div>
      </div>

      {connection.bio && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{connection.bio}</p>
      )}

      {connection.commonSkills && connection.commonSkills.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Common Skills:</p>
          <div className="flex flex-wrap gap-1">
            {connection.commonSkills.slice(0, 3).map((skill, index) => (
              <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                {skill}
              </span>
            ))}
            {connection.commonSkills.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{connection.commonSkills.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {connection.experience} • {connection.skills?.length || 0} skills
        </div>
        <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
          Connect
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    appliedJobs: 0,
    matchRate: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch AI-powered job recommendations
        const recommendationsResponse = await axios.get('/api/ai/recommendations?limit=6&minScore=30');
        setRecommendations(recommendationsResponse.data.jobs || []);

        // Fetch smart connections
        const connectionsResponse = await axios.get('/api/ai/connections?limit=4');
        setConnections(connectionsResponse.data.connections || []);

        // Fetch basic stats (you might want to create a stats endpoint)
        setStats({
          totalJobs: recommendationsResponse.data.totalJobsAnalyzed || 0,
          appliedJobs: 0, // This would come from applications data
          matchRate: recommendationsResponse.data.jobs.length > 0 
            ? Math.round(recommendationsResponse.data.jobs.reduce((acc, job) => acc + job.matchScore, 0) / recommendationsResponse.data.jobs.length)
            : 0
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-gray-600">
            Here are your personalized job recommendations and connections powered by AI.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Jobs Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Match Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.matchRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.appliedJobs}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Recommendations */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Sparkles className="h-5 w-5 text-yellow-600 mr-2" />
                AI-Powered Job Recommendations
              </h2>
              <Link 
                to="/jobs" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All Jobs →
              </Link>
            </div>

            {recommendations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
                <p className="text-gray-600 mb-4">
                  {user?.skills?.length === 0 
                    ? "Add skills to your profile to get personalized job recommendations."
                    : "We're analyzing jobs to find the best matches for you."
                  }
                </p>
                {user?.skills?.length === 0 && (
                  <Link 
                    to="/profile" 
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Update Profile
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map(job => (
                  <JobRecommendationCard key={job._id} job={job} />
                ))}
              </div>
            )}
          </div>

          {/* Smart Connections */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <UserPlus className="h-5 w-5 text-blue-600 mr-2" />
                Smart Connections
              </h2>
            </div>

            {connections.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">No connections yet</h3>
                <p className="text-xs text-gray-600">
                  {user?.skills?.length === 0 
                    ? "Add skills to find people with similar backgrounds."
                    : "We're finding people with similar skills and interests."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {connections.map(connection => (
                  <ConnectionCard key={connection._id} connection={connection} />
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 space-y-3">
              <Link 
                to="/post-job"
                className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Post a Job
              </Link>
              
              <Link 
                to="/profile"
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Star className="h-4 w-4 mr-2" />
                Update Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;