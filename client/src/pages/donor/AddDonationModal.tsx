import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { FoodCategory, QuantityUnit, Donation } from '../../types';
import { LocationAutocomplete } from '../../components/common/LocationAutocomplete';
import { GoogleMapViewer } from '../../components/common/GoogleMapViewer';
import { 
  X, 
  Upload, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDonation: Donation) => void;
}

const CATEGORIES: FoodCategory[] = [
  'Cooked Meals',
  'Fruits',
  'Vegetables',
  'Bakery',
  'Dairy',
  'Packaged Food',
  'Grains',
  'Beverages',
  'Other'
];

const QUANTITY_UNITS: QuantityUnit[] = [
  'Packets',
  'Items',
  'Kilograms (kg)',
  'Grams (g)',
  'Litres (L)',
  'Millilitres (mL)'
];

// Presets for quick visual selection
const SAMPLE_FOOD_IMAGES = [
  { label: 'Cooked Meals', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bakery', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fruits', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dairy', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80' },
  { label: 'Vegetables', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80' },
];

export const AddDonationModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  // Form states
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Cooked Meals');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(SAMPLE_FOOD_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(20);
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>('Packets');

  // Dates
  const now = new Date();
  const inEightHours = new Date(now.getTime() + 8 * 3600 * 1000);
  const [prepTime, setPrepTime] = useState(new Date(now.getTime() - 3600 * 1000).toISOString().slice(0, 16));
  const [expiryTime, setExpiryTime] = useState(inEightHours.toISOString().slice(0, 16));

  // Location
  const [pickupAddress, setPickupAddress] = useState(user?.address || 'MG Road, Bengaluru');
  const [latitude, setLatitude] = useState(12.9756);
  const [longitude, setLongitude] = useState(77.6083);
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [foodSafetyConfirmed, setFoodSafetyConfirmed] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setErrorMsg('You must be logged in as a donor.');
      return;
    }
    if (!foodName.trim()) {
      setErrorMsg('Please specify the food name.');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setErrorMsg('Please enter a valid positive quantity.');
      return;
    }
    if (new Date(expiryTime) <= new Date()) {
      setErrorMsg('Estimated expiry time must be in the future.');
      return;
    }
    if (!foodSafetyConfirmed) {
      setErrorMsg('You must confirm food freshness and hygiene standards.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalImageUrl = customImageUrl.trim() || selectedImage;
      const created = await api.createDonation({
        donor_id: user.id,
        food_name: foodName.trim(),
        category,
        description: description.trim() || `Freshly prepared surplus ${foodName} available for immediate pickup.`,
        image_urls: [finalImageUrl],
        total_quantity: Number(quantity),
        quantity_unit: quantityUnit,
        preparation_time: prepTime ? new Date(prepTime).toISOString() : null,
        expiry_time: new Date(expiryTime).toISOString(),
        pickup_address: pickupAddress,
        latitude,
        longitude,
        pickup_instructions: pickupInstructions.trim() || 'Please contact the kitchen dispatch upon arrival.',
        food_safety_confirmed: foodSafetyConfirmed
      });

      addToast('success', 'Donation Published!', `"${created.food_name}" is now visible to receivers.`);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish donation.');
      addToast('error', 'Submission Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Donor Portal
            </span>
            <h3 className="text-xl font-black text-white mt-1">Add Food Donation</h3>
            <p className="text-xs text-slate-400">Provide details so shelters and receivers can discover and collect your surplus food.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Food Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Food Name / Title *
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Steamed Rice & Dal, Assorted Sandwiches"
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Food Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Total Available Quantity *
              </label>
              <input
                type="number"
                min="0.5"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 25"
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Quantity Unit *
              </label>
              <select
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value as QuantityUnit)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {QUANTITY_UNITS.map((unit) => (
                  <option key={unit} value={unit} className="bg-slate-900 text-white">
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Food Description & Contents *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe ingredients, dietary flags (e.g. 100% Vegetarian), container type, packaging..."
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Image Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Food Image
            </label>
            <div className="flex space-x-2.5 overflow-x-auto pb-2">
              {SAMPLE_FOOD_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImage(img.url);
                    setCustomImageUrl('');
                  }}
                  className={`relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition ${
                    selectedImage === img.url && !customImageUrl
                      ? 'border-emerald-500 ring-2 ring-emerald-400/40'
                      : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] font-bold py-0.5 text-center truncate">
                    {img.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Or paste an image URL here..."
                className="flex-1 px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Time Windows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Prepared / Cooked Time
              </label>
              <input
                type="datetime-local"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Estimated Expiry Time *
              </label>
              <input
                type="datetime-local"
                required
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Location Autocomplete & Interactive Pin Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Pickup Address & Google Maps Pin *
            </label>
            <LocationAutocomplete
              value={pickupAddress}
              onChange={(address, lat, lng) => {
                setPickupAddress(address);
                setLatitude(lat);
                setLongitude(lng);
              }}
              placeholder="Search kitchen address, hotel name, or street..."
            />

            {/* Interactive Map Coordinates Pinning */}
            <div className="mt-3">
              <GoogleMapViewer
                selectable={true}
                selectedCoords={{ lat: latitude, lng: longitude }}
                onSelectCoords={(lat, lng, hint) => {
                  setLatitude(lat);
                  setLongitude(lng);
                  if (hint) setPickupAddress(hint);
                }}
                height="180px"
              />
              <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Coordinates: {latitude}, {longitude}</span>
                <span className="text-emerald-400 font-semibold">Click on map to adjust exact gate/bay</span>
              </p>
            </div>
          </div>

          {/* Pickup Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Specific Pickup Instructions
            </label>
            <input
              type="text"
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
              placeholder="e.g. Enter through Gate 3 back delivery bay. Ask for Chef Michael."
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Safety Confirmation Checkbox */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={foodSafetyConfirmed}
                onChange={(e) => setFoodSafetyConfirmed(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
              />
              <span className="text-xs text-emerald-200 leading-relaxed font-medium">
                <strong>Food Safety & Freshness Guarantee:</strong> I certify that this food was prepared under hygienic conditions, has been stored at proper safe temperatures, has not been served/touched by guests, and is completely wholesome for human consumption.
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 px-6 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 to-amber-400 hover:from-emerald-300 hover:to-amber-300 shadow-md rounded-xl transition disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              <span>{isSubmitting ? 'Publishing Listing...' : 'Submit Food Donation'}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
