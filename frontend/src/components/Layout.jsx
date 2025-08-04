import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  Home, 
  Briefcase, 
  User, 
  Plus, 
  LogOut, 
  Wallet,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { account, connectWallet, disconnectWallet, isConnected } = useWeb3();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    ...(isAuthenticated ? [
      { name: 'Dashboard', href: '/dashboard', icon: User },
      { name: 'Post Job', href: '/post-job', icon: Plus },
    ] : [])
  ];

  const isActive = (path) => location.pathname === path;

  // Mock jobs for demo/testing
  const mockJobs = [
    {
      id: 1,
      title: "Frontend Developer",
      description: "Build and maintain modern web applications using React and Tailwind CSS.",
      skills: ["React", "JavaScript", "Tailwind CSS"],
      budget: { min: 1000, max: 2000 },
      jobType: "Full-time",
      experienceLevel: "Mid",
      location: "Remote",
    },
    {
      id: 2,
      title: "Smart Contract Engineer",
      description: "Develop and audit Ethereum smart contracts for DeFi projects.",
      skills: ["Solidity", "Ethereum", "Web3.js"],
      budget: { min: 2000, max: 4000 },
      jobType: "Contract",
      experienceLevel: "Senior",
      location: "Remote",
    },
    {
      id: 3,
      title: "AI/ML Specialist",
      description: "Design and deploy machine learning models for job matching.",
      skills: ["Python", "TensorFlow", "NLP"],
      budget: { min: 1500, max: 3000 },
      jobType: "Freelance",
      experienceLevel: "Lead",
      location: "Hybrid",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">J</span>
                </div>
                <span className="text-xl font-bold text-gradient">JobNest</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Wallet Connection */}
              <button
                onClick={isConnected ? disconnectWallet : connectWallet}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isConnected
                    ? 'bg-success-100 text-success-700 hover:bg-success-200'
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {isConnected 
                    ? `${account?.slice(0, 6)}...${account?.slice(-4)}`
                    : 'Connect Wallet'
                  }
                </span>
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{user?.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-error-600 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary-600 transition-colors duration-200 text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Wallet Connection */}
              <button
                onClick={() => {
                  isConnected ? disconnectWallet() : connectWallet();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full ${
                  isConnected
                    ? 'bg-success-100 text-success-700'
                    : 'bg-primary-100 text-primary-700'
                }`}
              >
                <Wallet className="w-5 h-5" />
                <span>
                  {isConnected 
                    ? `${account?.slice(0, 6)}...${account?.slice(-4)}`
                    : 'Connect Wallet'
                  }
                </span>
              </button>

              {/* Mobile User Actions */}
              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-base font-medium">{user?.name}</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-error-600 transition-colors duration-200 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-base">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 text-base font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 bg-primary-600 text-white rounded-md text-base font-medium hover:bg-primary-700 transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">J</span>
                </div>
                <span className="text-xl font-bold text-gradient">JobNest</span>
              </div>
              <p className="text-gray-600 text-sm">
                A modern job portal with Web3 integration and AI-powered matching. 
                Connect, work, and grow with the future of employment.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/jobs" className="hover:text-primary-600 transition-colors duration-200">Browse Jobs</Link></li>
                <li><Link to="/post-job" className="hover:text-primary-600 transition-colors duration-200">Post a Job</Link></li>
                <li><Link to="/profile" className="hover:text-primary-600 transition-colors duration-200">Profile</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary-600 transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors duration-200">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              © 2024 JobNest. All rights reserved. Built with ❤️ for the future of work.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;