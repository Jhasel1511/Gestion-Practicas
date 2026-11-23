import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  className?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  className = '',
  onClose,
}) => {
  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <XCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />,
    },
    info: {
      bg: 'bg-[#F7EDD8] border-[#E9DDBD] text-[#8E712B]',
      icon: <Info className="w-4.5 h-4.5 text-[#C5A04B] shrink-0" />,
    },
  }[type];

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-lg border text-xs ${config.bg} ${className}`}
    >
      {config.icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <p className="leading-relaxed opacity-95">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-[#777777] hover:text-[#292929] text-xs p-1"
        >
          ✕
        </button>
      )}
    </div>
  );
};
