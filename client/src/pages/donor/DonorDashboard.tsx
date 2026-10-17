import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Donation, Booking } from '../../types';
import { DonorDonations } from './DonorDonations';
import { DonorBookings } from './DonorBookings';
import { DonorExpired } from './DonorExpired';
import { AddDonationModal } from './AddDonationModal';
import { ProfilePage } from '../ProfilePage';
import { 
  Building2, 
  Utensils, 
  PackageCheck, 
  CalendarClock, 
  User, 
  PlusCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'donations' | 'booked' | 'expired' | 'profile'>('donations');

  const [donations, setDonations] = useState<Donation[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDonorData = async () => {
    if (!user) return;
    try {
      const [donationsRes, bookingsRes] = await Promise.all([
        api.getDonations({ donor_id: user.id }),
        api.getBookings({ donor_id: user.id })
      ]);
      const seenDonationIds = new Set<string>();
      const uniqueDonations = (donationsRes || []).filter(d => {
        if (seenDonationIds.has(d.id)) return false;
        seenDonationIds.add(d.id);
        return true;
      });
      const seenBookingIds = new Set<string>();
      const uniqueBookings = (bookingsRes || []).filter(b => {
        if (seenBookingIds.has(b.id)) return false;
        seenBookingIds.add(b.id);
        return true;
      });
      setDonations(uniqueDonations);
      setBookings(uniqueBookings);
    } catch (e) {
      console.error('Failed to fetch donor data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, [user]);

  // Derived metrics
  const activeCount = donations.filter(d => d.status === 'available' || d.status === 'partially_booked').length;
  const bookedCount = bookings.filter(b => b.booking_status === 'confirmed').length;
  const expiredCount = donations.filter(d => d.status === 'expired' || new Date(d.expiry_time) <= new Date()).length;
  const totalMealsDonated = donations.reduce((sum, d) => sum + Number(d.total_quantity), 0);

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 text-white relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Donor Banner Header */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-slate-900/90 rounded-3xl p-6 sm:p-8 text-white border border-emerald-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                <Building2 className="w-4 h-4" />
                <span>{user?.organization_name || 'Food Donor Portal'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.full_name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                Thank you for reducing hunger and minimizing environmental waste by sharing surplus food.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm transition shadow-xl shadow-emerald-950/40 flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                <span>Add Food Donation</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400">Active Listings</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{activeCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Received Bookings</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{bookedCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Expired / Archived</p>
              <p className="text-xl sm:text-2xl font-black text-slate-300 mt-0.5">{expiredCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Units Listed</p>
              <p className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{Math.round(totalMealsDonated)}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Donations, Booked, Expired, Profile) */}
        <div className="flex rounded-2xl bg-slate-900/80 backdrop-blur-xl p-1.5 border border-slate-800/90 shadow-2xl max-w-2xl">
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              activeTab === 'donations'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Donations ({activeCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('booked')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              activeTab === 'booked'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Booked ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('expired')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              activeTab === 'expired'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CalendarClock className="w-4 h-4" />
            <span>Expired ({expiredCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div>
          {activeTab === 'donations' && (
            <DonorDonations
              donations={donations}
              onAddClick={() => setIsAddModalOpen(true)}
              onRefresh={fetchDonorData}
            />
          )}

          {activeTab === 'booked' && (
            <DonorBookings
              bookings={bookings}
              onRefresh={fetchDonorData}
            />
          )}

          {activeTab === 'expired' && (
            <DonorExpired donations={donations} />
          )}

          {activeTab === 'profile' && (
            <ProfilePage />
          )}
        </div>
      </div>

      {/* Add Food Donation Modal */}
      <AddDonationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newDonation) => {
          setDonations((prev) => [newDonation, ...prev]);
        }}
      />
    </div>
  );
};
