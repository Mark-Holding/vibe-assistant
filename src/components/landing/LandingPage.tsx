"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../code-analyzer';
import { FileData } from '../../types/code-analyzer';
import ProblemSolutionSection from './ProblemSolutionSection';
import DemoSection from './DemoSection';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';
import PricingSection from './PricingSection';
import FAQSection from './FAQSection';
import FinalCTASection from './FinalCTASection';
import Footer from './Footer';

const LandingPage: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowStickyCTA(scrollPosition > 800);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onFilesUploaded = (uploadedFiles: FileData[]) => {
    // Handle file upload
    setShowUploadModal(false);
  };

  const scrollToDemo = () => {
    const demoSection = document.querySelector('.demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50 py-4">
        <div className="container mx-auto px-5 flex justify-between items-center">
          <div className="flex items-center text-2xl font-bold text-gray-900">
            <span className="mr-2.5 text-2xl">⚡</span>
            CodeMaster
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 rounded-lg font-semibold text-base transition-all duration-300 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:from-[#5a67d8] hover:to-[#6b46c1] hover:-translate-y-0.5 hover:shadow-lg"
          >
            Start Free Trial
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 text-center bg-gradient-to-br from-[#f7fafc] to-[#edf2f7]">
        <div className="container mx-auto px-5">
          <div className="inline-flex items-center bg-green-50 text-green-800 px-4 py-2 rounded-full text-sm mb-8 border border-green-200">
            <span className="mr-2">🛡️</span>
            Trusted by 2,000+ developers worldwide
          </div>
          
          <h1 className="text-5xl font-extrabold leading-tight mb-6 text-gray-900">
            Stop Drowning in{' '}
            <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              AI-Generated Code
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Instantly understand any codebase with AI-powered analysis, visual maps, and plain-English explanations.
          </p>

          <div className="flex justify-center gap-4 mb-16">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:from-[#5a67d8] hover:to-[#6b46c1] hover:-translate-y-0.5 hover:shadow-lg"
            >
              🚀 Analyze Your Code Free
            </button>
            <button 
              onClick={scrollToDemo}
              className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 bg-white text-gray-700 border-2 border-gray-200 hover:border-[#667eea] hover:text-[#667eea]"
            >
              ▶️ Watch Demo
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm mb-5">Used by developers at</p>
            <div className="flex justify-center items-center gap-10 flex-wrap opacity-60">
              <span className="text-xl font-bold text-gray-400">GitHub</span>
              <span className="text-xl font-bold text-gray-400">Vercel</span>
              <span className="text-xl font-bold text-gray-400">Stripe</span>
              <span className="text-xl font-bold text-gray-400">Shopify</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Solution Section */}
      <ProblemSolutionSection />

      {/* Demo Section */}
      <DemoSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <FinalCTASection />

      {/* Footer */}
      <Footer />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Upload Your Code</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <FileUploader onFilesUploaded={onFilesUploaded} />
          </div>
        </div>
      )}

      {/* Sticky CTA */}
      {showStickyCTA && (
        <div className="fixed bottom-5 right-5 z-50">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 rounded-lg font-semibold text-base transition-all duration-300 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:from-[#5a67d8] hover:to-[#6b46c1] hover:-translate-y-0.5 hover:shadow-lg"
          >
            🚀 Try Free Now
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingPage; 