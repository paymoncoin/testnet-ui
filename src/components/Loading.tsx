import React from 'react';
import { cn } from '@/lib/utils'; // Optional if you're using `cn` for conditional class merging

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...', className }) => {
  return (
    <div className={cn('min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-400', className)}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-t-transparent border-blue-300 rounded-full animate-spin-slow"></div>
      </div>
      <p className="mt-6 text-lg font-medium opacity-75">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
