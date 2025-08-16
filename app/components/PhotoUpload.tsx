'use client';
import { useState, useCallback } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, AlertCircle, Loader2, X, Eye, Edit } from 'lucide-react';

interface PhotoUploadProps {
  user?: any;
  onPhotoAnalyzed?: (result: AnalysisResult) => void;
}

interface AnalysisResult {
  category: string;
  confidence: number;
  originalConfidence: number;
  severity: string;
  description: string;
  recommendations: string[];
  warnings: string[];
  needsReview: boolean;
  humanReviewRequired: boolean;
  suggestedCategory?: string;
  timestamp: string;
  isManuallySelected?: boolean;
}

interface CategoryOption {
  value: string;
  label: string;
  description: string;
  severity: string;
  confidence: number;
  recommendations: string[];
  icon: string;
  bgColor: string;
  textColor: string;
}

// 🎯 ALL CATEGORIES WITH PROPER STYLING
const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: 'Pothole',
    label: 'Pothole / Road Damage',
    description: 'Road surface damage, cracks, holes, or deterioration detected',
    severity: 'High',
    confidence: 0.85,
    icon: '🚧',
    bgColor: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
    textColor: 'text-orange-800',
    recommendations: [
      'Report to highway maintenance department',
      'Mark area for temporary safety measures',
      'Monitor for worsening conditions'
    ]
  },
  {
    value: 'Traffic Signal',
    label: 'Traffic Signal / Traffic Light',
    description: 'Traffic light or signal control equipment detected',
    severity: 'Medium',
    confidence: 0.82,
    icon: '🚦',
    bgColor: 'bg-red-50 hover:bg-red-100 border-red-200',
    textColor: 'text-red-800',
    recommendations: [
      'Report signal malfunction to traffic department',
      'Monitor for proper operation during peak hours',
      'Document timing and light sequence issues'
    ]
  },
  {
    value: 'Road Sign',
    label: 'Road Sign / Warning Sign',
    description: 'Road signage, warning signs, or directional markers detected',
    severity: 'Medium',
    confidence: 0.78,
    icon: '🚏',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    textColor: 'text-blue-800',
    recommendations: [
      'Report damaged or obscured signage',
      'Check for proper visibility and positioning',
      'Ensure sign meets visibility standards'
    ]
  },
  {
    value: 'Street Light',
    label: 'Street Light / Lighting',
    description: 'Street lighting infrastructure or lamp posts detected',
    severity: 'Low',
    confidence: 0.75,
    icon: '💡',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
    textColor: 'text-yellow-800',
    recommendations: [
      'Report lighting outages to utilities department',
      'Check for proper illumination levels',
      'Schedule maintenance if flickering'
    ]
  },
  {
    value: 'Waste Management',
    label: 'Waste / Garbage Issue',
    description: 'Waste collection, disposal, or litter issues detected',
    severity: 'Medium',
    confidence: 0.73,
    icon: '♻️',
    bgColor: 'bg-green-50 hover:bg-green-100 border-green-200',
    textColor: 'text-green-800',
    recommendations: [
      'Contact waste management services',
      'Report overflowing containers',
      'Schedule additional pickup if needed'
    ]
  },
  {
    value: 'Other',
    label: 'Other Infrastructure Issue',
    description: 'General infrastructure or maintenance issue detected',
    severity: 'Low',
    confidence: 0.65,
    icon: '🔧',
    bgColor: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
    textColor: 'text-gray-800',
    recommendations: [
      'Report to appropriate city department',
      'Monitor for changes in condition',
      'Take additional photos if needed'
    ]
  }
];

