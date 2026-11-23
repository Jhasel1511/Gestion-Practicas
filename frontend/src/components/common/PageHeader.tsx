import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  badge,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
      <div>
        {badge && (
          <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-[#8E712B] bg-[#F7EDD8] px-2.5 py-1 rounded mb-2 border border-[#E9DDBD]">
            {badge}
          </span>
        )}
        <h1 className="text-xl font-semibold text-[#292929] tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-[#777777] mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
};
