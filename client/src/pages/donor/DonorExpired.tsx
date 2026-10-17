import React from 'react';
import { Donation } from '../../types';
import { StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { CalendarClock, MapPin, AlertCircle, History } from 'lucide-react';

interface Props {
  donations: Donation[];
}

export const DonorExpired: React.FC<Props> = ({ donations }) => {
  const seenIds = new Set<string>();
  const expiredList = donations.filter(d => {
    if (d.status !== 'expired' && new Date(d.expiry_time) > new Date()) return false;
    if (seenIds.has(d.id)) return false;
    seenIds.add(d.id);
    return true;
  });

  return (
    <div>
      <div className="pb-6 mb-6 border-b border-slate-200/80">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Archived & Expired Listings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Past food listings that reached their estimated expiry time. Preserved for your sustainability audit history.
        </p>
      </div>

      {expiredList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-card">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No expired listings</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Great job! All your listed donations have either been booked or are currently active in the community feed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expiredList.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 opacity-85 hover:opacity-100 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <CategoryBadge category={d.category} />
                <StatusBadge status="expired" />
              </div>

              <h3 className="font-bold text-slate-900 text-base">{d.food_name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Original Quantity:</span>
                  <span className="font-bold text-slate-800">{d.total_quantity} {d.quantity_unit}</span>
                </div>
                <div className="flex items-center text-slate-500">
                  <CalendarClock className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
                  <span>Expired {new Date(d.expiry_time).toLocaleDateString()} at {new Date(d.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center text-slate-500 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{d.pickup_address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
