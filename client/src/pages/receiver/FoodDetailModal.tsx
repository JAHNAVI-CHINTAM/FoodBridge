import React, { useState } from 'react';
import { Donation } from '../../types';
import { StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { GoogleMapViewer } from '../../components/common/GoogleMapViewer';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  X, 
  MapPin, 
  Clock, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Minus, 
  Plus, 
  ArrowRight,
  Navigation,
  ExternalLink,
  Phone,
  MessageCircle
} from 'lucide-react';

interface Props {
  donation: Donation | null;
  onClose: () => void;
  onBookingSuccess: (result: any) => void;
  userCoords?: { lat: number; lng: number } | null;
}

export const FoodDetailModal: React.FC<Props> = ({
  donation,
  onClose,
  onBookingSuccess,
  userCoords
}) => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [quantityToBook, setQuantityToBook] = useState<number>(1);
  const [receiverNotes, setReceiverNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState<any | null>(null);

  if (!donation) return null;

  const maxAvailable = donation.available_quantity;

  const handleBookFood = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setErrorMsg('You must be logged in as a receiver to book food.');
      return;
    }
    if (quantityToBook <= 0) {
      setErrorMsg('Please select at least 1 unit to reserve.');
      return;
    }
    if (quantityToBook > maxAvailable) {
      setErrorMsg(`Only ${maxAvailable} ${donation.quantity_unit} available.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.bookFood({
        donation_id: donation.id,
        receiver_id: user.id,
        quantity: Number(quantityToBook),
        receiver_notes: receiverNotes.trim() || undefined
      });

      setBookingConfirmed(result);
      addToast(
        'success',
        'Booking Confirmed!',
        `Reserved ${quantityToBook} ${donation.quantity_unit} of ${donation.food_name}. Ref: ${result.booking.booking_reference}`
      );
      onBookingSuccess(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete booking.');
      addToast('error', 'Booking Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {bookingConfirmed ? (
          /* Confirmation Success Screen */
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              Booking Ref: {bookingConfirmed.booking.booking_reference}
            </span>
            <h3 className="text-2xl font-black text-white mt-3">Food Reserved Successfully!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              The donor has been notified. Present your booking reference upon pickup.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Reserved Item:</span>
                <span className="font-bold text-white">{donation.food_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity Reserved:</span>
                <span className="font-bold text-amber-400">{bookingConfirmed.booking.quantity_reserved} {donation.quantity_unit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Donor Contact:</span>
                {donation.donor?.phone ? (
                  <div className="flex items-center space-x-1.5">
                    <a
                      href={`tel:${donation.donor.phone}`}
                      className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold hover:bg-emerald-900 transition text-[11px] flex items-center space-x-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                    {donation.donor.whatsapp_enabled !== false && (
                      <a
                        href={`https://wa.me/${donation.donor.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello! I have confirmed booking ${bookingConfirmed.booking.booking_reference} for ${donation.food_name} on Food Bridge.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition text-[11px] flex items-center space-x-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="font-semibold text-slate-300">{donation.donor?.full_name || 'Donor'}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pickup Location:</span>
                <span className="font-medium text-right max-w-[200px] text-slate-200">{donation.pickup_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pickup Deadline:</span>
                <span className="font-bold text-amber-400">{new Date(donation.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(donation.expiry_time).toLocaleDateString()})</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${donation.latitude},${donation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate on Google Maps</span>
              </a>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Food Details & Reservation Form */
          <div>
            {/* Image Banner */}
            <div className="relative h-60 rounded-2xl overflow-hidden bg-slate-800 mb-6">
              <img
                src={donation.image_urls[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                alt={donation.food_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <CategoryBadge category={donation.category} />
              </div>
              <div className="absolute top-3 right-12">
                <StatusBadge status={donation.status} />
              </div>
              <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center justify-between border border-slate-700/50">
                <span>Total: {donation.available_quantity} {donation.quantity_unit} Available</span>
                <span className="text-amber-400 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Expires in {Math.max(1, Math.round((new Date(donation.expiry_time).getTime() - Date.now()) / (3600 * 1000)))}h
                </span>
              </div>
            </div>

            {/* Title & Donor Info */}
            <div className="mb-4">
              <h2 className="text-2xl font-black text-white tracking-tight">{donation.food_name}</h2>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200">
                    {donation.donor?.organization_name || donation.donor?.full_name || 'Verified Food Donor'}
                  </span>
                  {donation.distanceKm !== undefined && donation.distanceKm !== null && (
                    <span className="text-slate-500">• Approx {donation.distanceKm} km away</span>
                  )}
                </div>

                {/* Donor Phone Contact Option (if opted in) */}
                {donation.donor?.phone && donation.donor.phone_contact_opt_in !== false && (
                  <div className="flex items-center space-x-1.5">
                    <a
                      href={`tel:${donation.donor.phone}`}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-800 transition"
                      title="Direct Phone Call"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{donation.donor.phone}</span>
                    </a>
                    {donation.donor.whatsapp_enabled !== false && (
                      <a
                        href={`https://wa.me/${donation.donor.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm reaching out from Food Bridge regarding your food donation: ${donation.food_name}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              {donation.description}
            </p>

            {/* Freshness & Hygiene Guarantee */}
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-start space-x-3 text-xs text-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-300">Verified Food Safety Confirmation</p>
                <p className="opacity-90 mt-0.5 leading-relaxed text-slate-300">
                  The donor verified this food was prepared hygienically and kept under proper temperature control.
                </p>
              </div>
            </div>

            {/* Pickup Details & Interactive Map */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Pickup Location & Instructions
              </h4>
              <GoogleMapViewer
                singleLocation={{
                  lat: donation.latitude,
                  lng: donation.longitude,
                  address: donation.pickup_address,
                  title: donation.food_name
                }}
                height="190px"
              />
              {donation.pickup_instructions && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                  <span className="font-bold text-slate-200">Donor Notes:</span> {donation.pickup_instructions}
                </div>
              )}
            </div>

            {/* Reservation Form */}
            <form onSubmit={handleBookFood} className="border-t border-slate-800 pt-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Quantity to Reserve ({donation.quantity_unit})
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setQuantityToBook((q) => Math.max(1, q - 1))}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={maxAvailable}
                    value={quantityToBook}
                    onChange={(e) => setQuantityToBook(Math.min(maxAvailable, Math.max(1, Number(e.target.value))))}
                    className="w-24 text-center font-black text-lg py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantityToBook((q) => Math.min(maxAvailable, q + 1))}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantityToBook(maxAvailable)}
                    className="text-xs font-bold text-amber-400 hover:bg-amber-950/50 px-3 py-2 rounded-xl transition border border-amber-800/60"
                  >
                    Reserve All ({maxAvailable} {donation.quantity_unit})
                  </button>
                </div>
              </div>

              {/* Receiver Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Pickup Note / Arrival Time Estimate (Optional)
                </label>
                <input
                  type="text"
                  value={receiverNotes}
                  onChange={(e) => setReceiverNotes(e.target.value)}
                  placeholder="e.g. Arriving with shelter van at 4:30 PM."
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Book Button */}
              <button
                type="submit"
                disabled={isSubmitting || maxAvailable <= 0}
                className="w-full py-4 rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Reserving Food...' : `Book Food (${quantityToBook} ${donation.quantity_unit})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
