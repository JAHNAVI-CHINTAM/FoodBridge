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
    <div className="text-white">
      <div className="pb-6 mb-6 border-b border-slate-800">
        <h2 className="text-xl font-black text-white tracking-tight">My Food Bookings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Track all your reserved surplus meals in real time, navigate to pickup spots, and coordinate with donors via call/WhatsApp.
        </p>
      </div>

      {uniqueBookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center mx-auto mb-4">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">You haven't booked any food yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
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
                className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/90 shadow-2xl p-5 transition-all hover:border-amber-500/40 text-white"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Food & Donor Details */}
                  <div className="flex items-start space-x-4">
                    <img
                      src={b.donation?.image_urls[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
                      alt={b.donation?.food_name || 'Food item'}
                      className="w-20 h-20 rounded-2xl object-cover bg-slate-800 flex-shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-200 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">
                          Ref: {b.booking_reference}
                        </span>
                        <StatusBadge status={b.booking_status} />
                        {getTrackingStageBadge(b)}
                      </div>
                      <h3 className="font-extrabold text-base text-white">
                        {b.donation?.food_name || 'Food Donation'}
                      </h3>
                      <p className="text-xs font-bold text-amber-400 mt-0.5">
                        Reserved: {b.quantity_reserved} {b.donation?.quantity_unit || 'Units'}
                      </p>

                      {/* Donor Contact Details & Actions */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                        <span className="font-semibold text-slate-200 flex items-center">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                          Donor: {b.donor?.organization_name || b.donor?.full_name || 'Kitchen'}
                        </span>

                        {canShowDonorPhone ? (
                          <div className="flex items-center space-x-2">
                            <a
                              href={`tel:${cleanDonorPhone}`}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 font-bold transition text-xs border border-emerald-800/80"
                              title="Call Donor"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{rawDonorPhone}</span>
                            </a>

                            {isWhatsappEnabled && (
                              <a
                                href={`https://wa.me/${formattedWhatsappNum}?text=${whatsappMsg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 font-bold transition text-xs border border-emerald-800/80"
                                title="WhatsApp Donor"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        ) : !isDonorOptedIn ? (
                          <span className="inline-flex items-center text-[11px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                            Donor phone kept private
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            No direct phone provided
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Pickup & Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="text-left lg:text-right text-xs text-slate-400">
                      <p className="flex items-center lg:justify-end text-amber-400 font-semibold">
                        <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" />
                        Pickup Deadline: {b.donation ? new Date(b.donation.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'As scheduled'}
                      </p>
                      <p className="flex items-center lg:justify-end text-slate-300 font-medium mt-1 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{b.donation?.pickup_address}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {/* Prominent Track Food Pickup Button */}
                      <button
                        onClick={() => setTrackingBooking(b)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-sm transition flex items-center justify-center space-x-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Food Pickup</span>
                      </button>

                      <button
                        onClick={() => setMapBooking(b)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1 border border-slate-700"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Map</span>
                      </button>

                      {b.donation && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${b.donation.latitude},${b.donation.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Directions</span>
                        </a>
                      )}

                      {b.booking_status === 'confirmed' && (
                        <button
                          onClick={() => setCancellingBooking(b)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-400 transition border border-slate-700 hover:border-red-800"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setMapBooking(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-1">Pickup Location</h3>
            <p className="text-xs text-slate-400 mb-4">{mapBooking.donation.pickup_address}</p>

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
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition border border-slate-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-white">
            <div className="w-12 h-12 rounded-full bg-red-950/80 text-red-400 border border-red-900/80 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white text-center mb-1">Cancel Food Reservation?</h3>
            <p className="text-xs text-slate-400 text-center mb-4 leading-relaxed">
              Cancelling booking <strong className="text-white">{cancellingBooking.booking_reference}</strong> will immediately return the <strong className="text-white">{cancellingBooking.quantity_reserved} units</strong> back to the public donor inventory so another shelter can claim it.
            </p>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)..."
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex space-x-2">
              <button
                disabled={isCancelling}
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700"
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
