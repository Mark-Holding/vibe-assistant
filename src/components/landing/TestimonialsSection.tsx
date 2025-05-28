"use client";

import React from 'react';

const testimonials = [
  {
    quote: "CodeMaster saved me 20+ hours on my last project. I could understand a React codebase in minutes instead of days. Game changer!",
    author: "Alex Chen",
    role: "Senior Developer @ Stripe",
    avatar: "AC",
    rating: 5
  },
  {
    quote: "Perfect for onboarding new team members. They can understand our architecture in an hour instead of weeks.",
    author: "Sarah Johnson",
    role: "Tech Lead @ Shopify",
    avatar: "SJ",
    rating: 5
  },
  {
    quote: "As a freelancer taking over client projects, this tool is invaluable. I can quote accurately and deliver faster.",
    author: "Mike Rodriguez",
    role: "Freelance Developer",
    avatar: "MR",
    rating: 5
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#f7fafc]">
      <div className="container mx-auto px-5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Loved by Developers Worldwide</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-sm"
            >
              <div className="flex items-center mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-bold text-lg mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="text-yellow-400 mb-4">
                ⭐⭐⭐⭐⭐
              </div>
              <blockquote className="text-gray-600 italic leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 