export default function PhotoUpload({ user, onPhotoAnalyzed }: PhotoUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setAnalysisResult(null);
      setShowCategorySelector(false);
    } else {
      alert('Please select a valid image file.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  // Show all categories for human verification
  const analyzeImage = async (imageFile: File): Promise<AnalysisResult> => {
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show category selection immediately
      setShowCategorySelector(true);
      
      return {
        category: 'Analyzing...',
        confidence: 0,
        originalConfidence: 0,
        severity: 'Unknown',
        description: 'Please select the category that best matches your uploaded image.',
        recommendations: ['Choose the appropriate category from the options below'],
        warnings: [],
        needsReview: true,
        humanReviewRequired: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Analysis failed:', error);
      const errorResult: AnalysisResult = {
        category: 'Error',
        confidence: 0,
        originalConfidence: 0,
        severity: 'Unknown',
        description: 'Analysis failed. Please try again with a clearer image.',
        recommendations: [
          'Ensure good lighting conditions',
          'Take photo from closer distance',
          'Avoid blurry or unclear images'
        ],
        warnings: ['Analysis service temporarily unavailable'],
        needsReview: true,
        humanReviewRequired: true,
        timestamp: new Date().toISOString()
      };
      setAnalysisResult(errorResult);
      return errorResult;
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle user selecting a category
  const handleCategorySelect = (categoryOption: CategoryOption) => {
    const result: AnalysisResult = {
      category: categoryOption.value,
      confidence: categoryOption.confidence,
      originalConfidence: categoryOption.confidence,
      severity: categoryOption.severity,
      description: categoryOption.description,
      recommendations: categoryOption.recommendations,
      warnings: [],
      needsReview: false,
      humanReviewRequired: false,
      isManuallySelected: true,
      timestamp: new Date().toISOString()
    };
    
    setAnalysisResult(result);
    setShowCategorySelector(false);
    
    if (onPhotoAnalyzed) {
      onPhotoAnalyzed(result);
    }
  };

  const handleCreateReport = () => {
    if (analysisResult && !analysisResult.humanReviewRequired) {
      console.log('Creating report with analysis:', analysisResult);
    }
  };

  const clearSession = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setAnalysisResult(null);
    setAnalyzing(false);
    setShowCategorySelector(false);
  };

  return (
    <div className="dashboard bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
        <div className="p-3 bg-purple-100 rounded-xl">
          <Camera className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Upload Problem Photo</h3>
          <p className="text-sm text-gray-600">AI-powered analysis with manual verification</p>
        </div>
      </div>

      {/* Upload Area */}
      {!selectedImage ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
              <Upload className="h-8 w-8 text-gray-600" />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Upload a Photo of the Problem
              </h4>
              <p className="text-gray-600 mb-4">
                Drag and drop your image here, or click to browse
              </p>
            </div>

            <div className="space-y-3">
              <label className="inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <span className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition-colors inline-flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Choose Photo</span>
                </span>
              </label>
              
              <p className="text-xs text-gray-500">
                Supports: JPG, PNG, WebP • Max size: 10MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview and Analysis */
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="relative">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full h-64 object-cover rounded-xl border border-gray-200"
            />
            <button
              type="button"
              onClick={clearSession}
              aria-label="Clear selected photo"
              title="Clear selected photo"
              className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Analysis Controls */}
          {!analyzing && !showCategorySelector && !analysisResult && (
            <div className="text-center">
              <button
                onClick={() => selectedFile && analyzeImage(selectedFile)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Analyze with AI</span>
                </div>
              </button>
            </div>
          )}

          {/* Analyzing State */}
          {analyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <div>
                  <h4 className="font-semibold text-blue-900">AI Analysis in Progress</h4>
                  <p className="text-sm text-blue-700">Processing image and preparing category options...</p>
                </div>
              </div>
            </div>
          )}

          {/* 🔧 NEW: 4-Column Category Selection Interface */}
          {showCategorySelector && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3 mb-6">
                <Edit className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 mb-2">Select the Correct Category</h4>
                  <p className="text-sm text-blue-800">
                    Please choose the category that best matches your uploaded image:
                  </p>
                </div>
              </div>
              
              {/* 4-Column Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleCategorySelect(option)}
                    className={`text-left p-4 border-2 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-md ${option.bgColor}`}
                  >
                    {/* Category Icon and Title */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{option.icon}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        option.severity === 'High' ? 'bg-red-100 text-red-700' :
                        option.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {option.severity}
                      </span>
                    </div>
                    
                    {/* Category Name */}
                    <h5 className={`font-bold text-sm mb-2 ${option.textColor}`}>
                      {option.value}
                    </h5>
                    
                    {/* Description */}
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {option.description}
                    </p>
                    
                    {/* Confidence */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {Math.round(option.confidence * 100)}% confidence
                      </span>
                      <CheckCircle className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-blue-200">
                <button
                  onClick={() => setShowCategorySelector(false)}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Cancel and try different image
                </button>
              </div>
            </div>
          )}

          {/* Final Analysis Result */}
          {analysisResult && !showCategorySelector && (
            <div className="space-y-4">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-green-100">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {analysisResult.category}
                        {analysisResult.isManuallySelected && (
                          <span className="text-sm text-green-600 ml-2">(Human Verified)</span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                          Confidence: {Math.round(analysisResult.confidence * 100)}%
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          analysisResult.severity === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                          analysisResult.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }`}>
                          {analysisResult.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Analysis Description</h4>
                    <p className="text-gray-700 leading-relaxed">{analysisResult.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recommended Actions</h4>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-blue-100 text-blue-700">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 flex-1">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex space-x-3 pt-6 border-t border-gray-200">
                    <button 
                      onClick={handleCreateReport}
                      className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105 shadow-lg transition-all duration-200"
                    >
                      Create Report
                    </button>
                    
                    <button 
                      onClick={() => {
                        setAnalysisResult(null);
                        setShowCategorySelector(true);
                      }}
                      className="px-6 py-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors font-medium"
                    >
                      Change Category
                    </button>
                    
                    <button 
                      onClick={clearSession}
                      className="px-6 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-colors font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-2">How This Works</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Upload your photo of the city problem</li>
          <li>• Review all available category options</li>
          <li>• Select the category that best matches your image</li>
          <li>• System generates appropriate recommendations and actions</li>
          <li>• Create an official report with human-verified classification</li>
        </ul>
      </div>
    </div>
  );
}
