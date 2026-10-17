import React, { useState } from 'react';
import { Booking, FoodTrackingStage } from '../../types';
import { GoogleMapViewer } from '../common/GoogleMapViewer';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Truck, 
  PackageCheck, 
  HeartHandshake, 
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Building,
  User,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface Props {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const TRACKING_STEPS: { stage: FoodTrackingStage; title: string; desc: string; icon: any }[] = [
  {
    stage: 'confirmed',
    title: 'Booking Confirmed',
    desc: 'Surplus food reserved and awaiting pickup dispatch',
    icon: CheckCircle2,
  },
  {
    stage: 'on_the_way',
    title: 'On The Way for Pickup',
    desc: 'Receiver / vehicle en route to donor kitchen',
    icon: Truck,
  },
  {
    stage: 'arrived_at_pickup',
    title: 'Arrived at Pickup Location',
    desc: 'Receiver arrived at kitchen loading bay / gate',
    icon: MapPin,
  },
  {
    stage: 'picked_up',
    title: 'Food Handed Over',
    desc: 'Donor verified booking code and handed over fresh food',
    icon: PackageCheck,
  },
  {
    stage: 'distributed',
    title: 'Distributed to Beneficiaries',
    desc: 'Nourishing meals served at shelter or care center',
    icon: HeartHandshake,
  },
];

export const FoodTrackingModal: React.FC<Props> = ({
  booking,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [isUpdating, setIsUpdating] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen || !booking) return null;

  const isDonor = user?.id === booking.donor_id;
  const currentStage: FoodTrackingStage = booking.tracking_stage || (booking.booking_status === 'completed' ? 'distributed' : 'confirmed');

  const currentStepIndex = TRACKING_STEPS.findIndex((s) => s.stage === currentStage);

  // Counterpart contact info
  const counterpart = isDonor ? booking.receiver : booking.donor;
  const counterpartRole = isDonor ? 'Receiver' : 'Donor';
  const rawPhone = counterpart?.phone?.trim() || '';
  const hasPhone = rawPhone.length > 0;
  const isOptedIn = counterpart?.phone_contact_opt_in !== false;
  const canShowPhone = hasPhone && isOptedIn;
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const isWhatsappEnabled = canShowPhone && (counterpart?.whatsapp_enabled !== false) && cleanPhone.length >= 10;

  const formattedWhatsappNumber = cleanPhone.startsWith('91') 
    ? cleanPhone 
    : cleanPhone.length === 10 
      ? `91${cleanPhone}` 
      : cleanPhone;

  const whatsappMessage = encodeURIComponent(
    `Hello! Reaching out via Food Bridge regarding food reservation ${booking.booking_reference} for "${booking.donation?.food_name || 'Food item'}".`
  );
  const whatsappUrl = `https://wa.me/${formattedWhatsappNumber}?text=${whatsappMessage}`;

  const handleCopy = (text: string, type: 'ref' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'ref') {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
    addToast('info', 'Copied to Clipboard', text);
  };

  const handleAdvanceStage = async (nextStage: FoodTrackingStage) => {
    setIsUpdating(true);
    try {
      await api.updateTrackingStatus(booking.id, nextStage, customNote.trim() || undefined);
      addToast('success', 'Food Tracking Updated', `Stage updated to: ${nextStage.replace(/_/g, ' ')}`);
      setCustomNote('');
      onUpdated();
    } catch (err: any) {
      addToast('error', 'Tracking Update Failed', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-brand-800 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                {booking.booking_reference}
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse" />
                Live Food Tracking
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1.5">
              {booking.donation?.food_name || 'Food Donation'}
            </h3>
            <p className="text-xs text-slate-500">
              Reserved: <strong className="text-slate-800">{booking.quantity_reserved} {booking.donation?.quantity_unit || 'units'}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. DIRECT CONTACT SYSTEM (CALL & WHATSAPP WITH PRIVACY / OPT-IN SUPPORT) */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-emerald-50 border border-brand-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-brand-700 flex items-center justify-center shadow-sm border border-brand-100 flex-shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-800">
                  {counterpartRole} Contact Information
                </p>
                {canShowPhone && (
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Direct Contact Opted-In
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black text-slate-900">
                {counterpart?.organization_name || counterpart?.full_name || 'Food Partner'}
              </h4>

              {canShowPhone ? (
                <p className="text-xs text-slate-600 flex items-center font-semibold mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-brand-600 mr-1" />
                  <span>{rawPhone}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(rawPhone, 'phone')}
                    className="ml-2 text-slate-400 hover:text-slate-700 p-0.5"
                    title="Copy Phone Number"
                  >
                    {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </p>
              ) : !isOptedIn ? (
                <p className="text-xs text-slate-500 flex items-center font-medium mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 mr-1" />
                  <span className="text-amber-700 font-semibold">Phone kept private by user preference</span>
                </p>
              ) : (
                <p className="text-xs text-slate-400 flex items-center mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  <span>No phone number provided</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Call & WhatsApp Action Buttons */}
          {canShowPhone ? (
            <div className="flex items-center space-x-2">
              <a
                href={`tel:${cleanPhone}`}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs transition shadow-sm flex items-center justify-center space-x-1.5"
              >
                <Phone className="w-4 h-4" />
                <span>Call {counterpartRole}</span>
              </a>

              {isWhatsappEnabled && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 bg-white/80 border border-slate-200 px-3 py-2 rounded-xl">
              Coordinate via in-app timeline & notes
            </div>
          )}
        </div>

        {/* 2. SWIGGY/ZOMATO STYLE VISUAL TIMELINE PROGRESS */}
        <div className="mt-6 pt-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Food Pickup & Delivery Progress
            </h4>
            <span className="text-xs font-bold text-warm-700 bg-warm-50 px-2.5 py-1 rounded-full border border-warm-200">
              Stage {Math.min(currentStepIndex + 1, 5)} of 5
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {TRACKING_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;

              // Check if timeline event recorded for this step
              const eventRecord = booking.tracking_timeline?.find((e) => e.stage === step.stage);

              return (
                <div key={step.stage} className="relative flex items-start space-x-4">
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-warm-500 text-white shadow-md animate-pulse'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <h5 className={`text-sm font-bold ${isCurrent ? 'text-warm-700 font-black' : isPast ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.title}
                      </h5>
                      {eventRecord && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(eventRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                          {new Date(eventRecord.timestamp).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                    {eventRecord?.note && (
                      <p className="text-xs text-brand-800 bg-brand-50/70 border border-brand-200/60 p-2 rounded-lg mt-1.5 font-medium">
                        "{eventRecord.note}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. TRACKING STAGE UPDATE ACTIONS */}
        <div className="mt-8 pt-5 border-t border-slate-100 bg-slate-50/80 -mx-6 -mb-6 p-6 rounded-b-3xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Update Real-Time Tracking Stage
          </h4>

          {/* Receiver Actions */}
          {!isDonor && (
            <div className="space-y-3">
              {currentStage === 'confirmed' && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleAdvanceStage('on_the_way')}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-warm-500 to-orange-600 hover:from-warm-600 hover:to-orange-700 text-white font-extrabold text-xs transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Truck className="w-4 h-4" />
                  <span>Mark as "On The Way for Pickup"</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}

              {currentStage === 'on_the_way' && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleAdvanceStage('arrived_at_pickup')}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-700 hover:from-brand-700 hover:to-emerald-800 text-white font-extrabold text-xs transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4" />
                  <span>I Have Arrived at Donor Pickup Location</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}

              {currentStage === 'picked_up' && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleAdvanceStage('distributed')}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Confirm Meals Distributed to Shelter Beneficiaries</span>
                </button>
              )}
            </div>
          )}

          {/* Donor Actions */}
          {isDonor && (
            <div className="space-y-3">
              {(currentStage === 'arrived_at_pickup' || currentStage === 'on_the_way' || currentStage === 'confirmed') && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleAdvanceStage('picked_up')}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-700 hover:from-brand-700 hover:to-emerald-800 text-white font-extrabold text-xs transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Verify Handover & Complete Food Transfer</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          )}

          {currentStage === 'distributed' && (
            <div className="p-3 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <span>Full lifecycle completed: Fresh food rescued, safely handed over, and nourished the community!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
