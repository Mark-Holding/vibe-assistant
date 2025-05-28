"use client";

import React from 'react';

const DemoSection: React.FC = () => {
  const handlePlayDemo = () => {
    alert('🎬 Demo video would play here!\n\nShow your actual product demo video.');
  };

  return (
    <section className="demo-section py-20 bg-[#f7fafc]">
      <div className="container mx-auto px-5">
        <h2 className="text-4xl font-bold text-center mb-5">See CodeMaster in Action</h2>
        <p className="text-center text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Watch how CodeMaster transforms a confusing codebase into clear, understandable insights in under 60 seconds.
        </p>
        
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gray-800 px-4 py-4 flex items-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 text-center text-white text-sm">
              CodeMaster Dashboard
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-pink-50 py-20 px-10 text-center min-h-[400px] flex flex-col justify-center">
            <div 
              className="text-8xl mb-8 cursor-pointer transition-transform duration-300 hover:scale-110"
              onClick={handlePlayDemo}
            >
              ▶️
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Interactive Demo</h3>
            <p className="text-gray-600 mb-8">See the architecture map, code analysis, and design system in action</p>
            <button 
              onClick={handlePlayDemo}
              className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:from-[#5a67d8] hover:to-[#6b46c1] hover:-translate-y-0.5 hover:shadow-lg mx-auto"
            >
              Play Demo Video
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection; 