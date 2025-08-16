'use client';
import { useState, useCallback } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Loader2, Shield } from 'lucide-react';

interface AuthButtonProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, fullName: string) => Promise<void>;
}

export default function AuthButton({ onSignIn, onSignUp }: AuthButtonProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastSubmit, setLastSubmit] = useState(0);

  // ✅ Fix: Debounce to prevent rate limiting
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Prevent rapid submissions (rate limit protection)
    const now = Date.now();
    if (now - lastSubmit < 2000) {
      setError('Please wait before trying again');
      return;
    }
    setLastSubmit(now);

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // ✅ Trim inputs to prevent 400 errors
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();
      const trimmedName = fullName.trim();

      // ✅ Client-side validation
      if (!trimmedEmail || !trimmedPassword) {
        throw new Error('Email and password are required');
      }
      
      if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
        throw new Error('Please enter a valid email address');
      }

      if (trimmedPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (isSignUp) {
        if (!trimmedName) {
          throw new Error('Full name is required');
        }
        await onSignUp(trimmedEmail, trimmedPassword, trimmedName);
        setSuccess('Account created! Please check your email to verify.');
      } else {
        await onSignIn(trimmedEmail, trimmedPassword);
        setSuccess('Welcome back!');
      }
    } catch (err: any) {
      // ✅ Better error handling for common Supabase errors
      let errorMessage = err.message || 'An error occurred';
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the verification link.';
      } else if (errorMessage.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please wait a minute and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, password, fullName, isSignUp, onSignIn, onSignUp, lastSubmit]);

  const isFormValid = email.trim() && password.trim() && (!isSignUp || fullName.trim());

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ✨ Stunning Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isSignUp ? 'Join Our Community' : 'Welcome Back'}
        </h2>
        <p className="text-gray-600">
          {isSignUp 
            ? 'Create your account to start reporting city problems' 
            : 'Sign in to continue making a difference'
          }
        </p>
      </div>

      {/* ✨ Beautiful Form Card */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name - Only for Sign Up */}
          {isSignUp && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="Enter your full name"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                placeholder="Enter your password"
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {isSignUp && (
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* ✨ Stunning Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 transform ${
              isFormValid && !loading
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
              </div>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>{isSignUp ? '🚀 Create Account' : '✨ Sign In'}</span>
              </span>
            )}
          </button>

          {/* Toggle between Sign In / Sign Up */}
          <div className="text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
                setEmail('');
                setPassword('');
                setFullName('');
              }}
              className="mt-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              {isSignUp ? 'Sign In Instead' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>

      {/* ✨ Security Badge */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center space-x-2 text-xs text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Secured with enterprise-grade encryption</span>
        </div>
      </div>
    </div>
  );
}
