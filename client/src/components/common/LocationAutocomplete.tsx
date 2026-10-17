import React, { useState } from 'react';
import { MapPin, Navigation, Search, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
  error?: string;
  placeholder?: string;
}

// Common preset areas for quick selection / autocomplete demo
const POPULAR_LOCATIONS = [
  { address: 'MG Road Metro Station, Bengaluru, Karnataka 560001', lat: 12.9756, lng: 77.6083 },
  { address: '12th Main Road, Indiranagar, Bengaluru, Karnataka 560038', lat: 12.9784, lng: 77.6408 },
  { address: '80 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka 560034', lat: 12.9345, lng: 77.6265 },
  { address: 'Brigade Road, Ashok Nagar, Bengaluru, Karnataka 560025', lat: 12.9719, lng: 77.6070 },
  { address: 'Whitefield Main Road, Hope Farm, Bengaluru 560066', lat: 12.9698, lng: 77.7500 },
  { address: 'HSR Layout Sector 2, 27th Main Road, Bengaluru 560102', lat: 12.9116, lng: 77.6389 },
];

export const LocationAutocomplete: React.FC<Props> = ({
  value,
  onChange,
  error,
  placeholder = 'Search pickup address or landmark...'
}) => {
  const [query, setQuery] = useState(value || '');
  const [isLocating, setIsLocating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = POPULAR_LOCATIONS.filter((loc) =>
    loc.address.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (loc: { address: string; lat: number; lng: number }) => {
    setQuery(loc.address);
    onChange(loc.address, loc.lat, loc.lng);
    setShowSuggestions(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = Math.round(position.coords.latitude * 10000) / 10000;
        const lng = Math.round(position.coords.longitude * 10000) / 10000;
        const generatedAddress = `Current GPS Location (${lat}, ${lng}), Bengaluru`;
        setQuery(generatedAddress);
        onChange(generatedAddress, lat, lng);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error or denied:', err.message);
        // Fallback default city location
        const fallback = POPULAR_LOCATIONS[0];
        setQuery(fallback.address);
        onChange(fallback.address, fallback.lat, fallback.lng);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
            // Default center if typing custom address
            onChange(e.target.value, 12.9716, 77.5946);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className={`w-full pl-11 pr-28 py-3 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 transition focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-500/30'
              : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
          }`}
        />
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="absolute right-2 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 rounded-lg transition border border-emerald-800/80 flex items-center space-x-1 disabled:opacity-50"
          title="Detect Current GPS Location"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'My Location'}</span>
        </button>
      </div>

      {error && <p className="text-xs text-red-400 mt-1 font-medium">{error}</p>}

      {/* Autocomplete Dropdown Suggestions */}
      {showSuggestions && query.length > 0 && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 max-h-56 overflow-y-auto divide-y divide-slate-800">
          {filteredSuggestions.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-800 transition flex items-start space-x-2.5"
            >
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200">{loc.address.split(',')[0]}</p>
                <p className="text-slate-400 text-[11px] truncate">{loc.address}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
