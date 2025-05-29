import React from 'react';
import { Sparkles } from 'lucide-react';

interface AuthHeaderProps {
  isSignUp: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ isSignUp }) => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        {isSignUp ? 'Create your account' : 'Welcome back'}
      </h2>
      <p className="text-gray-600">
        {isSignUp 
          ? 'Start understanding your codebase today' 
          : 'Sign in to continue to Vibe Assistant'
        }
      </p>
    </div>
  );
}; 