import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Booking } from '../../types';
import { AvailableFood } from './AvailableFood';
import { MyBookings } from './MyBookings';
import { ProfilePage } from '../ProfilePage';
import { 
  Users, 
  Search, 
  PackageCheck, 
  History, 
  User, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

export const ReceiverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'bookings' | 'history' | 'profile'>('available');
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const data = await api.getBookings({ receiver_id: user.id });
      const seenBookingIds = new Set<string>();
      const uniqueBookings = (data || []).filter(b => {
        if (seenBookingIds.has(b.id)) return false;
        seenBookingIds.add(b.id);
        return true;
      });
      setBookings(uniqueBookings);
    } catch (e) {
      console.error('Failed to load receiver bookings:', e);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const activeBookings = bookings.filter(b => b.booking_status === 'confirmed');
  const historicalBookings = bookings.filter(b => b.booking_status === 'completed' || b.booking_status === 'cancelled' || b.booking_status === 'expired');

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 text-white relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Receiver Banner Header */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900/90 to-slate-900/90 rounded-3xl p-6 sm:p-8 text-white border border-amber-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <Users className="w-4 h-4" />
                <span>{user?.organization_name || 'Community Receiver Portal'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Hello, {user?.full_name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                Connect with local kitchens to rescue fresh meals for shelters, care homes, and people in need.
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-white">Verified NGO / Shelter Account</p>
                <p className="text-[11px] text-slate-300">Eligible for immediate food booking</p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-400">Active Reserved Meals</p>
              <p className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{activeBookings.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Bookings Completed</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{historicalBookings.filter(b => b.booking_status === 'completed').length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">All-Time Meals Received</p>
              <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {bookings.reduce((sum, b) => sum + Number(b.quantity_reserved), 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Available Food, My Bookings, History, Profile) */}
        <div className="flex rounded-2xl bg-slate-900/80 backdrop-blur-xl p-1.5 border border-slate-800/90 shadow-2xl max-w-2xl">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              activeTab === 'available'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Available Food</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              activeTab === 'bookings'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>My Bookings ({activeBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              activeTab === 'history'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Past History ({historicalBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              activeTab === 'profile'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div>
          {activeTab === 'available' && (
            <AvailableFood onBookingSuccess={fetchBookings} />
          )}

          {activeTab === 'bookings' && (
            <MyBookings bookings={activeBookings} onRefresh={fetchBookings} />
          )}

          {activeTab === 'history' && (
            <MyBookings bookings={historicalBookings} onRefresh={fetchBookings} />
          )}

          {activeTab === 'profile' && (
            <ProfilePage />
          )}
        </div>
      </div>
    </div>
  );
};
