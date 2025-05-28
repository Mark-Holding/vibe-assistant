"use client";

import React from 'react';

const features = [
  {
    icon: '🗺️',
    title: 'Visual Architecture Maps',
    description: 'See your entire codebase as an interactive diagram. Understand how components connect at a glance.',
    benefit: '→ No more guessing',
    color: '#3182ce'
  },
  {
    icon: '🤖',
    title: 'AI Code Explanations',
    description: 'Every function gets a plain-English explanation. Know what code does without reading every line.',
    benefit: '→ Save hours daily',
    color: '#38a169'
  },
  {
    icon: '🔍',
    title: 'Smart Code Search',
    description: 'Find any function, component, or logic instantly. Search by purpose, not just file names.',
    benefit: '→ Find anything fast',
    color: '#805ad5'
  },
  {
    icon: '🔗',
    title: 'Dependency Tracking',
    description: 'See exactly what depends on what. Make changes confidently without breaking things.',
    benefit: '→ Safe refactoring',
    color: '#dd6b20'
  },
  {
    icon: '🎨',
    title: 'Design System Analysis',
    description: 'Extract colors, fonts, and spacing from CSS. Understand the design patterns used.',
    benefit: '→ Consistent styling',
    color: '#e53e3e'
  },
  {
    icon: '🛡️',
    title: '100% Private & Secure',
    description: 'Your code never leaves your machine. All analysis happens locally in your browser.',
    benefit: '→ Enterprise ready',
    color: '#553c9a'
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Master Any Codebase</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From visual architecture maps to AI-powered explanations, we've got every aspect of code understanding covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 text-center"
            >
              <div className="text-5xl mb-5 block">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
              <div 
                className="font-semibold text-sm"
                style={{ color: feature.color }}
              >
                {feature.benefit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 