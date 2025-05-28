"use client";

import React from 'react';

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'Perfect for getting started',
    features: [
      '5 projects per month',
      'Basic architecture maps',
      'Code explanations',
      'Community support'
    ],
    buttonText: 'Start Free',
    buttonStyle: 'secondary',
    popular: false
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    features: [
      'Unlimited projects',
      'Advanced visual maps',
      'AI-powered insights',
      'Dependency tracking',
      'Design system analysis',
      'Priority support'
    ],
    buttonText: 'Start Pro Trial',
    buttonStyle: 'primary',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: 'per month',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom integrations',
      'Advanced security',
      'Dedicated support',
      'SLA guarantee'
    ],
    buttonText: 'Contact Sales',
    buttonStyle: 'secondary',
    popular: false
  }
];

const PricingSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`bg-white border-2 rounded-xl p-8 text-center relative transition-all duration-300 hover:-translate-y-2 ${
                tier.popular 
                  ? 'border-[#667eea] transform scale-105' 
                  : 'border-gray-200'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-400 to-red-400 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-semibold mb-5">{tier.name}</h3>
              <div className="text-5xl font-bold text-gray-900 mb-2">{tier.price}</div>
              <div className="text-gray-600 mb-8">{tier.period}</div>
              
              <ul className="text-left mb-10 space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-600">
                    <span className="mr-3">✅</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
                  tier.buttonStyle === 'primary'
                    ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:from-[#5a67d8] hover:to-[#6b46c1] hover:-translate-y-0.5 hover:shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#667eea] hover:text-[#667eea]'
                }`}
              >
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection; 