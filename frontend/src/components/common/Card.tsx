import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  goldAccent?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  header,
  footer,
  goldAccent = false,
  padding = 'md',
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-7',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-[#EAE8E2] shadow-card overflow-hidden ${
        goldAccent ? 'border-t-2 border-t-[#C5A04B]' : ''
      } ${className}`}
    >
      {header && (
        <div className="px-5 py-3.5 border-b border-[#EAE8E2] flex items-center justify-between bg-[#FAFAF8]">
          {header}
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-[#EAE8E2] bg-[#FAFAF8] text-xs text-[#777777]">
          {footer}
        </div>
      )}
    </div>
  );
};
