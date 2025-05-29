import React from 'react';

export const AuthFooter: React.FC = () => {
  return (
    <>
      {/* Trust Indicators */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Secure & Private
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            No Credit Card Required
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-3">Trusted by developers at</p>
        <div className="flex items-center justify-center space-x-6 opacity-60">
          <span className="text-lg font-semibold text-gray-400">GitHub</span>
          <span className="text-lg font-semibold text-gray-400">Vercel</span>
          <span className="text-lg font-semibold text-gray-400">Stripe</span>
        </div>
      </div>
    </>
  );
}; 