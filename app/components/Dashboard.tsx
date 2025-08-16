'use client';
import { useState, useEffect } from 'react';
import PhotoUpload from './PhotoUpload';
import ProblemForm from './ProblemForm';
import ProblemList from './ProblemList';
import { Camera, List, BarChart3, Users, FileText, Trophy, Target, Clock } from 'lucide-react';

interface DashboardProps {
  user: any;
}

interface Stats {
  totalProblems: number;
  fixedProblems: number;
  activeUsers: number;
  userPoints: number;
}

interface Problem {
  id: string;
  title: string;
  category: string;
  location: string;
  status: 'Reported' | 'In Progress' | 'Fixed' | 'Rejected';
  date: string;
  reporter: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  votes: number;
  responseTime?: string;
  userId?: string;
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('report');
  const [stats, setStats] = useState<Stats>({
    totalProblems: 127,
    fixedProblems: 89,
    activeUsers: 342,
    userPoints: 156
  });
  const [problems, setProblems] = useState<Problem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const tabs = [
    { id: 'report', label: 'Report Problem', icon: FileText },
    { id: 'view', label: 'View Problems', icon: List },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
  ];

  // Function to handle when a new problem is added
  const handleProblemAdded = (newProblem: Problem) => {
    // Add to problems list
    setProblems(prev => [newProblem, ...prev]);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalProblems: prev.totalProblems + 1,
      userPoints: prev.userPoints + 10
    }));
    
    // Refresh trigger for ProblemList
    setRefreshTrigger(prev => prev + 1);
    
    // Switch to view problems tab to see the new problem
    setTimeout(() => {
      setActiveTab('view');
    }, 1500);
  };

  // Function to update problems from ProblemList
  const handleProblemsUpdate = (updatedProblems: Problem[]) => {
    setProblems(updatedProblems);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Problems Reported</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProblems}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Problems Fixed</p>
              <p className="text-3xl font-bold text-green-600">{stats.fixedProblems}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-purple-600">{stats.activeUsers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Your Points</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.userPoints}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'report' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PhotoUpload />
          <ProblemForm user={user} onProblemAdded={handleProblemAdded} />
        </div>
      )}
      
      {activeTab === 'view' && (
        <ProblemList 
          refreshTrigger={refreshTrigger}
          problems={problems}
          onProblemsUpdate={handleProblemsUpdate}
        />
      )}
      
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">City Statistics</h3>
                <p className="text-gray-600">Comprehensive problem reporting analytics</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-900">Most Common Problem</span>
                  <span className="text-blue-700 font-bold text-lg">Potholes (34%)</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-900">Average Response Time</span>
                  <span className="text-green-700 font-bold text-lg">3.2 days</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-purple-900">This Month's Reports</span>
                  <span className="text-purple-700 font-bold text-lg">+23% increase</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-yellow-900">Your Contribution</span>
                  <span className="text-yellow-700 font-bold text-lg">{stats.userPoints} points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
