'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthForm, AuthFormData } from '../../components/auth/AuthForm';
import { AuthFooter } from '../../components/auth/AuthFooter';
import { authService } from '../../lib/auth/authService';
import { useAuth } from '../../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (formData: AuthFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = isSignUp 
        ? await authService.signUp(formData)
        : await authService.signIn(formData.email, formData.password, formData.rememberMe);

      if (response.success) {
        // Refresh user state in context
        refreshUser();
        // Redirect to dashboard or code analyzer
        router.push('/code-analyzer');
      } else {
        setError(response.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.signInWithGitHub();
      
      if (response.success) {
        // Refresh user state in context
        refreshUser();
        router.push('/code-analyzer');
      } else {
        setError(response.error || 'GitHub authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <AuthHeader isSignUp={isSignUp} />
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <AuthForm
          isSignUp={isSignUp}
          onSubmit={handleSubmit}
          onGitHubAuth={handleGitHubAuth}
          onToggleMode={handleToggleMode}
          isLoading={isLoading}
        />
        
        <AuthFooter />
      </div>
    </div>
  );
};

export default AuthPage; 