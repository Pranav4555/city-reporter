'use client';
import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { createClient } from '@supabase/supabase-js';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Sparkles, Shield, Zap, Users, Camera, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
  }
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [lastSubmit, setLastSubmit] = useState(0);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    if (!supabase) {
      setError('Authentication service not available.');
      setLoading(false);
      return;
    }

    const getInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to load session.');
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Error getting session:', err);
        setError('Authentication service unavailable.');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔥 Auth Event:', event);
        console.log('🔥 Session:', session);
        console.log('🔥 User:', session?.user);
        
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Create user profile if missing
  useEffect(() => {
    const createUserProfile = async (user: User) => {
      if (!supabase) return;
      
      try {
        // Check if profile exists
        const { data: existingProfile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        // If no profile exists, create one
        if (error && error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              points: 0
            });
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            console.log('✅ User profile created successfully');
          }
        }
      } catch (err) {
        console.error('Profile creation error:', err);
      }
    };

    if (user && !loading) {
      createUserProfile(user);
    }
  }, [user, loading]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    if (now - lastSubmit < 2000) {
      setAuthError('Please wait before trying again');
      return;
    }
    setLastSubmit(now);

    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();
      const trimmedName = fullName.trim();

      // Better validation
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
        
        // Clean signup with proper error handling
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
          options: {
            data: { 
              full_name: trimmedName 
            }
          }
        });
        
        if (error) {
          console.error('Signup error:', error);
          throw error;
        }
        
        setAuthSuccess('Account created successfully! You can now sign in.');
        
        // Switch to sign in mode after successful signup
        setTimeout(() => {
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setFullName('');
          setAuthSuccess('');
        }, 2000);
        
      } else {
        // Clean signin with better error handling
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });
        
        if (error) {
          console.error('Signin error:', error);
          throw error;
        }
        
        setAuthSuccess('Welcome back!');
      }
      
    } catch (err: any) {
      console.error('Auth error:', err);
      
      let errorMessage = err.message || 'An error occurred';
      
      // Handle specific Supabase errors
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials or sign up for a new account.';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the verification link.';
      } else if (errorMessage.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please wait a minute and try again.';
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      }
      
      setAuthError(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      setAuthError('Please enter your email address');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
        redirectTo: 'http://localhost:3000/reset-password'
      });

      if (error) throw error;

      setAuthSuccess('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send reset email');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const isFormValid = email.trim() && password.trim() && (!isSignUp || fullName.trim());

  // Environment setup screen
  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white border-opacity-20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-4xl">⚙️</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Setup Required</h1>
            <p className="text-white opacity-80">Configure your environment to get started</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-yellow-500 bg-opacity-20 border border-yellow-400 border-opacity-30 rounded-2xl p-6">
              <h3 className="font-semibold text-yellow-200 mb-3">Environment Variables Missing</h3>
              <p className="text-sm text-yellow-100 opacity-90 mb-4">
                Create <code className="bg-yellow-400 bg-opacity-30 px-2 py-1 rounded font-mono text-yellow-200">.env.local</code> in your frontend directory:
              </p>
              <div className="bg-gray-900 bg-opacity-60 text-green-300 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-gray-700">
                <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl shadow-2xl mb-6">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          </div>
          <p className="text-white text-xl font-semibold">Loading Smart City Reporter...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-pink-600 to-purple-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center border border-white border-opacity-20">
          <div className="w-16 h-16 bg-red-500 bg-opacity-30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Connection Error</h2>
          <p className="text-white opacity-80 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated - STUNNING LANDING PAGE
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 via-pink-600/50 to-blue-600/50"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white bg-opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400 bg-opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400 bg-opacity-15 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-6">
          {/* Main Content */}
          <div className="text-center mb-12 max-w-4xl">
            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 drop-shadow-2xl leading-tight">
              Smart City Reporter
            </h1>
            
            {/* Subtitle */}
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-8 drop-shadow-lg opacity-90">
              Help Make Your City Better
            </h2>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-white opacity-80 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Report city problems with AI-powered analysis and track their resolution in real-time. Join thousands making a difference.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <div className="bg-white bg-opacity-20 backdrop-blur-md px-6 py-3 rounded-full text-white font-semibold border border-white border-opacity-30 shadow-lg">
                <Camera className="w-5 h-5 inline mr-2" />
                AI Photo Analysis
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-md px-6 py-3 rounded-full text-white font-semibold border border-white border-opacity-30 shadow-lg">
                <Zap className="w-5 h-5 inline mr-2" />
                Real-time Tracking
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-md px-6 py-3 rounded-full text-white font-semibold border border-white border-opacity-30 shadow-lg">
                <Users className="w-5 h-5 inline mr-2" />
                Community Driven
              </div>
            </div>
          </div>

          {/* Auth Form Card */}
          <div className="w-full max-w-md">
            <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white border-opacity-20 p-8">
              {/* Form Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl mb-4 shadow-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {isSignUp ? 'Join Our Community' : 'Welcome Back'}
                </h3>
                <p className="text-white opacity-80 text-sm">
                  {isSignUp 
                    ? 'Create your account to start reporting' 
                    : 'Sign in to continue making a difference'
                  }
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-6">
                {/* Full Name - Only for Sign Up */}
                {isSignUp && (
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white opacity-70" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full pl-12 pr-4 py-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl placeholder-white placeholder-opacity-70 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-opacity-30 transition-all duration-300 border border-white border-opacity-20"
                      required={isSignUp}
                    />
                  </div>
                )}

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white opacity-70" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl placeholder-white placeholder-opacity-70 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-opacity-30 transition-all duration-300 border border-white border-opacity-20"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white opacity-70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl placeholder-white placeholder-opacity-70 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-opacity-30 transition-all duration-300 border border-white border-opacity-20"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Success Message */}
                {authSuccess && (
                  <div className="bg-green-500 bg-opacity-20 border border-green-400 border-opacity-30 rounded-2xl p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                      <p className="text-sm font-medium text-green-200">{authSuccess}</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {authError && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 rounded-2xl p-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-300 flex-shrink-0" />
                      <p className="text-sm font-medium text-red-200">{authError}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isFormValid || authLoading}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 transform shadow-xl ${
                    isFormValid && !authLoading
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 hover:scale-105 shadow-2xl'
                      : 'bg-gray-500 bg-opacity-50 cursor-not-allowed'
                  }`}
                >
                  {authLoading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    </span>
                  )}
                </button>

                {/* Toggle between Sign In / Sign Up */}
                <div className="text-center pt-6">
                  <p className="text-white opacity-80 text-sm mb-3">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setAuthError('');
                      setAuthSuccess('');
                      setEmail('');
                      setPassword('');
                      setFullName('');
                    }}
                    className="text-pink-200 hover:text-white font-semibold transition-colors duration-300 text-lg"
                  >
                    {isSignUp ? 'Sign In Instead' : 'Create Account'}
                  </button>
                </div>

                {/* Forgot Password Section */}
                {!isSignUp && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(!showForgotPassword)}
                      className="text-pink-200 hover:text-white text-sm transition-colors"
                    >
                      Forgot Password?
                    </button>
                    
                    {showForgotPassword && (
                      <div className="mt-4 space-y-3">
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="Enter email for password reset"
                          className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 rounded-2xl border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-pink-400 backdrop-blur-sm"
                        />
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={authLoading}
                          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-2xl transition-all duration-300"
                        >
                          {authLoading ? 'Sending...' : 'Send Reset Email'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Security Badge */}
            <div className="text-center mt-8">
              <div className="inline-flex items-center space-x-2 text-sm text-white opacity-70">
                <Shield className="w-4 h-4" />
                <span>Secured with enterprise-grade encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - show dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl">🏙️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Smart City Reporter</h1>
                <p className="text-pink-100 text-xs">Making cities better</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white border-opacity-20">
                <span className="text-sm">
                  Welcome, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                className="bg-red-500 bg-opacity-80 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all duration-300 font-medium backdrop-blur-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <Dashboard user={user} />
    </div>
  );
}
