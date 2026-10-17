import React, { useState } from 'react';
import { Donation } from '../../types';
import { StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { 
  PlusCircle, 
  MapPin, 
  Clock, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  Package,
  X
} from 'lucide-react';

interface Props {
  donations: Donation[];
  onAddClick: () => void;
  onRefresh: () => void;
}

export const DonorDonations: React.FC<Props> = ({ donations, onAddClick, onRefresh }) => {
  const { addToast } = useNotifications();
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Deduplicate and filter only active / available / partially booked for primary donations view
  const seenIds = new Set<string>();
  const activeListings = donations.filter(d => {
    if (d.status !== 'available' && d.status !== 'partially_booked') return false;
    if (seenIds.has(d.id)) return false;
    seenIds.add(d.id);
    return true;
  });

  const handleCancelDonation = async (id: string, foodName: string) => {
    if (!window.confirm(`Are you sure you want to cancel the listing for "${foodName}"?`)) {
      return;
    }
    try {
      await api.cancelDonation(id);
      addToast('info', 'Listing Cancelled', `"${foodName}" was cancelled.`);
      onRefresh();
    } catch (err: any) {
      addToast('error', 'Cancellation Failed', err.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingDonation) return;
    setIsUpdating(true);
    try {
      await api.updateDonation(editingDonation.id, {
        total_quantity: Number(editQuantity)
      });
      addToast('success', 'Updated Successfully', 'Listing quantity updated.');
      setEditingDonation(null);
      onRefresh();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200/80 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Food Donations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your currently listed surplus food available for community pickup.
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-brand-600 to-emerald-700 hover:from-brand-700 hover:to-emerald-800 shadow-md shadow-brand-600/20 transition-all transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Food Donation</span>
        </button>
      </div>

      {activeListings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-card">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No active food listings right now</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Do you have surplus meals, bread, groceries, or banquet items today? Put them to good use before they spoil!
          </p>
          <button
            onClick={onAddClick}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition inline-flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Food Donation</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeListings.map((donation) => (
            <div
              key={donation.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-elevated transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={donation.image_urls[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                    alt={donation.food_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <CategoryBadge category={donation.category} />
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={donation.status} />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold flex items-center justify-between">
                    <span>
                      Available: <strong className="text-emerald-300">{donation.available_quantity}</strong> / {donation.total_quantity} {donation.quantity_unit}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1">{donation.food_name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {donation.description}
                  </p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center truncate">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 mr-1.5 flex-shrink-0" />
                      <span className="truncate">{donation.pickup_address}</span>
                    </p>
                    <p className="flex items-center text-warm-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-warm-600 flex-shrink-0" />
                      <span>Expires: {new Date(donation.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(donation.expiry_time).toLocaleDateString()})</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedDonation(donation)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    setEditingDonation(donation);
                    setEditQuantity(donation.total_quantity);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-700 transition"
                  title="Edit Quantity"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCancelDonation(donation.id, donation.food_name)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition"
                  title="Cancel Listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedDonation(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 mb-3">
              <CategoryBadge category={selectedDonation.category} />
              <StatusBadge status={selectedDonation.status} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{selectedDonation.food_name}</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedDonation.description}</p>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Available / Total:</span>
                <span className="font-bold text-brand-700">{selectedDonation.available_quantity} / {selectedDonation.total_quantity} {selectedDonation.quantity_unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Pickup Address:</span>
                <span className="font-medium text-right max-w-xs">{selectedDonation.pickup_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Expiry Time:</span>
                <span className="font-bold text-warm-700">{new Date(selectedDonation.expiry_time).toLocaleString()}</span>
              </div>
              {selectedDonation.pickup_instructions && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-500 block mb-0.5">Instructions:</span>
                  <span className="text-slate-700">{selectedDonation.pickup_instructions}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedDonation(null)}
              className="w-full mt-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Quantity Modal */}
      {editingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 mb-1">Edit Total Quantity</h3>
            <p className="text-xs text-slate-500 mb-4">{editingDonation.food_name}</p>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              New Total ({editingDonation.quantity_unit})
            </label>
            <input
              type="number"
              min="1"
              value={editQuantity}
              onChange={(e) => setEditQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => setEditingDonation(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                disabled={isUpdating}
                onClick={handleSaveEdit}
                className="flex-1 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
