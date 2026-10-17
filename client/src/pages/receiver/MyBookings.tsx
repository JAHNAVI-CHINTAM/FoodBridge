import React, { useState } from 'react';
import { Booking } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { GoogleMapViewer } from '../../components/common/GoogleMapViewer';
import { FoodTrackingModal } from '../../components/tracking/FoodTrackingModal';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { 
  PackageCheck, 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  Building2, 
  XCircle, 
  X,
  AlertTriangle,
  MessageSquare,
  Truck,
  CheckCircle
} from 'lucide-react';

interface Props {
  bookings: Booking[];
  onRefresh: () => void;
}

export const MyBookings: React.FC<Props> = ({ bookings, onRefresh }) => {
  const { addToast } = useNotifications();
  const [mapBooking, setMapBooking] = useState<Booking | null>(null);
  const [trackingBooking, setTrackingBooking] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Deduplicate bookings by ID
  const seenIds = new Set<string>();
  const uniqueBookings = bookings.filter(b => {
    if (seenIds.has(b.id)) return false;
    seenIds.add(b.id);
    return true;
  });

  const handleCancelConfirm = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);
    try {
      await api.cancelBooking(cancellingBooking.id, cancelReason);
      addToast(
        'info',
        'Booking Cancelled',
        `Reservation ${cancellingBooking.booking_reference} cancelled. Reserved quantity returned to donor inventory.`
      );
      setCancellingBooking(null);
      setCancelReason('');
      onRefresh();
    } catch (err: any) {
      addToast('error', 'Cancellation Failed', err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const getTrackingStageBadge = (b: Booking) => {
    const stage = b.tracking_stage || (b.booking_status === 'completed' ? 'distributed' : 'confirmed');
    switch (stage) {
      case 'on_the_way':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
            <Truck className="w-3 h-3 mr-1 text-amber-600 animate-bounce" />
            On The Way to Pickup
          </span>
        );
      case 'arrived_at_pickup':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full">
            <MapPin className="w-3 h-3 mr-1 text-blue-600 animate-pulse" />
            Arrived at Kitchen
          </span>
        );
      case 'picked_up':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-purple-800 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-full">
            <PackageCheck className="w-3 h-3 mr-1 text-purple-600" />
            Food Handed Over
          </span>
        );
      case 'distributed':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
            Delivered & Distributed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
            Booking Confirmed
          </span>
        );
    }
  };

  return (
    <div>
      <div className="pb-6 mb-6 border-b border-slate-200/80">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">My Food Bookings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Track all your reserved surplus meals in real time, navigate to pickup spots, and coordinate with donors via call/WhatsApp.
        </p>
      </div>

      {uniqueBookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-card">
          <div className="w-16 h-16 rounded-3xl bg-warm-50 text-warm-700 flex items-center justify-center mx-auto mb-4">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">You haven't booked any food yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Explore the available food feed to discover fresh nutritious food listed by local hotels and caterers.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {uniqueBookings.map((b) => {
            const rawDonorPhone = b.donor?.phone?.trim() || '';
            const hasDonorPhone = rawDonorPhone.length > 0;
            const isDonorOptedIn = b.donor?.phone_contact_opt_in !== false;
            const canShowDonorPhone = hasDonorPhone && isDonorOptedIn;
            const cleanDonorPhone = rawDonorPhone.replace(/[^0-9]/g, '');
            const isWhatsappEnabled = canShowDonorPhone && (b.donor?.whatsapp_enabled !== false) && cleanDonorPhone.length >= 10;
            const formattedWhatsappNum = cleanDonorPhone.startsWith('91') ? cleanDonorPhone : cleanDonorPhone.length === 10 ? `91${cleanDonorPhone}` : cleanDonorPhone;
            const whatsappMsg = encodeURIComponent(`Hello! Reaching out from ${b.receiver?.organization_name || 'Receiver'} regarding Food Bridge booking ref ${b.booking_reference}.`);

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 transition-all hover:border-brand-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Food & Donor Details */}
                  <div className="flex items-start space-x-4">
                    <img
                      src={b.donation?.image_urls[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
                      alt={b.donation?.food_name || 'Food item'}
                      className="w-20 h-20 rounded-2xl object-cover bg-slate-100 flex-shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                          Ref: {b.booking_reference}
                        </span>
                        <StatusBadge status={b.booking_status} />
                        {getTrackingStageBadge(b)}
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        {b.donation?.food_name || 'Food Donation'}
                      </h3>
                      <p className="text-xs font-bold text-warm-700 mt-0.5">
                        Reserved: {b.quantity_reserved} {b.donation?.quantity_unit || 'Units'}
                      </p>

                      {/* Donor Contact Details & Actions */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800 flex items-center">
                          <Building2 className="w-3.5 h-3.5 text-brand-600 mr-1" />
                          Donor: {b.donor?.organization_name || b.donor?.full_name || 'Kitchen'}
                        </span>

                        {canShowDonorPhone ? (
                          <div className="flex items-center space-x-2">
                            <a
                              href={`tel:${cleanDonorPhone}`}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold transition text-xs border border-brand-200"
                              title="Call Donor"
                            >
                              <Phone className="w-3.5 h-3.5 text-brand-700" />
                              <span>{rawDonorPhone}</span>
                            </a>

                            {isWhatsappEnabled && (
                              <a
                                href={`https://wa.me/${formattedWhatsappNum}?text=${whatsappMsg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition text-xs border border-emerald-200"
                                title="WhatsApp Donor"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        ) : !isDonorOptedIn ? (
                          <span className="inline-flex items-center text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Donor phone kept private
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            No direct phone provided
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Pickup & Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right text-xs text-slate-500">
                      <p className="flex items-center lg:justify-end text-warm-700 font-semibold">
                        <Clock className="w-3.5 h-3.5 mr-1 text-warm-600" />
                        Pickup Deadline: {b.donation ? new Date(b.donation.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'As scheduled'}
                      </p>
                      <p className="flex items-center lg:justify-end text-slate-700 font-medium mt-1 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-brand-600 flex-shrink-0" />
                        <span className="truncate">{b.donation?.pickup_address}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {/* Prominent Track Food Pickup Button */}
                      <button
                        onClick={() => setTrackingBooking(b)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-warm-500 hover:bg-warm-600 text-white text-xs font-black shadow-sm transition flex items-center justify-center space-x-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Food Pickup</span>
                      </button>

                      <button
                        onClick={() => setMapBooking(b)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center space-x-1"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Map</span>
                      </button>

                      {b.donation && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${b.donation.latitude},${b.donation.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Directions</span>
                        </a>
                      )}

                      {b.booking_status === 'confirmed' && (
                        <button
                          onClick={() => setCancellingBooking(b)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-700 transition"
                          title="Cancel Booking"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Map Dialog */}
      {mapBooking && mapBooking.donation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setMapBooking(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-1">Pickup Location</h3>
            <p className="text-xs text-slate-500 mb-4">{mapBooking.donation.pickup_address}</p>

            <GoogleMapViewer
              singleLocation={{
                lat: mapBooking.donation.latitude,
                lng: mapBooking.donation.longitude,
                address: mapBooking.donation.pickup_address,
                title: mapBooking.donation.food_name
              }}
              height="260px"
            />

            <button
              onClick={() => setMapBooking(null)}
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Live Food Tracking Modal */}
      <FoodTrackingModal
        booking={trackingBooking}
        isOpen={!!trackingBooking}
        onClose={() => setTrackingBooking(null)}
        onUpdated={() => {
          onRefresh();
          const refreshed = bookings.find((bk) => bk.id === trackingBooking?.id);
          if (refreshed) setTrackingBooking(refreshed);
        }}
      />

      {/* Cancellation Confirmation Dialog */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">Cancel Food Reservation?</h3>
            <p className="text-xs text-slate-500 text-center mb-4 leading-relaxed">
              Cancelling booking <strong>{cancellingBooking.booking_reference}</strong> will immediately return the <strong>{cancellingBooking.quantity_reserved} units</strong> back to the public donor inventory so another shelter can claim it.
            </p>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-4 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            <div className="flex space-x-2">
              <button
                disabled={isCancelling}
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Keep Booking
              </button>
              <button
                disabled={isCancelling}
                onClick={handleCancelConfirm}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
