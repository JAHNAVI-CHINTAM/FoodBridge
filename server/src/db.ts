import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Profile, 
  UserRoleRecord, 
  Donation, 
  Booking, 
  Notification, 
  UserRole,
  DonationStatus,
  FoodTrackingStage,
  TrackingTimelineEvent
} from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_KEY && 
  !SUPABASE_URL.includes('your-supabase-url') &&
  !SUPABASE_KEY.includes('your-supabase-anon-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

interface DatabaseSchema {
  profiles: Profile[];
  user_roles: UserRoleRecord[];
  donations: Donation[];
  bookings: Booking[];
  notifications: Notification[];
}

// Initial realistic seed data for out-of-the-box local testing
const INITIAL_DATA: DatabaseSchema = {
  profiles: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Chef Rajesh Kumar',
      email: 'rajesh@grandpalace.com',
      phone: '+91 98765 43210',
      phone_contact_opt_in: true,
      whatsapp_enabled: true,
      avatar_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
      address: 'Grand Palace Hotel, MG Road, Bengaluru, Karnataka 560001',
      organization_name: 'Grand Palace Hotel & Banquets',
      active_role: 'donor',
      created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      full_name: 'Priya Sharma',
      email: 'priya@artisanbakehouse.com',
      phone: '+91 98234 56789',
      phone_contact_opt_in: true,
      whatsapp_enabled: true,
      avatar_url: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
      address: 'Artisan Bakehouse, 12th Main, Indiranagar, Bengaluru 560038',
      organization_name: 'Artisan Bakehouse & Cafe',
      active_role: 'donor',
      created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      full_name: 'Anand Verma',
      email: 'anand@hopefoundation.org',
      phone: '+91 91234 56780',
      phone_contact_opt_in: true,
      whatsapp_enabled: true,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      address: 'Hope Care Shelter, 4th Cross, Koramangala, Bengaluru 560034',
      organization_name: 'Hope Community Foundation & Shelter',
      active_role: 'receiver',
      created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      full_name: 'Sister Mary Thomas',
      email: 'mary@stjudeshelter.org',
      phone: '+91 99887 76655',
      phone_contact_opt_in: true,
      whatsapp_enabled: true,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      address: 'St. Jude Children Home, Austin Town, Bengaluru 560047',
      organization_name: 'St. Jude Orphanage & Care Center',
      active_role: 'receiver',
      created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  user_roles: [
    { id: 'r1', user_id: '11111111-1111-1111-1111-111111111111', role: 'donor', is_active: true, created_at: new Date().toISOString() },
    { id: 'r2', user_id: '22222222-2222-2222-2222-222222222222', role: 'donor', is_active: true, created_at: new Date().toISOString() },
    { id: 'r3', user_id: '33333333-3333-3333-3333-333333333333', role: 'receiver', is_active: true, created_at: new Date().toISOString() },
    { id: 'r4', user_id: '44444444-4444-4444-4444-444444444444', role: 'receiver', is_active: true, created_at: new Date().toISOString() },
    { id: 'r5', user_id: '11111111-1111-1111-1111-111111111111', role: 'receiver', is_active: false, created_at: new Date().toISOString() },
    { id: 'r6', user_id: '33333333-3333-3333-3333-333333333333', role: 'donor', is_active: false, created_at: new Date().toISOString() }
  ],
  donations: [],
  bookings: [],
  notifications: []
};

// Ensure data folder and file exists
function loadData(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed: DatabaseSchema = JSON.parse(raw);

    const origProfileCount = parsed.profiles?.length || 0;
    const origDonationCount = parsed.donations?.length || 0;
    const origBookingCount = parsed.bookings?.length || 0;
    const origRoleCount = parsed.user_roles?.length || 0;
    const origNotifCount = parsed.notifications?.length || 0;

    // 1. Deduplicate profiles by id and email (case-insensitive)
    const uniqueProfiles: Profile[] = [];
    const seenProfileIds = new Set<string>();
    const seenEmails = new Set<string>();
    for (const p of parsed.profiles || []) {
      const email = (p.email || '').toLowerCase().trim();
      if (!seenProfileIds.has(p.id) && !seenEmails.has(email)) {
        seenProfileIds.add(p.id);
        seenEmails.add(email);
        uniqueProfiles.push({
          ...p,
          phone_contact_opt_in: p.phone_contact_opt_in ?? true,
          whatsapp_enabled: p.whatsapp_enabled ?? true
        });
      }
    }
    parsed.profiles = uniqueProfiles;
    const validUserIds = new Set(uniqueProfiles.map(p => p.id));

    // 2. Deduplicate user_roles by user_id + role
    const uniqueRoles: UserRoleRecord[] = [];
    const seenRoleKeys = new Set<string>();
    for (const r of parsed.user_roles || []) {
      if (!validUserIds.has(r.user_id)) continue;
      const key = `${r.user_id}:${r.role}`;
      if (!seenRoleKeys.has(key)) {
        seenRoleKeys.add(key);
        uniqueRoles.push(r);
      }
    }
    parsed.user_roles = uniqueRoles;

    // 3. Deduplicate donations by id and active listings by donor + food_name
    const uniqueDonations: Donation[] = [];
    const seenDonationIds = new Set<string>();
    const seenActiveDonations = new Set<string>();
    for (const d of parsed.donations || []) {
      if (seenDonationIds.has(d.id)) continue;
      const activeKey = `${d.donor_id}:${(d.food_name || '').toLowerCase().trim()}:${(d.pickup_address || '').toLowerCase().trim()}`;
      if ((d.status === 'available' || d.status === 'partially_booked') && seenActiveDonations.has(activeKey)) {
        continue; // drop duplicate active listing
      }
      if (d.status === 'available' || d.status === 'partially_booked') {
        seenActiveDonations.add(activeKey);
      }
      seenDonationIds.add(d.id);
      uniqueDonations.push(d);
    }
    parsed.donations = uniqueDonations;
    const validDonationIds = new Set(uniqueDonations.map(d => d.id));

    // 4. Deduplicate bookings by id and booking_reference
    const uniqueBookings: Booking[] = [];
    const seenBookingIds = new Set<string>();
    const seenBookingRefs = new Set<string>();
    for (const b of parsed.bookings || []) {
      if (!validDonationIds.has(b.donation_id)) continue;
      if (!seenBookingIds.has(b.id) && !seenBookingRefs.has(b.booking_reference)) {
        seenBookingIds.add(b.id);
        seenBookingRefs.add(b.booking_reference);
        if (!b.tracking_stage) b.tracking_stage = b.booking_status === 'completed' ? 'distributed' : 'confirmed';
        if (!b.tracking_timeline) {
          b.tracking_timeline = [
            {
              stage: 'confirmed',
              label: 'Booking Confirmed',
              timestamp: b.booked_at,
              note: b.receiver_notes || 'Reservation created',
              updated_by_role: 'receiver'
            }
          ];
          if (b.booking_status === 'completed') {
            b.tracking_timeline.push({
              stage: 'distributed',
              label: 'Distributed to Beneficiaries',
              timestamp: b.completed_at || b.updated_at,
              note: 'Pickup completed and delivered',
              updated_by_role: 'receiver'
            });
          }
        }
        uniqueBookings.push(b);
      }
    }
    parsed.bookings = uniqueBookings;

    // 5. Deduplicate notifications by id
    const uniqueNotifs: Notification[] = [];
    const seenNotifIds = new Set<string>();
    for (const n of parsed.notifications || []) {
      if (!validUserIds.has(n.user_id)) continue;
      if (!seenNotifIds.has(n.id)) {
        seenNotifIds.add(n.id);
        uniqueNotifs.push(n);
      }
    }
    parsed.notifications = uniqueNotifs;

    // Save cleaned file if any duplicate items were stripped
    if (
      uniqueProfiles.length !== origProfileCount ||
      uniqueDonations.length !== origDonationCount ||
      uniqueBookings.length !== origBookingCount ||
      uniqueRoles.length !== origRoleCount ||
      uniqueNotifs.length !== origNotifCount
    ) {
      saveData(parsed);
    }

    return parsed;
  } catch (err) {
    console.error('Error reading local db file, falling back to initial data:', err);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
}

function saveData(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to local db file:', err);
  }
}

