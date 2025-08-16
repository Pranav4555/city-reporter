'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Wait a moment then redirect to home
    setTimeout(() => {
      router.push('/');
    }, 2000);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl shadow-2xl mb-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">✅ Email Verified!</h2>
        <p className="text-white opacity-80">Redirecting you to the app...</p>
      </div>
    </div>
  );
}
