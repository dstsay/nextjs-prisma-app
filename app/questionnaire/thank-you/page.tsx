'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ThankYouPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div
        className={`
          max-w-2xl text-center transition-all duration-1000 ease-in-out
          ${
            isVisible
              ? 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform translate-y-4'
          }
        `}
      >
        <div className="bg-white rounded-2xl p-12 shadow-sm">
          <div className="w-20 h-20 bg-[#A1823C] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-medium text-[#004643] mb-4">
            Thank you!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            We will match you with a Professional Makeup Artist
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <p className="text-amber-800 font-medium">
              UNDER CONSTRUCTION
            </p>
            <p className="text-amber-700 text-sm mt-1">
              This feature is coming soon!
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-[#A1823C] text-white rounded-full hover:bg-[#8B6F33] transition-colors"
            >
              Return to Home
            </button>
            
            <button
              onClick={() => router.push('/questionnaire')}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
            >
              Take Quiz Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}