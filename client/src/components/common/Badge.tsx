import React from 'react';
import { DonationStatus, BookingStatus } from '../../types';

interface BadgeProps {
  status: DonationStatus | BookingStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toLowerCase();

  let styles = 'bg-slate-800/90 text-slate-300 border-slate-700';
  let label = status;

  switch (normalized) {
    case 'available':
      styles = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      label = 'Available';
      break;
    case 'partially_booked':
      styles = 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      label = 'Partially Booked';
      break;
    case 'booked':
      styles = 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      label = 'Fully Booked';
      break;
    case 'confirmed':
      styles = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      label = 'Confirmed';
      break;
    case 'completed':
      styles = 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      label = 'Completed';
      break;
    case 'expired':
      styles = 'bg-slate-800/90 text-slate-400 border-slate-700';
      label = 'Expired';
      break;
    case 'cancelled':
      styles = 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      label = 'Cancelled';
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border backdrop-blur-sm ${styles} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75 animate-pulse" />
      {label}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-800/90 text-slate-200 border border-slate-700/80 backdrop-blur-sm">
      {category}
    </span>
  );
};
