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
  Mail, 
  Calendar, 
  CheckCircle, 
  Building, 
  MessageSquare, 
  Truck, 
  X,
  Navigation
} from 'lucide-react';

interface Props {
  bookings: Booking[];
  onRefresh: () => void;
}

export const DonorBookings: React.FC<Props> = ({ bookings, onRefresh }) => {
  const { addToast } = useNotifications();
  const [mapBooking, setMapBooking] = useState<Booking | null>(null);
  const [trackingBooking, setTrackingBooking] = useState<Booking | null>(null);

  // Deduplicate bookings by ID
  const seenIds = new Set<string>();
  const uniqueBookings = bookings.filter(b => {
    if (seenIds.has(b.id)) return false;
    seenIds.add(b.id);
    return true;
  });

  const handleCompletePickup = async (bookingId: string, ref: string) => {
    try {
      await api.completeBooking(bookingId);
      addToast('success', 'Pickup Marked as Completed', `Booking ${ref} was fulfilled.`);
      onRefresh();
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const getTrackingStageBadge = (b: Booking) => {
    const stage = b.tracking_stage || (b.booking_status === 'completed' ? 'distributed' : 'confirmed');
    switch (stage) {
      case 'on_the_way':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
            <Truck className="w-3 h-3 mr-1 text-amber-600 animate-bounce" />
            Receiver On The Way
          </span>
        );
      case 'arrived_at_pickup':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full">
            <MapPin className="w-3 h-3 mr-1 text-blue-600 animate-pulse" />
            Arrived at Your Gate / Bay
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
            Delivered to Beneficiaries
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
            Awaiting Receiver Dispatch
          </span>
        );
    }
  };

  return (
    <div className="text-white">
      <div className="pb-6 mb-6 border-b border-slate-800">
        <h2 className="text-xl font-black text-white tracking-tight">Received Bookings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Surplus food reservations made by verified NGOs with live food tracking and direct phone/WhatsApp contact.
        </p>
      </div>

      {uniqueBookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto mb-4">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No bookings received yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            As soon as an NGO or shelter reserves food from your active listings, their pickup details and contact information will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {uniqueBookings.map((b) => {
            const rawReceiverPhone = b.receiver?.phone?.trim() || '';
            const hasReceiverPhone = rawReceiverPhone.length > 0;
            const isReceiverOptedIn = b.receiver?.phone_contact_opt_in !== false;
            const canShowReceiverPhone = hasReceiverPhone && isReceiverOptedIn;
            const cleanReceiverPhone = rawReceiverPhone.replace(/[^0-9]/g, '');
            const isWhatsappEnabled = canShowReceiverPhone && (b.receiver?.whatsapp_enabled !== false) && cleanReceiverPhone.length >= 10;
            const formattedWhatsappNum = cleanReceiverPhone.startsWith('91') ? cleanReceiverPhone : cleanReceiverPhone.length === 10 ? `91${cleanReceiverPhone}` : cleanReceiverPhone;
            const whatsappMsg = encodeURIComponent(`Hello! Reaching out from ${b.donor?.organization_name || 'Donor'} regarding Food Bridge booking ref ${b.booking_reference}.`);

            return (
              <div
                key={b.id}
                className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800/90 shadow-2xl p-5 transition-all hover:border-slate-700 text-white"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Food Snippet & Receiver Details */}
                  <div className="flex items-start space-x-4">
                    <img
                      src={b.donation?.image_urls[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
                      alt={b.donation?.food_name || 'Food item'}
                      className="w-20 h-20 rounded-2xl object-cover bg-slate-950 flex-shrink-0 opacity-90"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-800">
                          {b.booking_reference}
                        </span>
                        <StatusBadge status={b.booking_status} />
                        {getTrackingStageBadge(b)}
                      </div>
                      <h3 className="font-extrabold text-base text-white">
                        {b.donation?.food_name || 'Food Donation'}
                      </h3>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5">
                        Quantity Reserved: {b.quantity_reserved} {b.donation?.quantity_unit || 'Units'}
                      </p>

                      {/* Receiver Contact Information */}
                      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
                        <span className="font-bold text-white flex items-center">
                          <Building className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                          {b.receiver?.organization_name || b.receiver?.full_name || 'Community Receiver'}
                        </span>
                        
                        {/* Direct Phone & WhatsApp contact buttons */}
                        {canShowReceiverPhone ? (
                          <div className="flex items-center space-x-2">
                            <a
                              href={`tel:${cleanReceiverPhone}`}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 font-bold transition text-xs border border-emerald-800"
                              title="Call Receiver"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{rawReceiverPhone}</span>
                            </a>

                            {isWhatsappEnabled && (
                              <a
                                href={`https://wa.me/${formattedWhatsappNum}?text=${whatsappMsg}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-950/70 hover:bg-teal-900/80 text-teal-300 font-bold transition text-xs border border-teal-800"
                                title="WhatsApp Receiver"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        ) : !isReceiverOptedIn ? (
                          <span className="inline-flex items-center text-[11px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                            Receiver phone kept private
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            No direct phone provided
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Track Food Pickup, Map, Handover) */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="text-left lg:text-right text-xs text-slate-400">
                      <p className="flex items-center lg:justify-end">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        Booked {new Date(b.booked_at).toLocaleDateString()} at{' '}
                        {new Date(b.booked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md transition flex items-center justify-center space-x-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Food Pickup</span>
                      </button>

                      <button
                        onClick={() => setMapBooking(b)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Map</span>
                      </button>

                      {b.booking_status === 'confirmed' && (
                        <button
                          onClick={() => handleCompletePickup(b.id, b.booking_reference)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition flex items-center justify-center space-x-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Handover</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 relative text-white">
            <button
              onClick={() => setMapBooking(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-1">Pickup Location & Directions</h3>
            <p className="text-xs text-slate-400 mb-4">{mapBooking.donation.food_name}</p>

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
              className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
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
          // Update trackingBooking with fresh state
          const refreshed = bookings.find((bk) => bk.id === trackingBooking?.id);
          if (refreshed) setTrackingBooking(refreshed);
        }}
      />
    </div>
  );
};
