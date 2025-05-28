"use client";

import React from 'react';

const FinalCTASection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-[#667eea] to-[#764ba2]">
      <div className="container mx-auto px-5 text-center">
        <h2 className="text-4xl font-bold text-white mb-5">
          Ready to Master Any Codebase?
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join 2,000+ developers who've already transformed how they understand code. Start your free trial today.
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 bg-white text-[#667eea] hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg">
            🚀 Start Free Trial Now
          </button>
          <button className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 bg-transparent text-white border-2 border-white hover:bg-white/10">
            📅 Book Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection; 