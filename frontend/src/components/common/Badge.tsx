import React from 'react';

type BadgeVariant = 'default' | 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-[#F7EDD8] text-[#8E712B] border-[#E9DDBD]',
    gold: 'bg-[#F7EDD8] text-[#8E712B] border-[#E9DDBD] font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-[#F5F5F3] text-[#777777] border-[#EAE8E2]',
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-[#C5A04B]',
    gold: 'bg-[#C5A04B]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-[#777777]',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-[11px] px-2 py-0.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
    pendiente: { label: 'Pendiente', variant: 'warning' },
    activa: { label: 'Activa', variant: 'success' },
    rechazada: { label: 'Rechazada', variant: 'danger' },
    cerrada: { label: 'Cerrada', variant: 'neutral' },
    postulada: { label: 'Postulada', variant: 'info' },
    seleccionada: { label: 'Seleccionada', variant: 'gold' },
    descartada: { label: 'Descartada', variant: 'neutral' },
    aprobada: { label: 'Aprobada', variant: 'success' },
    en_curso: { label: 'En Curso', variant: 'gold' },
    confirmada: { label: 'Confirmada', variant: 'success' },
    abierta: { label: 'Abierta', variant: 'danger' },
    en_revision: { label: 'En Revisión', variant: 'warning' },
    escalada: { label: 'Escalada', variant: 'danger' },
    baja: { label: 'Baja', variant: 'info' },
    media: { label: 'Media', variant: 'warning' },
    alta: { label: 'Alta', variant: 'danger' },
  };

  const config = statusConfig[status?.toLowerCase()] || {
    label: (status || '').replace('_', ' '),
    variant: 'neutral' as BadgeVariant,
  };

  return <Badge variant={config.variant} dot>{config.label}</Badge>;
};
