import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  User, 
  Briefcase, 
  MapPin, 
  Link as LinkIcon, 
  Plus, 
  X, 
  Wallet, 
  Upload, 
  Check, 
  Sparkles,
  Lightbulb,
  TrendingUp,
  Target,
  BarChart3,
  Zap,
  UserPlus,
  Star
} from 'lucide-react';

const SkillExtractionResult = ({ extractedSkills, onAddSkills, onClose }) => {
  const [selectedSkills, setSelectedSkills] = useState([]);

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleAddSelected = () => {
    if (selectedSkills.length > 0) {
      onAddSkills(selectedSkills);
      onClose();
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Sparkles className="h-5 w-5 text-yellow-600 mr-2" />
          AI Skill Extraction Results
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-3">
          We found {extractedSkills.length} potential skills in your bio. Select the ones you'd like to add to your profile:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {extractedSkills.map((skill, index) => (
            <button
              key={index}
              onClick={() => handleSkillToggle(skill)}
              className={`p-2 rounded-md text-sm font-medium transition-colors ${
                selectedSkills.includes(skill)
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {selectedSkills.length} of {extractedSkills.length} skills selected
        </span>
        <div className="space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSelected}
            disabled={selectedSkills.length === 0}
            className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${
              selectedSkills.length > 0
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Add Selected ({selectedSkills.length})
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileSuggestions = ({ suggestions, onApplySuggestion }) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <Lightbulb className="h-5 w-5 text-green-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">AI Profile Suggestions</h3>
      </div>

      <div className="space-y-3">
        {suggestions.experience && (
          <div className="bg-white p-3 rounded-md border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Experience Level</p>
                <p className="text-xs text-gray-500">Based on your skills and background</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{suggestions.experience}</span>
                <button
                  onClick={() => onApplySuggestion('experience', suggestions.experience)}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {suggestions.location && (
          <div className="bg-white p-3 rounded-md border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-xs text-gray-500">Popular location for your skills</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{suggestions.location}</span>
                <button
                  onClick={() => onApplySuggestion('location', suggestions.location)}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {suggestions.bio && (
          <div className="bg-white p-3 rounded-md border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Bio Enhancement</p>
                <p className="text-xs text-gray-500">Improved professional description</p>
              </div>
              <button
                onClick={() => onApplySuggestion('bio', suggestions.bio)}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ConnectionRecommendations = ({ connections }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <UserPlus className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Recommended Connections</h3>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-6">
          <UserPlus className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">No connection recommendations yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {connections.slice(0, 3).map(connection => (
            <div key={connection._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <User size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{connection.name}</p>
                  <p className="text-xs text-gray-600">{connection.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{connection.connectionScore}% match</span>
                <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [extractingSkills, setExtractingSkills] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    linkedinUrl: user?.linkedinUrl || '',
    skills: user?.skills || [],
    walletAddress: user?.walletAddress || account || ''
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [bioText, setBioText] = useState(user?.bio || '');
  
  // AI features state
  const [extractedSkills, setExtractedSkills] = useState(null);
  const [showSkillExtraction, setShowSkillExtraction] = useState(false);
  const [profileSuggestions, setProfileSuggestions] = useState(null);
  const [connections, setConnections] = useState([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  useEffect(() => {
    if (account && !profileData.walletAddress) {
      setProfileData(prev => ({
        ...prev,
        walletAddress: account
      }));
    }
  }, [account]);

  useEffect(() => {
    // Fetch AI-powered profile suggestions and connections
    const fetchAIData = async () => {
      if (user && user.skills && user.skills.length > 0) {
        try {
          // Fetch connections
          const connectionsResponse = await axios.get('/api/ai/connections?limit=3');
          setConnections(connectionsResponse.data.connections || []);
        } catch (error) {
          console.error('Error fetching AI data:', error);
        }
      }
    };

    fetchAIData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBioChange = (e) => {
    const value = e.target.value;
    setBioText(value);
    setProfileData(prev => ({
      ...prev,
      bio: value
    }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !profileData.skills.includes(currentSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleConnectWallet = async () => {
    const result = await connectWallet();
    if (result.success) {
      setProfileData(prev => ({
        ...prev,
        walletAddress: result.account
      }));
    }
  };

  const extractSkillsFromBio = async () => {
    if (!bioText.trim()) {
      toast.error('Please add some text to your bio first');
      return;
    }

    try {
      setExtractingSkills(true);
      const response = await axios.post('/api/ai/extract-skills', { text: bioText });
      
      if (response.data.skills && response.data.skills.length > 0) {
        setExtractedSkills(response.data.skills);
        setShowSkillExtraction(true);
        
        toast.success(
          <div>
            <p className="font-medium">Skills extracted successfully!</p>
            <p className="text-sm mt-1">Found {response.data.skills.length} potential skills</p>
          </div>,
          { duration: 4000 }
        );
      } else {
        toast.info('No skills found in your bio. Try adding more details about your technical experience.');
      }
    } catch (error) {
      console.error('Error extracting skills:', error);
      toast.error('Failed to extract skills from bio');
    } finally {
      setExtractingSkills(false);
    }
  };

  const handleAddExtractedSkills = (skillsToAdd) => {
    const newSkills = skillsToAdd.filter(skill => !profileData.skills.includes(skill));
    
    if (newSkills.length > 0) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, ...newSkills]
      }));
      
      toast.success(
        <div>
          <p className="font-medium">Skills added successfully!</p>
          <ul className="mt-1 text-sm">
            {newSkills.map((skill, index) => (
              <li key={index} className="flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {skill}
              </li>
            ))}
          </ul>
        </div>,
        { duration: 5000 }
      );
    }
  };

  const generateProfileSuggestions = async () => {
    if (!bioText.trim() && profileData.skills.length === 0) {
      toast.error('Please add some bio text or skills first');
      return;
    }

    try {
      setGeneratingSuggestions(true);
      
      // This would call an AI endpoint to generate profile suggestions
      // For now, we'll simulate some suggestions based on current data
      const suggestions = {
        experience: profileData.skills.length > 5 ? 'Senior' : 'Mid',
        location: 'San Francisco, CA',
        bio: bioText.length < 100 ? `${bioText} Experienced professional with expertise in ${profileData.skills.slice(0, 3).join(', ')}.` : null
      };
      
      setProfileSuggestions(suggestions);
      toast.success('Profile suggestions generated!');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate profile suggestions');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const applySuggestion = (type, value) => {
    switch (type) {
      case 'experience':
        // This would update the experience field if you add it to the form
        toast.success('Experience level updated');
        break;
      case 'location':
        setProfileData(prev => ({ ...prev, location: value }));
        toast.success('Location updated');
        break;
      case 'bio':
        setBioText(value);
        setProfileData(prev => ({ ...prev, bio: value }));
        toast.success('Bio updated');
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (profileData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    try {
      setLoading(true);
      await updateProfile(profileData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center mb-6">
                <div className="bg-primary-100 rounded-full p-4 mr-4">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'Your Profile'}</h2>
                  <p className="text-gray-600">Manage your personal information and preferences</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={profileData.location}
                          onChange={handleChange}
                          placeholder="City, Country"
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bio with AI Enhancement */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Professional Bio *</label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={generateProfileSuggestions}
                        disabled={generatingSuggestions}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        {generatingSuggestions ? (
                          <>
                            <div className="animate-spin h-3 w-3 border-2 border-primary-500 border-t-transparent rounded-full mr-1"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="h-3 w-3 mr-1" />
                            Get Suggestions
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={extractSkillsFromBio}
                        disabled={extractingSkills}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        {extractingSkills ? (
                          <>
                            <div className="animate-spin h-3 w-3 border-2 border-primary-500 border-t-transparent rounded-full mr-1"></div>
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3 mr-1" />
                            Extract Skills
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="bio"
                    name="bio"
                    value={bioText}
                    onChange={handleBioChange}
                    required
                    rows={4}
                    placeholder="Tell us about your professional background, experience, and interests"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  ></textarea>
                </div>

                {/* AI Skill Extraction Results */}
                {showSkillExtraction && extractedSkills && (
                  <SkillExtractionResult
                    extractedSkills={extractedSkills}
                    onAddSkills={handleAddExtractedSkills}
                    onClose={() => setShowSkillExtraction(false)}
                  />
                )}

                {/* AI Profile Suggestions */}
                {profileSuggestions && (
                  <ProfileSuggestions
                    suggestions={profileSuggestions}
                    onApplySuggestion={applySuggestion}
                  />
                )}
                
                {/* LinkedIn URL */}
                <div className="mb-6">
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="linkedinUrl"
                      name="linkedinUrl"
                      value={profileData.linkedinUrl}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                
                {/* Skills */}
                <div className="mb-6">
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">Skills *</label>
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
                  {profileData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileData.skills.map((skill, index) => (
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
                
                {/* Wallet Connection */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Blockchain Wallet</h3>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Wallet className="h-5 w-5 text-gray-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Connected Wallet</p>
                          <p className="text-xs text-gray-500">
                            {profileData.walletAddress ? (
                              <span className="font-mono">{`${profileData.walletAddress.substring(0, 6)}...${profileData.walletAddress.substring(profileData.walletAddress.length - 4)}`}</span>
                            ) : (
                              'No wallet connected'
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={profileData.walletAddress ? disconnectWallet : handleConnectWallet}
                        disabled={isConnecting}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${profileData.walletAddress ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-primary-600 text-white hover:bg-primary-700'} transition-colors`}
                      >
                        {isConnecting ? (
                          <span className="flex items-center">
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                            Connecting...
                          </span>
                        ) : profileData.walletAddress ? (
                          'Disconnect'
                        ) : (
                          'Connect Wallet'
                        )}
                      </button>
                    </div>
                    
                    {profileData.walletAddress && (
                      <div className="mt-2 flex items-center text-xs text-green-600">
                        <Check className="h-4 w-4 mr-1" />
                        Wallet connected successfully
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Connect your wallet to receive payments and post jobs on the platform.
                    </p>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Saving...
                      </span>
                    ) : (
                      'Save Profile'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar with AI Features */}
          <div className="space-y-6">
            {/* Profile Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Skills</span>
                  <span className="font-medium">{profileData.skills.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bio Length</span>
                  <span className="font-medium">{bioText.length} chars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wallet</span>
                  <span className="font-medium">{profileData.walletAddress ? 'Connected' : 'Not Connected'}</span>
                </div>
              </div>
            </div>

            {/* Connection Recommendations */}
            <ConnectionRecommendations connections={connections} />

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                  <Star className="h-4 w-4 mr-2" />
                  View My Jobs
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  <Briefcase className="h-4 w-4 mr-2" />
                  My Applications
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;