import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-sm px-5 py-2.5 gap-2',
  };

  const variants = {
    primary: 'bg-[#C5A04B] hover:bg-[#B08E3B] text-white shadow-gold-sm hover:shadow-gold-md focus-visible:ring-[#C5A04B] active:scale-[0.98]',
    secondary: 'bg-[#292929] hover:bg-[#3D3D3D] text-white focus-visible:ring-[#292929] active:scale-[0.98]',
    outline: 'border border-[#EAE8E2] text-[#292929] hover:bg-[#F5F5F3] hover:border-[#C5A04B]/40 bg-white focus-visible:ring-[#C5A04B]',
    ghost: 'text-[#777777] hover:text-[#292929] hover:bg-[#F5F5F3] focus-visible:ring-[#EAE8E2]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500 active:scale-[0.98]',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
