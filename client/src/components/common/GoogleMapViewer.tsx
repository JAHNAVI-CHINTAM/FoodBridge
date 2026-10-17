import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, Layers, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { Donation } from '../../types';

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  address?: string;
  donation?: Donation;
}

interface GoogleMapViewerProps {
  markers?: MarkerData[];
  singleLocation?: {
    lat: number;
    lng: number;
    address: string;
    title?: string;
  };
  selectable?: boolean;
  selectedCoords?: { lat: number; lng: number } | null;
  onSelectCoords?: (lat: number, lng: number, addressHint?: string) => void;
  userCoords?: { lat: number; lng: number } | null;
  onMarkerClick?: (donation: Donation) => void;
  height?: string;
  className?: string;
}

export const GoogleMapViewer: React.FC<GoogleMapViewerProps> = ({
  markers = [],
  singleLocation,
  selectable = false,
  selectedCoords,
  onSelectCoords,
  userCoords,
  onMarkerClick,
  height = '400px',
  className = '',
}) => {
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isGoogleKeyConfigured = Boolean(googleApiKey && !googleApiKey.includes('your-google-maps'));

  // Center coordinates calculation
  const defaultCenter = singleLocation
    ? { lat: singleLocation.lat, lng: singleLocation.lng }
    : userCoords
    ? { lat: userCoords.lat, lng: userCoords.lng }
    : markers.length > 0
    ? { lat: markers[0].lat, lng: markers[0].lng }
    : { lat: 12.9716, lng: 77.5946 }; // Default Bengaluru center

  const [activeCenter, setActiveCenter] = useState(defaultCenter);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [hoveredMarker, setHoveredMarker] = useState<MarkerData | null>(null);

  useEffect(() => {
    if (singleLocation) {
      setActiveCenter({ lat: singleLocation.lat, lng: singleLocation.lng });
    } else if (selectedCoords) {
      setActiveCenter(selectedCoords);
    }
  }, [singleLocation, selectedCoords]);

  // Handle map click for picker
  const handleMapCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectable || !onSelectCoords) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel offset to delta lat/lng
    const deltaLng = ((x / rect.width) - 0.5) * 0.08 * (14 / zoomLevel);
    const deltaLat = ((0.5 - (y / rect.height))) * 0.08 * (14 / zoomLevel);

    const newLat = Math.round((activeCenter.lat + deltaLat) * 10000) / 10000;
    const newLng = Math.round((activeCenter.lng + deltaLng) * 10000) / 10000;

    onSelectCoords(newLat, newLng, `Selected pin at (${newLat}, ${newLng})`);
  };

  const getDirectionsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  const allDisplayMarkers = singleLocation
    ? [
        {
          id: 'single',
          lat: singleLocation.lat,
          lng: singleLocation.lng,
          title: singleLocation.title || 'Pickup Location',
          address: singleLocation.address,
        },
      ]
    : markers;

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 ${className}`} style={{ height }}>
      {/* Fallback & High-Fidelity Interactive Map Surface */}
      <div
        onClick={handleMapCanvasClick}
        className={`w-full h-full relative overflow-hidden select-none ${
          selectable ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
        }`}
        style={{
          backgroundImage: `
            radial-gradient(#334155 1px, transparent 1px),
            linear-gradient(to right, rgba(30, 41, 59, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 41, 59, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
          backgroundColor: '#020617',
        }}
      >
        {/* Visual Map Grid & City Landmarks Decor */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 100 Q 250 80 500 200 T 1000 250" fill="none" stroke="#0284c7" strokeWidth="16" />
            <path d="M 100 0 Q 300 350 450 600" fill="none" stroke="#334155" strokeWidth="8" />
            <path d="M 0 350 H 1200" fill="none" stroke="#334155" strokeWidth="6" />
            <circle cx="350" cy="220" r="160" fill="#10b981" opacity="0.1" />
          </svg>
        </div>

        {/* User Location Pulse Indicator */}
        {userCoords && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
            style={{
              left: `${50 + ((userCoords.lng - activeCenter.lng) / (0.08 * (14 / zoomLevel))) * 100}%`,
              top: `${50 - ((userCoords.lat - activeCenter.lat) / (0.08 * (14 / zoomLevel))) * 100}%`,
            }}
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900 shadow-md" />
            </div>
            <span className="absolute top-5 left-1/2 -translate-x-1/2 bg-emerald-600 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap">
              You are here
            </span>
          </div>
        )}

        {/* Selected Coordinates Pin in Picker Mode */}
        {selectable && selectedCoords && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-full z-20 pointer-events-none transition-all duration-200"
            style={{
              left: `${50 + ((selectedCoords.lng - activeCenter.lng) / (0.08 * (14 / zoomLevel))) * 100}%`,
              top: `${50 - ((selectedCoords.lat - activeCenter.lat) / (0.08 * (14 / zoomLevel))) * 100}%`,
            }}
          >
            <div className="flex flex-col items-center">
              <div className="bg-emerald-600 text-slate-950 text-[11px] font-black px-2 py-1 rounded-md shadow-lg whitespace-nowrap mb-1">
                Selected Pickup Point
              </div>
              <MapPin className="w-8 h-8 text-emerald-400 drop-shadow-md fill-emerald-500" />
            </div>
          </div>
        )}

        {/* Markers */}
        {allDisplayMarkers.map((marker) => {
          const xPercent = 50 + ((marker.lng - activeCenter.lng) / (0.08 * (14 / zoomLevel))) * 100;
          const yPercent = 50 - ((marker.lat - activeCenter.lat) / (0.08 * (14 / zoomLevel))) * 100;

          // Only render markers reasonably near viewport
          if (xPercent < -10 || xPercent > 110 || yPercent < -10 || yPercent > 110) {
            return null;
          }

          return (
            <div
              key={marker.id}
              className="absolute transform -translate-x-1/2 -translate-y-full z-20 cursor-pointer group"
              style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
              onClick={(e) => {
                e.stopPropagation();
                if (marker.donation && onMarkerClick) {
                  onMarkerClick(marker.donation);
                }
              }}
              onMouseEnter={() => setHoveredMarker(marker)}
              onMouseLeave={() => setHoveredMarker(null)}
            >
              <div className="relative flex flex-col items-center">
                {/* Marker Tooltip / Info Window on Hover */}
                {(hoveredMarker?.id === marker.id || singleLocation) && (
                  <div className="mb-1 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-2xl border border-slate-700 text-white text-xs font-semibold whitespace-nowrap z-30 animate-in fade-in zoom-in-90 max-w-xs">
                    <p className="truncate text-emerald-400 font-bold">{marker.title}</p>
                    {marker.address && (
                      <p className="text-[10px] text-slate-400 truncate font-normal mt-0.5">{marker.address}</p>
                    )}
                    {marker.donation && (
                      <p className="text-[10px] text-amber-400 font-bold mt-0.5">
                        {marker.donation.available_quantity} {marker.donation.quantity_unit} available
                      </p>
                    )}
                  </div>
                )}

                {/* Pin Icon */}
                <div className="p-1.5 rounded-full bg-emerald-600 text-slate-950 shadow-lg border-2 border-slate-900 group-hover:scale-110 group-hover:bg-emerald-500 transition">
                  <MapPin className="w-5 h-5 fill-slate-950" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Map Header Overlay */}
        <div className="absolute top-3 left-3 z-30 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-slate-700 text-xs font-medium text-slate-200">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {selectable
              ? 'Click anywhere on map to pin pickup location'
              : singleLocation
              ? 'Pickup Location Pin'
              : `${markers.length} Available Donations on Map`}
          </span>
        </div>

        {/* Status / Service Notice Pill */}
        <div className="absolute bottom-3 left-3 z-30 flex items-center space-x-1.5 bg-slate-950/90 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isGoogleKeyConfigured ? 'Google Maps Connected' : 'Google Maps Geocoding & Open Data Layer'}</span>
        </div>

        {/* Zoom & Control Buttons */}
        <div className="absolute bottom-3 right-3 z-30 flex flex-col space-y-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => Math.min(z + 1, 18));
            }}
            className="p-2 bg-slate-900 rounded-lg shadow-card border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => Math.max(z - 1, 10));
            }}
            className="p-2 bg-slate-900 rounded-lg shadow-card border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          {singleLocation && (
            <a
              href={getDirectionsUrl(singleLocation.lat, singleLocation.lng)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-emerald-600 text-slate-950 font-bold rounded-lg shadow-card hover:bg-emerald-500 transition flex items-center justify-center border border-emerald-500"
              title="Open Directions in Google Maps"
            >
              <Navigation className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* External Directions Link Footer for Single Location */}
      {singleLocation && (
        <div className="bg-slate-900/95 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2 truncate">
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{singleLocation.address}</span>
          </div>
          <a
            href={getDirectionsUrl(singleLocation.lat, singleLocation.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 px-3 py-1.5 rounded-lg transition border border-emerald-800/80 flex-shrink-0 ml-3"
          >
            <span>Get Directions</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};
