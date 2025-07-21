'use client';

import { ReactNode } from 'react';

interface QuestionTransitionProps {
  children: ReactNode;
  isTransitioning: boolean;
}

export default function QuestionTransition({
  children,
  isTransitioning,
}: QuestionTransitionProps) {
  return (
    <div
      className={`
        transition-all duration-1000 ease-in-out
        ${
          isTransitioning
            ? 'opacity-0 transform translate-y-4'
            : 'opacity-100 transform translate-y-0'
        }
      `}
    >
      {children}
    </div>
  );
}