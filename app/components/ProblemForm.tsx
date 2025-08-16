'use client';
import { useState, useEffect } from 'react';
import { MapPin, Send, AlertTriangle, CheckCircle, Clock, Construction, Lightbulb, Trash2, Navigation, Signpost, Wrench } from 'lucide-react';

interface ProblemFormProps {
  user?: any;
  onProblemAdded?: (problem: any) => void;
  initialData?: {
    category?: string;
    severity?: string;
  };
}

interface FormData {
  title: string;
  description: string;
  location: string;
  category: string;
  priority: string;
  contactInfo: string;
}

export default function ProblemForm({ user, onProblemAdded, initialData }: ProblemFormProps) {
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    category: initialData?.category || 'Pothole',
    priority: initialData?.severity || 'Medium',
    contactInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const categories = [
    { 
      value: 'Pothole', 
      icon: <Construction className="h-6 w-6 text-orange-600" />,
      color: 'border-orange-500 bg-orange-50 text-orange-800',
      description: 'Road damage'
    },
    { 
      value: 'Street Light', 
      icon: <Lightbulb className="h-6 w-6 text-yellow-600" />,
      color: 'border-yellow-500 bg-yellow-50 text-yellow-800',
      description: 'Lighting issues'
    },
    { 
      value: 'Waste Management', 
      icon: <Trash2 className="h-6 w-6 text-green-600" />,
      color: 'border-green-500 bg-green-50 text-green-800',
      description: 'Garbage/recycling'
    },
    { 
      value: 'Traffic Signal', 
      icon: <Navigation className="h-6 w-6 text-red-600" />,
      color: 'border-red-500 bg-red-50 text-red-800',
      description: 'Signal problems'
    },
    { 
      value: 'Road Sign', 
      icon: <Signpost className="h-6 w-6 text-blue-600" />,
      color: 'border-blue-500 bg-blue-50 text-blue-800',
      description: 'Signage issues'
    },
    { 
      value: 'Other', 
      icon: <Wrench className="h-6 w-6 text-gray-600" />,
      color: 'border-gray-500 bg-gray-50 text-gray-800',
      description: 'Other problems'
    }
  ];

  const priorities = [
    { 
      value: 'Low', 
      color: 'border-green-500 bg-green-50 text-green-800', 
      description: 'Can wait for regular maintenance',
      badgeColor: 'bg-green-100 text-green-800',
      dotColor: 'bg-green-500'
    },
    { 
      value: 'Medium', 
      color: 'border-yellow-500 bg-yellow-50 text-yellow-800', 
      description: 'Should be addressed soon',
      badgeColor: 'bg-yellow-100 text-yellow-800',
      dotColor: 'bg-yellow-500'
    },
    { 
      value: 'High', 
      color: 'border-red-500 bg-red-50 text-red-800', 
      description: 'Urgent - safety concern',
      badgeColor: 'bg-red-100 text-red-800',
      dotColor: 'bg-red-500'
    }
  ];

  // Get user's current location
  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLocationLoading(false);
          },
          (error) => {
            console.log('Location access denied:', error);
            setLocationLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      }
    };

    getCurrentLocation();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create report data
      const reportData = {
        id: `RPT-${Date.now()}`,
        title: form.title,
        description: form.description,
        category: form.category,
        location: userLocation 
          ? `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}` 
          : form.location,
        priority: form.priority as 'Low' | 'Medium' | 'High',
        status: 'Reported' as const,
        date: new Date().toISOString(),
        reporter: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous User',
        votes: 0,
        userId: user?.id || 'anonymous'
      };

      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Problem report submitted:', reportData);
      
      setSubmitStatus('success');
      
      // Call the callback to add problem to list
      if (onProblemAdded) {
        onProblemAdded(reportData);
      }
      
      // Reset form after successful submission
      setTimeout(() => {
        setForm({
          title: '',
          description: '',
          location: '',
          category: 'Pothole',
          priority: 'Medium',
          contactInfo: ''
        });
        setSubmitStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('❌ Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = form.title.trim() && form.description.trim() && (form.location.trim() || userLocation);

  const getLocationDisplayText = () => {
    if (locationLoading) return "Getting your location...";
    if (userLocation) return "Using current location";
    return "Enter street address or landmark";
  };

  return (
    <div className="dashboard bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Send className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Report City Problem</h3>
          <p className="text-sm text-gray-600">Help make your city better by reporting issues</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Problem Title */}
        <div>
          <label className="form-label">
            Problem Title *
          </label>
          <input 
            type="text"
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            className="form-input"
            placeholder="Brief description of the problem"
            required
            maxLength={100}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Be specific and clear about the issue
            </p>
            <p className="text-xs text-gray-400">
              {form.title.length}/100
            </p>
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="form-label">
            Problem Category
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  console.log('Category selected:', cat.value);
                  setForm({...form, category: cat.value});
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md relative transform hover:scale-105 ${
                  form.category === cat.value
                    ? `${cat.color} shadow-lg scale-105 ring-2 ring-blue-300`
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {cat.icon}
                  <div>
                    <div className={`font-semibold text-sm ${
                      form.category === cat.value ? 'text-current' : 'text-gray-800'
                    }`}>
                      {cat.value}
                    </div>
                    <div className={`text-xs ${
                      form.category === cat.value ? 'text-current opacity-75' : 'text-gray-500'
                    }`}>
                      {cat.description}
                    </div>
                  </div>
                </div>
                
                {/* Selected indicator */}
                {form.category === cat.value && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Level */}
        <div>
          <label className="form-label">
            Priority Level
          </label>
          <div className="space-y-3">
            {priorities.map((priority) => (
              <button
                key={priority.value}
                type="button"
                onClick={() => {
                  console.log('Priority selected:', priority.value);
                  setForm({...form, priority: priority.value});
                }}
                className={`w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  form.priority === priority.value
                    ? `${priority.color} shadow-lg ring-2 ring-blue-300`
                    : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      {/* Visual radio indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        form.priority === priority.value 
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {form.priority === priority.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className={`w-3 h-3 rounded-full ${priority.dotColor}`}></div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        form.priority === priority.value 
                          ? priority.badgeColor
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {priority.value}
                      </span>
                    </div>
                    <span className={`font-semibold ${
                      form.priority === priority.value 
                        ? 'text-current'
                        : 'text-gray-700'
                    }`}>
                      {priority.value} Priority
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 hidden md:block">
                    {priority.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="form-label">
            Location {!userLocation && !locationLoading && '*'}
          </label>
          <div className="relative">
            <MapPin className={`absolute left-3 top-3 h-5 w-5 ${
              locationLoading ? 'text-blue-500 animate-pulse' : 
              userLocation ? 'text-green-500' : 'text-gray-400'
            }`} />
            <input 
              type="text"
              value={form.location}
              onChange={(e) => setForm({...form, location: e.target.value})}
              className="form-input pl-11"
              placeholder={getLocationDisplayText()}
              required={!userLocation && !locationLoading}
              disabled={locationLoading}
            />
          </div>
          
          {userLocation && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Current location detected automatically</span>
              </p>
              <p className="text-xs text-green-600 mt-1">
                Coordinates: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            </div>
          )}
          
          {locationLoading && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Getting your location...</span>
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="form-label">
            Detailed Description *
          </label>
          <textarea 
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            className="form-textarea"
            placeholder="Provide detailed information about the problem, its impact, and any safety concerns. Include specific details like size, location markers, or time of occurrence."
            required
            maxLength={500}
            rows={4}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Include as much detail as possible to help city workers
            </p>
            <p className="text-xs text-gray-400">
              {form.description.length}/500
            </p>
          </div>
        </div>

        {/* Contact Info (Optional) */}
        <div>
          <label className="form-label">
            Contact Information (Optional)
          </label>
          <input 
            type="text"
            value={form.contactInfo}
            onChange={(e) => setForm({...form, contactInfo: e.target.value})}
            className="form-input"
            placeholder="Phone number or email for status updates (optional)"
          />
          <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
            <span>🔒</span>
            <span>We'll only use this to update you on the problem's status</span>
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <button 
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg ${
              isFormValid && !isSubmitting
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting Report...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <Send className="h-5 w-5" />
                <span>Submit Problem Report</span>
              </div>
            )}
          </button>
          
          {!isFormValid && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Please fill in all required fields to submit your report
            </p>
          )}
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-green-900 text-lg mb-2">
                  Report Submitted Successfully!
                </h4>
                <p className="text-green-800 mb-3">
                  Your problem report has been sent to the appropriate city department. 
                  You'll receive updates as the issue is addressed.
                </p>
                <div className="bg-green-100 rounded-lg p-3">
                  <p className="text-sm text-green-700 flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Expected response time: 2-5 business days</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-900 text-lg mb-2">
                  Submission Failed
                </h4>
                <p className="text-red-800 mb-3">
                  There was an error submitting your report. Please check your internet connection and try again.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitStatus('idle')}
                  className="text-sm text-red-700 hover:text-red-800 font-semibold underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
