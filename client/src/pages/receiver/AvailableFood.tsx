import React, { useState, useEffect } from 'react';
import { Donation, FoodCategory } from '../../types';
import { StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { GoogleMapViewer } from '../../components/common/GoogleMapViewer';
import { FoodDetailModal } from './FoodDetailModal';
import { api } from '../../services/api';
import { 
  Search, 
  MapPin, 
  Clock, 
  Navigation, 
  SlidersHorizontal, 
  Grid, 
  Map as MapIcon, 
  Building2, 
  Utensils, 
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Props {
  onBookingSuccess: () => void;
}

const CATEGORIES = [
  'All',
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

export const AvailableFood: React.FC<Props> = ({ onBookingSuccess }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxDistance, setMaxDistance] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'nearest' | 'expiry'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Location
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Selected for modal
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  // Detect user geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: Math.round(pos.coords.latitude * 10000) / 10000,
            lng: Math.round(pos.coords.longitude * 10000) / 10000,
          });
        },
        () => {
          // Default Bengaluru center coordinates
          setUserCoords({ lat: 12.9716, lng: 77.5946 });
        }
      );
    } else {
      setUserCoords({ lat: 12.9716, lng: 77.5946 });
    }
  }, []);

  // Fetch available food
  const fetchAvailableDonations = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDonations({
        status: ['available', 'partially_booked'],
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
        lat: userCoords?.lat,
        lng: userCoords?.lng,
        maxDistance: maxDistance !== 'all' ? Number(maxDistance) : undefined,
        sortBy
      });
      // Filter out any where available_quantity <= 0 or expired, and ensure no duplicate items
      const seenIds = new Set<string>();
      const strictlyAvailable: Donation[] = [];
      for (const d of data) {
        if (d.available_quantity > 0 && new Date(d.expiry_time) > new Date()) {
          if (!seenIds.has(d.id)) {
            seenIds.add(d.id);
            strictlyAvailable.push(d);
          }
        }
      }
      setDonations(strictlyAvailable);
    } catch (e) {
      console.error('Failed to load available food:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableDonations();
  }, [selectedCategory, maxDistance, sortBy, userCoords]);

  // Execute search on enter or delay
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAvailableDonations();
  };

  const handleBookingComplete = (result: any) => {
    // If the entire quantity was reserved, remove it immediately from available state
    if (result.remaining_available <= 0) {
      setDonations((prev) => prev.filter((d) => d.id !== result.booking.donation_id));
    } else {
      // Update remaining quantity
      setDonations((prev) =>
        prev.map((d) =>
          d.id === result.booking.donation_id
            ? { ...d, available_quantity: result.remaining_available, status: result.donation_status }
            : d
        )
      );
    }
    onBookingSuccess();
  };

  // Convert donations to map markers
  const mapMarkers = donations.map((d) => ({
    id: d.id,
    lat: d.latitude,
    lng: d.longitude,
    title: d.food_name,
    address: d.pickup_address,
    donation: d
  }));

  return (
    <div className="space-y-6">
      {/* 1. DISCOVERY HEADER & SEARCH BAR (Swiggy / Zomato Look) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Available Food Feed</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Discover and book fresh surplus food prepared by nearby donors.
            </p>
          </div>

          {/* Grid / Map View Toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative mb-5">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by meal name, bread, groceries, or hotel name..."
            className="w-full pl-12 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition"
          >
            Search
          </button>
        </form>

        {/* Category Pills (Horizontal scrollable) */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter & Sort Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold">Distance:</span>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none"
              >
                <option value="all">Any Distance</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none"
            >
              <option value="newest">Newest Listed</option>
              <option value="nearest">Nearest to Me</option>
              <option value="expiry">Expiring Soonest</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. MAP VIEW */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Interactive Discovery Map</h3>
            <span className="text-xs text-slate-500">{donations.length} pickup points found</span>
          </div>
          <GoogleMapViewer
            markers={mapMarkers}
            userCoords={userCoords}
            onMarkerClick={(d) => setSelectedDonation(d)}
            height="460px"
          />
        </div>
      )}

      {/* 3. GRID VIEW (FOOD CARDS) */}
      {viewMode === 'grid' && (
        <div>
          {donations.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-card">
              <Utensils className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No matching food donations found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your distance filter, clearing category selection, or searching for other items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Image with badges & expiry pill */}
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={item.image_urls[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                        alt={item.food_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <CategoryBadge category={item.category} />
                      </div>
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center justify-between">
                        <span>
                          Available: <strong className="text-emerald-300">{item.available_quantity}</strong> {item.quantity_unit}
                        </span>
                        <span className="text-amber-300 flex items-center text-[11px]">
                          <Clock className="w-3 h-3 mr-1" />
                          Expires {new Date(item.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1.5">
                        <Building2 className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" />
                        <span className="font-bold text-slate-800 truncate">
                          {item.donor?.organization_name || item.donor?.full_name || 'Donor Kitchen'}
                        </span>
                        {item.distanceKm !== undefined && item.distanceKm !== null && (
                          <span className="text-slate-400 font-semibold">• {item.distanceKm} km away</span>
                        )}
                      </div>

                      <h3 className="font-black text-slate-900 text-lg line-clamp-1 group-hover:text-brand-700 transition">
                        {item.food_name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                        <p className="flex items-center truncate">
                          <MapPin className="w-3.5 h-3.5 text-brand-600 mr-1.5 flex-shrink-0" />
                          <span className="truncate">{item.pickup_address}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking CTA Buttons */}
                  <div className="p-5 pt-0 flex space-x-2">
                    <button
                      onClick={() => setSelectedDonation(item)}
                      className="flex-1 py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => setSelectedDonation(item)}
                      className="flex-1 py-3 px-4 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-warm-500 to-orange-600 hover:from-warm-600 hover:to-orange-700 shadow-md shadow-warm-500/20 transition transform hover:-translate-y-0.5"
                    >
                      Book Food
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail and Booking Modal */}
      <FoodDetailModal
        donation={selectedDonation}
        onClose={() => setSelectedDonation(null)}
        onBookingSuccess={handleBookingComplete}
        userCoords={userCoords}
      />
    </div>
  );
};
