'use client';
import { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, AlertCircle, Users, Filter, Search, RefreshCw, ThumbsUp, Construction, Lightbulb, Trash2, Navigation, Signpost, Wrench } from 'lucide-react';

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

interface ProblemListProps {
  refreshTrigger?: number;
  problems?: Problem[];
  onProblemsUpdate?: (problems: Problem[]) => void;
}

export default function ProblemList({ refreshTrigger = 0, problems: externalProblems = [], onProblemsUpdate }: ProblemListProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [votedProblems, setVotedProblems] = useState<Set<string>>(new Set());

  // Mock data - In real app, this would come from Supabase
  const fetchProblems = async () => {
    const mockProblems: Problem[] = [
      {
        id: 'RPT-001',
        title: 'Large pothole on Main Street',
        category: 'Pothole',
        location: '123 Main St, Downtown',
        status: 'In Progress',
        date: '2025-01-15T10:30:00Z',
        reporter: 'John D.',
        description: 'Deep pothole causing damage to vehicles. Located near the traffic light intersection.',
        priority: 'High',
        votes: 23,
        responseTime: '2 days'
      },
      {
        id: 'RPT-002',
        title: 'Broken street light',
        category: 'Street Light',
        location: '456 Oak Ave, Residential',
        status: 'Reported',
        date: '2025-01-14T08:15:00Z',
        reporter: 'Sarah M.',
        description: 'Street light has been flickering for weeks and now completely dark, making area unsafe.',
        priority: 'Medium',
        votes: 8
      },
      {
        id: 'RPT-003',
        title: 'Overflowing trash bins',
        category: 'Waste Management',
        location: 'Central Park Entrance',
        status: 'Fixed',
        date: '2025-01-12T14:20:00Z',
        reporter: 'Mike R.',
        description: 'Multiple trash bins overflowing for days, attracting pests and creating unsanitary conditions.',
        priority: 'Medium',
        votes: 15,
        responseTime: '1 day'
      },
      {
        id: 'RPT-004',
        title: 'Damaged stop sign',
        category: 'Road Sign',
        location: '789 Pine St & 2nd Ave',
        status: 'In Progress',
        date: '2025-01-13T11:45:00Z',
        reporter: 'Lisa K.',
        description: 'Stop sign is bent and partially obscured by tree branches, creating safety hazard.',
        priority: 'High',
        votes: 31,
        responseTime: '3 days'
      },
      {
        id: 'RPT-005',
        title: 'Malfunctioning traffic signal',
        category: 'Traffic Signal',
        location: 'Intersection of 1st & Broadway',
        status: 'Fixed',
        date: '2025-01-10T16:00:00Z',
        reporter: 'David L.',
        description: 'Traffic light stuck on red for northbound traffic, causing major delays.',
        priority: 'High',
        votes: 42,
        responseTime: '4 hours'
      }
    ];

    return mockProblems;
  };

  // Load problems
  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoading(true);
        const mockData = await fetchProblems();
        const combinedProblems = [...externalProblems, ...mockData];
        setProblems(combinedProblems);
        setFilteredProblems(combinedProblems);
        if (onProblemsUpdate) {
          onProblemsUpdate(combinedProblems);
        }
      } catch (error) {
        console.error('Failed to load problems:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
  }, [refreshTrigger]);

  // Update when external problems change
  useEffect(() => {
    if (externalProblems.length > 0) {
      const loadProblems = async () => {
        const mockData = await fetchProblems();
        const combinedProblems = [...externalProblems, ...mockData];
        setProblems(combinedProblems);
        setFilteredProblems(combinedProblems);
      };
      loadProblems();
    }
  }, [externalProblems]);

  // Refresh problems
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const mockData = await fetchProblems();
      const combinedProblems = [...externalProblems, ...mockData];
      setProblems(combinedProblems);
      setFilteredProblems(combinedProblems);
      if (onProblemsUpdate) {
        onProblemsUpdate(combinedProblems);
      }
    } catch (error) {
      console.error('Failed to refresh problems:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter problems based on search and filters
  useEffect(() => {
    let filtered = problems;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(problem =>
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.reporter.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(problem => problem.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(problem => problem.category === categoryFilter);
    }

    setFilteredProblems(filtered);
  }, [problems, searchTerm, statusFilter, categoryFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reported': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Fixed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Using Lucide icons instead of emojis
    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'Pothole': return <Construction className="h-5 w-5 text-orange-600" />;
        case 'Street Light': return <Lightbulb className="h-5 w-5 text-yellow-600" />;
        case 'Waste Management': return <Trash2 className="h-5 w-5 text-green-600" />;
        case 'Traffic Signal': return <Navigation className="h-5 w-5 text-red-600" />;
        case 'Road Sign': return <Signpost className="h-5 w-5 text-blue-600" />;
        default: return <Wrench className="h-5 w-5 text-gray-600" />;
      }
    };

  const handleVote = async (problemId: string) => {
    // Check if already voted
    if (votedProblems.has(problemId)) {
      return;
    }

    // Optimistic update
    setProblems(prevProblems =>
      prevProblems.map(problem =>
        problem.id === problemId
          ? { ...problem, votes: problem.votes + 1 }
          : problem
      )
    );

    // Track voted problems
    setVotedProblems(prev => {
      const newSet = new Set<string>();
      prev.forEach(p => newSet.add(p));
      newSet.add(problemId);
      return newSet;
    });

    try {
      console.log(`Voted for problem ${problemId}`);
    } catch (error) {
      console.error('Failed to vote:', error);
      // Revert optimistic update
      setProblems(prevProblems =>
        prevProblems.map(problem =>
          problem.id === problemId
            ? { ...problem, votes: problem.votes - 1 }
            : problem
        )
      );
      setVotedProblems(prev => {
        const newSet = new Set<string>();
        prev.forEach(p => newSet.add(p));
        newSet.delete(problemId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="dashboard bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-600 font-medium">Loading community problems...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Community Problems</h3>
              <p className="text-sm text-gray-600">Track and support city issue reports</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
              {filteredProblems.length} of {problems.length} problems
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Refresh problems"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search problems, locations, reporters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-11"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
            <select
              aria-label="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select pl-11"
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Fixed">Fixed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <select
            aria-label="Category Filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
          >
            <option value="All">All Categories</option>
            <option value="Pothole">Potholes</option>
            <option value="Street Light">Street Lights</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Traffic Signal">Traffic Signals</option>
            <option value="Road Sign">Road Signs</option>
            <option value="Other">Other Issues</option>
          </select>
        </div>
      </div>

      {/* Problems List */}
      <div className="space-y-4">
        {filteredProblems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <AlertCircle className="h-16 w-16 mx-auto" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">No Problems Found</h4>
            <p className="text-gray-600 text-lg">
              {searchTerm || statusFilter !== 'All' || categoryFilter !== 'All'
                ? 'Try adjusting your search criteria or filters'
                : 'No problems have been reported yet. Be the first to report an issue!'
              }
            </p>
          </div>
        ) : (
          filteredProblems.map((problem) => (
            <div key={problem.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getCategoryIcon(problem.category)}
                    <h4 className="font-bold text-gray-900 text-lg">{problem.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(problem.priority)}`}>
                      {problem.priority} Priority
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{problem.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(problem.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Reported by {problem.reporter}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">{problem.description}</p>
                </div>

                <div className="ml-6 flex flex-col items-end space-y-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(problem.status)}`}>
                    {problem.status}
                  </span>
                  
                  {problem.status === 'Fixed' && problem.responseTime && (
                    <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Fixed in {problem.responseTime}
                    </div>
                  )}

                  {problem.status === 'In Progress' && problem.responseTime && (
                    <div className="text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Response in {problem.responseTime}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVote(problem.id)}
                    disabled={votedProblems.has(problem.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      votedProblems.has(problem.id)
                        ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${votedProblems.has(problem.id) ? 'fill-current' : ''}`} />
                    <span className="font-bold text-lg">{problem.votes}</span>
                    <span>{votedProblems.has(problem.id) ? 'Supported' : 'Support'}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                    problem.category === 'Pothole' ? 'bg-orange-100 text-orange-700' : 
                    problem.category === 'Street Light' ? 'bg-yellow-100 text-yellow-700' :
                    problem.category === 'Waste Management' ? 'bg-green-100 text-green-700' :
                    problem.category === 'Traffic Signal' ? 'bg-red-100 text-red-700' :
                    problem.category === 'Road Sign' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {problem.category}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
                    {problem.id}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
