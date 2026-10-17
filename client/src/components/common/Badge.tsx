import React from 'react';
import { DonationStatus, BookingStatus } from '../../types';

interface BadgeProps {
  status: DonationStatus | BookingStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  switch (normalized) {
    case 'available':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Available';
      break;
    case 'partially_booked':
      styles = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Partially Booked';
      break;
    case 'booked':
      styles = 'bg-blue-50 text-blue-700 border-blue-200';
      label = 'Fully Booked';
      break;
    case 'confirmed':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Confirmed';
      break;
    case 'completed':
      styles = 'bg-purple-50 text-purple-700 border-purple-200';
      label = 'Completed';
      break;
    case 'expired':
      styles = 'bg-slate-100 text-slate-600 border-slate-300';
      label = 'Expired';
      break;
    case 'cancelled':
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Cancelled';
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${styles} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75 animate-pulse" />
      {label}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
      {category}
    </span>
  );
};
