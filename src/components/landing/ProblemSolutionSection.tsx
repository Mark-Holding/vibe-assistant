"use client";

import React from 'react';

const ProblemSolutionSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-15 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-8 leading-tight">
              <span className="text-red-600">The Problem:</span><br />
              AI Code Feels Like a Black Box
            </h2>
            <ul className="space-y-5">
              <li className="flex items-start text-lg text-gray-600">
                <span className="mr-3 mt-1 text-lg">❌</span>
                You inherit massive codebases you didn't write
              </li>
              <li className="flex items-start text-lg text-gray-600">
                <span className="mr-3 mt-1 text-lg">❌</span>
                Spend hours figuring out what files do instead of being productive
              </li>
              <li className="flex items-start text-lg text-gray-600">
                <span className="mr-3 mt-1 text-lg">❌</span>
                Fear making changes because you don't understand dependencies
              </li>
              <li className="flex items-start text-lg text-gray-600">
                <span className="mr-3 mt-1 text-lg">❌</span>
                Imposter syndrome creeps up with every prompt
              </li>
              <li className="flex items-start text-lg text-gray-600">
                <span className="mr-3 mt-1 text-lg">❌</span>
                Junior developers feel overwhelmed and lost
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-4xl font-bold mb-8 leading-tight">
              <span className="text-green-600">The Solution:</span><br />
              Instant Code Understanding
            </h2>
            <ul className="space-y-5">
              <li className="flex items-start text-lg text-gray-600">
                <span className="mr-3 mt-1 text-lg">✅</span>
                Upload any project and get instant visual maps
              </li>
              <li className="flex items-start text-lg text-gray-600">
                <span className="mr-3 mt-1 text-lg">✅</span>
                Plain-English explanations of every function
              </li>
              <li className="flex items-start text-lg text-gray-600">
                <span className="mr-3 mt-1 text-lg">✅</span>
                See exactly how components connect
              </li>
              <li className="flex items-start text-lg text-gray-600">
                <span className="mr-3 mt-1 text-lg">✅</span>
                Turn 'I have no idea' into 'Let me show you how this works'
              </li>
              <li className="flex items-start text-lg text-gray-600">
                <span className="mr-3 mt-1 text-lg">✅</span>
                Regain confidence to modify and extend code
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection; 