// Check and mark expired donations automatically
export function sweepExpiredDonations(): number {
  const db = loadData();
  const now = new Date();
  let count = 0;

  for (const d of db.donations) {
    if ((d.status === 'available' || d.status === 'partially_booked') && new Date(d.expiry_time) <= now) {
      d.status = 'expired';
      d.updated_at = now.toISOString();
      count++;

      // Notify donor that listing has expired
      db.notifications.push({
        id: `notif-exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: d.donor_id,
        title: 'Donation Expired',
        message: `Your food listing "${d.food_name}" has reached its expiry time and is now archived.`,
        notification_type: 'donation_expired',
        related_donation_id: d.id,
        related_booking_id: null,
        is_read: false,
        created_at: now.toISOString()
      });
    }
  }

  if (count > 0) {
    saveData(db);
  }
  return count;
}

// Distance calculation between two GPS coordinates using Haversine formula (km)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

export const dbService = {
  // --- STATS ---
  getStats() {
    sweepExpiredDonations();
    const db = loadData();
    const completedOrConfirmed = db.bookings.filter(b => b.booking_status === 'confirmed' || b.booking_status === 'completed');
    const mealsShared = completedOrConfirmed.reduce((sum, b) => sum + Number(b.quantity_reserved), 0);
    const donationsCompleted = completedOrConfirmed.length;
    // Estimate waste reduced: ~0.45 kg per average meal/packet
    const wasteReducedKg = Math.round(mealsShared * 0.45);
    const activeDonationsCount = db.donations.filter(d => d.status === 'available' || d.status === 'partially_booked').length;
    const donorsCount = db.profiles.filter(p => p.active_role === 'donor').length;
    const receiversCount = db.profiles.filter(p => p.active_role === 'receiver').length;

    return {
      mealsShared,
      donationsCompleted,
      wasteReducedKg,
      activeDonationsCount,
      donorsCount,
      receiversCount
    };
  },

  // --- PROFILES & AUTH ---
  getProfiles() {
    return loadData().profiles;
  },

  getProfileById(id: string) {
    const db = loadData();
    const profile = db.profiles.find(p => p.id === id);
    if (!profile) return null;
    const roles = db.user_roles.filter(r => r.user_id === id).map(r => r.role);
    return {
      ...profile,
      phone_contact_opt_in: profile.phone_contact_opt_in ?? true,
      whatsapp_enabled: profile.whatsapp_enabled ?? true,
      roles
    };
  },

  getProfileByEmail(email: string) {
    const db = loadData();
    const profile = db.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (!profile) return null;
    return {
      ...profile,
      phone_contact_opt_in: profile.phone_contact_opt_in ?? true,
      whatsapp_enabled: profile.whatsapp_enabled ?? true
    };
  },

  createProfile(profile: Profile, role: UserRole) {
    const db = loadData();
    const enriched = {
      ...profile,
      phone_contact_opt_in: profile.phone_contact_opt_in ?? true,
      whatsapp_enabled: profile.whatsapp_enabled ?? true
    };
    db.profiles.push(enriched);
    db.user_roles.push({
      id: `role-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: profile.id,
      role: role,
      is_active: true,
      created_at: new Date().toISOString()
    });
    saveData(db);
    return enriched;
  },

  updateProfile(id: string, updates: Partial<Profile>) {
    const db = loadData();
    const index = db.profiles.findIndex(p => p.id === id);
    if (index === -1) return null;
    db.profiles[index] = {
      ...db.profiles[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveData(db);
    return db.profiles[index];
  },

  switchRole(userId: string, newRole: UserRole) {
    const db = loadData();
    const profile = db.profiles.find(p => p.id === userId);
    if (!profile) throw new Error('User not found');

    // Check if user has this role, if not add it safely
    let roleRecord = db.user_roles.find(r => r.user_id === userId && r.role === newRole);
    if (!roleRecord) {
      roleRecord = {
        id: `role-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        role: newRole,
        is_active: true,
        created_at: new Date().toISOString()
      };
      db.user_roles.push(roleRecord);
    } else {
      roleRecord.is_active = true;
    }

    profile.active_role = newRole;
    profile.updated_at = new Date().toISOString();
    saveData(db);
    return { profile, activeRole: newRole };
  },

  // --- DONATIONS ---
  getDonations(filters: {
    status?: DonationStatus | DonationStatus[];
    category?: string;
    search?: string;
    donor_id?: string;
    userLat?: number;
    userLng?: number;
    maxDistanceKm?: number;
    sortBy?: 'newest' | 'nearest' | 'expiry';
  }) {
    sweepExpiredDonations();
    const db = loadData();
    let results = [...db.donations];

    // Filter by status
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        results = results.filter(d => filters.status!.includes(d.status));
      } else {
        results = results.filter(d => d.status === filters.status);
      }
    }

    // Filter by donor ID
    if (filters.donor_id) {
      results = results.filter(d => d.donor_id === filters.donor_id);
    }

    // Filter by category
    if (filters.category && filters.category !== 'All') {
      results = results.filter(d => d.category.toLowerCase() === filters.category!.toLowerCase());
    }

    // Filter by search term
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      results = results.filter(d => 
        d.food_name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.pickup_address.toLowerCase().includes(q)
      );
    }

    // Attach donor summary and distance
    const enriched = results.map(d => {
      const donor = db.profiles.find(p => p.id === d.donor_id);
      let distanceKm: number | null = null;
      if (filters.userLat && filters.userLng) {
        distanceKm = calculateDistanceKm(filters.userLat, filters.userLng, d.latitude, d.longitude);
      }
      return {
        ...d,
        distanceKm,
        donor: donor ? {
          id: donor.id,
          full_name: donor.full_name,
          organization_name: donor.organization_name,
          phone: donor.phone,
          phone_contact_opt_in: donor.phone_contact_opt_in ?? true,
          whatsapp_enabled: donor.whatsapp_enabled ?? true,
          avatar_url: donor.avatar_url
        } : undefined
      };
    });

    // Filter by max distance if requested
    let finalResults = enriched;
    if (filters.maxDistanceKm && filters.userLat && filters.userLng) {
      finalResults = finalResults.filter(d => d.distanceKm !== null && d.distanceKm <= filters.maxDistanceKm!);
    }

    // Sort
    if (filters.sortBy === 'nearest' && filters.userLat && filters.userLng) {
      finalResults.sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
    } else if (filters.sortBy === 'expiry') {
      finalResults.sort((a, b) => new Date(a.expiry_time).getTime() - new Date(b.expiry_time).getTime());
    } else {
      // Default: newest
      finalResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Deduplicate results by id before returning
    const seenIds = new Set<string>();
    const deduplicatedResults: typeof finalResults = [];
    for (const item of finalResults) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        deduplicatedResults.push(item);
      }
    }

    return deduplicatedResults;
  },

  getDonationById(id: string) {
    sweepExpiredDonations();
    const db = loadData();
    const donation = db.donations.find(d => d.id === id);
    if (!donation) return null;
    const donor = db.profiles.find(p => p.id === donation.donor_id);
    return {
      ...donation,
      donor: donor ? {
        id: donor.id,
        full_name: donor.full_name,
        organization_name: donor.organization_name,
        phone: donor.phone,
        phone_contact_opt_in: donor.phone_contact_opt_in ?? true,
        whatsapp_enabled: donor.whatsapp_enabled ?? true,
        avatar_url: donor.avatar_url
      } : undefined
    };
  },

  createDonation(data: Omit<Donation, 'id' | 'created_at' | 'updated_at' | 'status' | 'available_quantity'>) {
    const db = loadData();
    const now = new Date();
    const expiry = new Date(data.expiry_time);

    if (expiry <= now) {
      throw new Error('Food expiry time must be in the future.');
    }
    if (Number(data.total_quantity) <= 0) {
      throw new Error('Total quantity must be greater than zero.');
    }

    // Prevent duplicate active listing with same name & location by same donor
    const duplicate = db.donations.find(d =>
      d.donor_id === data.donor_id &&
      d.food_name.trim().toLowerCase() === data.food_name.trim().toLowerCase() &&
      d.pickup_address.trim().toLowerCase() === data.pickup_address.trim().toLowerCase() &&
      (d.status === 'available' || d.status === 'partially_booked')
    );
    if (duplicate) {
      throw new Error(`An active donation for "${data.food_name}" is already listed at this location.`);
    }

    const newDonation: Donation = {
      ...data,
      id: `don-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      total_quantity: Number(data.total_quantity),
      available_quantity: Number(data.total_quantity),
      status: 'available',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    db.donations.unshift(newDonation);

    // Create confirmation notification for donor
    db.notifications.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: newDonation.donor_id,
      title: 'Donation Listed Successfully',
      message: `Your food listing "${newDonation.food_name}" (${newDonation.total_quantity} ${newDonation.quantity_unit}) is now live for receivers.`,
      notification_type: 'donation_created',
      related_donation_id: newDonation.id,
      related_booking_id: null,
      is_read: false,
      created_at: now.toISOString()
    });

    saveData(db);
    return newDonation;
  },

  updateDonation(id: string, donorId: string, updates: Partial<Donation>) {
    const db = loadData();
    const index = db.donations.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Donation not found');
    if (db.donations[index].donor_id !== donorId) throw new Error('Unauthorized to edit this donation');

    // Protect total_quantity adjustments if already booked
    const existing = db.donations[index];
    if (updates.total_quantity !== undefined) {
      const difference = Number(updates.total_quantity) - existing.total_quantity;
      const newAvailable = existing.available_quantity + difference;
      if (newAvailable < 0) {
        throw new Error('Cannot reduce quantity below already reserved amount');
      }
      updates.available_quantity = newAvailable;
    }

    db.donations[index] = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveData(db);
    return db.donations[index];
  },

  deleteOrCancelDonation(id: string, donorId: string) {
    const db = loadData();
    const index = db.donations.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Donation not found');
    if (db.donations[index].donor_id !== donorId) throw new Error('Unauthorized');

    db.donations[index].status = 'cancelled';
    db.donations[index].updated_at = new Date().toISOString();
    saveData(db);
    return db.donations[index];
  },

  // --- ATOMIC BOOKING LOGIC ---
  bookFoodAtomic(params: {
    donation_id: string;
    receiver_id: string;
    quantity: number;
    receiver_notes?: string;
  }) {
    sweepExpiredDonations();
    const db = loadData();
    const { donation_id, receiver_id, quantity, receiver_notes } = params;

    const donation = db.donations.find(d => d.id === donation_id);
    if (!donation) {
      throw new Error('Donation listing not found');
    }

    // Check expiry
    const now = new Date();
    if (new Date(donation.expiry_time) <= now) {
      donation.status = 'expired';
      saveData(db);
      throw new Error('This food donation has expired and can no longer be booked');
    }

    // Check status
    if (donation.status !== 'available' && donation.status !== 'partially_booked') {
      throw new Error(`This donation is no longer available (current status: ${donation.status})`);
    }

    // Quantity check
    const requestedQty = Number(quantity);
    if (requestedQty <= 0) {
      throw new Error('Reserved quantity must be greater than zero');
    }

    if (requestedQty > donation.available_quantity) {
      throw new Error(`Requested quantity (${requestedQty}) exceeds available quantity (${donation.available_quantity})`);
    }

    // Cannot self-book
    if (donation.donor_id === receiver_id) {
      throw new Error('Donors cannot book their own food listings');
    }

    // Calculate new quantities
    const newAvailable = donation.available_quantity - requestedQty;
    const newStatus: DonationStatus = newAvailable === 0 ? 'booked' : 'partially_booked';

    donation.available_quantity = newAvailable;
    donation.status = newStatus;
    donation.updated_at = now.toISOString();

    const bookingRef = `FB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newBooking: Booking = {
      id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      donation_id: donation.id,
      receiver_id: receiver_id,
      donor_id: donation.donor_id,
      quantity_reserved: requestedQty,
      booking_status: 'confirmed',
      booking_reference: bookingRef,
      receiver_notes: receiver_notes || null,
      tracking_stage: 'confirmed',
      estimated_arrival_minutes: 30,
      tracking_timeline: [
        {
          stage: 'confirmed',
          label: 'Booking Confirmed by Receiver',
          timestamp: now.toISOString(),
          note: receiver_notes || 'Reservation created and awaiting pickup',
          updated_by_role: 'receiver'
        }
      ],
      booked_at: now.toISOString(),
      updated_at: now.toISOString(),
      completed_at: null
    };

    db.bookings.unshift(newBooking);

    // Get profiles for notifications
    const receiver = db.profiles.find(p => p.id === receiver_id);

    // In-app notification for Receiver
    db.notifications.unshift({
      id: `notif-${Date.now()}-1`,
      user_id: receiver_id,
      title: 'Booking Confirmed!',
      message: `You successfully reserved ${requestedQty} ${donation.quantity_unit} of "${donation.food_name}". Ref: ${bookingRef}`,
      notification_type: 'booking_confirmed',
      related_donation_id: donation.id,
      related_booking_id: newBooking.id,
      is_read: false,
      created_at: now.toISOString()
    });

    // In-app notification for Donor
    db.notifications.unshift({
      id: `notif-${Date.now()}-2`,
      user_id: donation.donor_id,
      title: 'New Food Booking Received',
      message: `${receiver?.organization_name || receiver?.full_name || 'A receiver'} reserved ${requestedQty} ${donation.quantity_unit} of "${donation.food_name}". Ref: ${bookingRef}`,
      notification_type: 'booking_received',
      related_donation_id: donation.id,
      related_booking_id: newBooking.id,
      is_read: false,
      created_at: now.toISOString()
    });

    saveData(db);

    return {
      success: true,
      booking: newBooking,
      remaining_available: newAvailable,
      donation_status: newStatus
    };
  },

  // --- ATOMIC CANCEL BOOKING ---
  cancelBookingAtomic(bookingId: string, userId: string, reason?: string) {
    const db = loadData();
    const booking = db.bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    if (booking.receiver_id !== userId && booking.donor_id !== userId) {
      throw new Error('Unauthorized to cancel this booking');
    }

    if (booking.booking_status !== 'confirmed') {
      throw new Error(`Only confirmed bookings can be cancelled (current status: ${booking.booking_status})`);
    }

    const donation = db.donations.find(d => d.id === booking.donation_id);
    const now = new Date();

    // Restore inventory if donation is not expired or cancelled
    if (donation && new Date(donation.expiry_time) > now && donation.status !== 'cancelled') {
      const newAvailable = Math.min(donation.available_quantity + booking.quantity_reserved, donation.total_quantity);
      donation.available_quantity = newAvailable;
      donation.status = newAvailable >= donation.total_quantity ? 'available' : 'partially_booked';
      donation.updated_at = now.toISOString();
    }

    booking.booking_status = 'cancelled';
    booking.updated_at = now.toISOString();

    // Notifications
    db.notifications.unshift({
      id: `notif-${Date.now()}-c1`,
      user_id: booking.receiver_id,
      title: 'Booking Cancelled',
      message: `Booking ${booking.booking_reference} for "${donation?.food_name || 'Food'}" has been cancelled.`,
      notification_type: 'booking_cancelled',
      related_donation_id: donation?.id,
      related_booking_id: booking.id,
      is_read: false,
      created_at: now.toISOString()
    });

    db.notifications.unshift({
      id: `notif-${Date.now()}-c2`,
      user_id: booking.donor_id,
      title: 'Booking Cancelled',
      message: `Booking ${booking.booking_reference} was cancelled. Reserved quantity restored to available inventory.`,
      notification_type: 'booking_cancelled',
      related_donation_id: donation?.id,
      related_booking_id: booking.id,
      is_read: false,
      created_at: now.toISOString()
    });

    saveData(db);
    return { success: true, booking };
  },

  // --- LIVE FOOD TRACKING STATUS UPDATE ---
  updateTrackingStage(params: {
    booking_id: string;
    user_id: string;
    stage: FoodTrackingStage;
    note?: string;
    eta_minutes?: number;
  }) {
    const db = loadData();
    const booking = db.bookings.find(b => b.id === params.booking_id);
    if (!booking) throw new Error('Booking not found');

    if (booking.receiver_id !== params.user_id && booking.donor_id !== params.user_id) {
      throw new Error('Unauthorized to update tracking for this booking');
    }

    const now = new Date();
    booking.tracking_stage = params.stage;
    booking.updated_at = now.toISOString();

    if (params.eta_minutes !== undefined) {
      booking.estimated_arrival_minutes = params.eta_minutes;
    }

    if (!booking.tracking_timeline) {
      booking.tracking_timeline = [];
    }

    const isDonor = booking.donor_id === params.user_id;
    const role: 'donor' | 'receiver' = isDonor ? 'donor' : 'receiver';

    let stageLabel = 'Status Updated';
    switch (params.stage) {
      case 'confirmed':
        stageLabel = 'Booking Confirmed';
        break;
      case 'on_the_way':
        stageLabel = 'Receiver On The Way for Pickup';
        break;
      case 'arrived_at_pickup':
        stageLabel = 'Arrived at Pickup Location';
        break;
      case 'picked_up':
        stageLabel = 'Food Handed Over & Code Verified';
        break;
      case 'distributed':
        stageLabel = 'Food Delivered & Distributed';
        booking.booking_status = 'completed';
        booking.completed_at = now.toISOString();
        break;
    }

    booking.tracking_timeline.push({
      stage: params.stage,
      label: stageLabel,
      timestamp: now.toISOString(),
      note: params.note || null,
      updated_by_role: role
    });

    // Notify the other party
    const targetUserId = isDonor ? booking.receiver_id : booking.donor_id;
    const actorName = isDonor ? 'Donor' : 'Receiver';

    db.notifications.unshift({
      id: `notif-track-${Date.now()}`,
      user_id: targetUserId,
      title: `Food Tracking: ${stageLabel}`,
      message: `${actorName} updated tracking for booking ${booking.booking_reference}: ${stageLabel}${params.note ? ` ("${params.note}")` : ''}`,
      notification_type: 'tracking_update',
      related_donation_id: booking.donation_id,
      related_booking_id: booking.id,
      is_read: false,
      created_at: now.toISOString()
    });

    saveData(db);
    return { success: true, booking };
  },

  completeBooking(bookingId: string, userId: string) {
    return this.updateTrackingStage({
      booking_id: bookingId,
      user_id: userId,
      stage: 'distributed',
      note: 'Marked pickup and distribution completed'
    });
  },

  // --- BOOKINGS QUERIES ---
  getBookings(filters: { receiver_id?: string; donor_id?: string; status?: string }) {
    const db = loadData();
    let list = [...db.bookings];

    if (filters.receiver_id) {
      list = list.filter(b => b.receiver_id === filters.receiver_id);
    }
    if (filters.donor_id) {
      list = list.filter(b => b.donor_id === filters.donor_id);
    }
    if (filters.status) {
      list = list.filter(b => b.booking_status === filters.status);
    }

    // Deduplicate bookings by ID
    const seenBookingIds = new Set<string>();
    const uniqueList: typeof list = [];
    for (const item of list) {
      if (!seenBookingIds.has(item.id)) {
        seenBookingIds.add(item.id);
        uniqueList.push(item);
      }
    }

    return uniqueList.map(b => {
      const donation = db.donations.find(d => d.id === b.donation_id);
      const receiver = db.profiles.find(p => p.id === b.receiver_id);
      const donor = db.profiles.find(p => p.id === b.donor_id);
      return {
        ...b,
        tracking_stage: b.tracking_stage || (b.booking_status === 'completed' ? 'distributed' : 'confirmed'),
        donation,
        receiver: receiver ? {
          id: receiver.id,
          full_name: receiver.full_name,
          organization_name: receiver.organization_name,
          phone: receiver.phone,
          phone_contact_opt_in: receiver.phone_contact_opt_in ?? true,
          whatsapp_enabled: receiver.whatsapp_enabled ?? true,
          avatar_url: receiver.avatar_url,
          email: receiver.email
        } : undefined,
        donor: donor ? {
          id: donor.id,
          full_name: donor.full_name,
          organization_name: donor.organization_name,
          phone: donor.phone,
          phone_contact_opt_in: donor.phone_contact_opt_in ?? true,
          whatsapp_enabled: donor.whatsapp_enabled ?? true,
          avatar_url: donor.avatar_url,
          email: donor.email
        } : undefined
      };
    });
  },

  // --- NOTIFICATIONS ---
  getNotifications(userId: string) {
    const db = loadData();
    const seenIds = new Set<string>();
    return db.notifications
      .filter(n => {
        if (n.user_id !== userId) return false;
        if (seenIds.has(n.id)) return false;
        seenIds.add(n.id);
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  markNotificationAsRead(id: string, userId: string) {
    const db = loadData();
    const notif = db.notifications.find(n => n.id === id && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
      saveData(db);
    }
    return notif;
  },

  markAllNotificationsAsRead(userId: string) {
    const db = loadData();
    let count = 0;
    for (const n of db.notifications) {
      if (n.user_id === userId && !n.is_read) {
        n.is_read = true;
        count++;
      }
    }
    if (count > 0) {
      saveData(db);
    }
    return { updated: count };
  },

  // --- CLEANUP TEST DATA ---
  cleanupTestData(testUserIds: string[], testDonationIds: string[]) {
    const db = loadData();
    const userSet = new Set(testUserIds);
    const donationSet = new Set(testDonationIds);

    db.profiles = db.profiles.filter(p => !userSet.has(p.id) && !p.email.includes('@test.com'));
    db.user_roles = db.user_roles.filter(r => !userSet.has(r.user_id));
    db.donations = db.donations.filter(d => !donationSet.has(d.id) && !userSet.has(d.donor_id));
    db.bookings = db.bookings.filter(b => !donationSet.has(b.donation_id) && !userSet.has(b.receiver_id) && !userSet.has(b.donor_id));
    db.notifications = db.notifications.filter(n => !userSet.has(n.user_id));

    saveData(db);
  }
};
