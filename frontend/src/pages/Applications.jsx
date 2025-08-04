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
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const ApplicationStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    interviewing: { color: 'bg-blue-100 text-blue-800', icon: Calendar }
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={14} className="mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/jobs/user/applications');
        setApplications(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load your applications. Please try again later.');
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Applications</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-6">You haven't applied to any jobs yet. Start exploring opportunities!</p>
            <Link 
              to="/jobs" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Browse Jobs <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {applications.map((item, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        <Link to={`/jobs/${item.job._id}`} className="hover:text-primary-600 transition-colors">
                          {item.job.title}
                        </Link>
                      </h2>
                      <div className="flex flex-wrap text-sm text-gray-600 gap-4 mb-3">
                        <div className="flex items-center">
                          <Briefcase size={16} className="mr-1" />
                          <span>{item.job.jobType}</span>
                        </div>
                        {item.job.location && (
                          <div className="flex items-center">
                            <MapPin size={16} className="mr-1" />
                            <span>{item.job.location}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <DollarSign size={16} className="mr-1" />
                          <span>
                            {item.job.budget.currency} {item.job.budget.min.toLocaleString()} - {item.job.budget.max.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.job.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {item.job.skills.length > 3 && (
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                            +{item.job.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <ApplicationStatusBadge status={item.application.status} />
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock size={16} className="mr-1" />
                        <span>Applied {formatDate(item.application.appliedAt)}</span>
                      </div>
                      {item.application.matchScore && (
                        <div className="mt-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                          Match Score: {item.application.matchScore}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Applications;