import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-2',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div
        className={`${sizeMap[size]} border-[#EAE8E2] border-t-[#C5A04B] rounded-full animate-spin`}
      />
      {text && <p className="text-xs text-[#777777]">{text}</p>}
    </div>
  );
};
