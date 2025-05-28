"use client";

import React from 'react';

const faqs = [
  {
    question: 'Is my code safe and secure?',
    answer: 'Absolutely. Your code is processed entirely in your browser - it never gets sent to our servers. All analysis happens locally on your machine, ensuring complete privacy and security.'
  },
  {
    question: 'What happens after my trial ends?',
    answer: 'You can continue using the free plan with limited projects, upgrade to Pro for unlimited access, or cancel anytime. No hidden fees or automatic charges without your permission.'
  },
  {
    question: 'How large of a codebase can I analyze?',
    answer: 'CodeMaster can handle projects of any size, from small scripts to enterprise applications with 100,000+ files. Performance scales based on your device\'s capabilities.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes! We offer a 30-day money-back guarantee. If you\'re not completely satisfied with CodeMaster, we\'ll refund your purchase, no questions asked.'
  },
  {
    question: 'Will this work with my programming language/framework?',
    answer: 'CodeMaster supports all major languages including JavaScript, TypeScript, Python, React, Next.js, Vue, Angular, and more. If you can upload it, we can analyze it.'
  }
];

const FAQSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#f7fafc]">
      <div className="container mx-auto px-5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 