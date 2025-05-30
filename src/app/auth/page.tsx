'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthForm, AuthFormData } from '../../components/auth/AuthForm';
import { AuthFooter } from '../../components/auth/AuthFooter';
import { supabaseAuthService } from '../../lib/auth/supabaseAuth';
import { useAuth } from '../../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (formData: AuthFormData) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = isSignUp 
        ? await supabaseAuthService.signUp(formData.email, formData.password, formData.name)
        : await supabaseAuthService.signIn(formData.email, formData.password);

      if (response.success) {
        if (isSignUp) {
          setSuccessMessage('Account created! Please check your email for verification.');
        } else {
          // Refresh user state in context
          await refreshUser();
          // Redirect to dashboard or code analyzer
          router.push('/code-analyzer');
        }
      } else {
        setError(response.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await supabaseAuthService.signInWithGoogle();
      
      if (!response.success) {
        setError(response.error || 'Google authentication failed');
        setIsLoading(false);
      }
      // If successful, the user will be redirected by OAuth
      // Loading state will be cleared by the auth state change
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await supabaseAuthService.signInWithGitHub();
      
      if (!response.success) {
        setError(response.error || 'GitHub authentication failed');
        setIsLoading(false);
      }
      // If successful, the user will be redirected by OAuth
      // Loading state will be cleared by the auth state change
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccessMessage('');
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

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-600 text-sm">{successMessage}</p>
          </div>
        )}
        
        <AuthForm
          isSignUp={isSignUp}
          onSubmit={handleSubmit}
          onGoogleAuth={handleGoogleAuth}
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