import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: string; isPositive?: boolean };
  onClick?: () => void;
  accent?: 'gold' | 'emerald' | 'rose' | 'amber' | 'default';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick,
  accent = 'default',
}) => {
  const accentColors = {
    gold: 'bg-[#F7EDD8] text-[#8E712B]',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700',
    default: 'bg-[#F5F5F3] text-[#777777]',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-[#EAE8E2] shadow-card transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-[#C5A04B]/50 hover:shadow-gold-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
            {title}
          </p>
          <p className="text-2xl font-bold text-[#292929] leading-none tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[#777777] mt-1.5 leading-snug">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-xs font-medium mt-1.5 ${trend.isPositive ? 'text-emerald-600' : 'text-[#777777]'}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg shrink-0 ${accentColors[accent]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
