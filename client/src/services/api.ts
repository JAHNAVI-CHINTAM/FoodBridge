import { createClient } from '@supabase/supabase-js';
import { 
  Donation, 
  Booking, 
  InAppNotification, 
  ImpactStats, 
  Profile, 
  UserRole,
  DonationStatus 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Supabase client instance (for optional direct auth or storage)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to get current user ID from localStorage
function getStoredUserId(): string | null {
  try {
    const raw = localStorage.getItem('food_bridge_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id || null;
  } catch {
    return null;
  }
}

// Universal fetch wrapper
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const userId = getStoredUserId();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (userId && !headers.has('x-user-id')) {
    headers.set('x-user-id', userId);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // --- STATS ---
  async getStats(): Promise<ImpactStats> {
    const res = await apiRequest<{ success: boolean; data: ImpactStats }>('/stats');
    return res.data;
  },

  // --- DONATIONS ---
  async getDonations(params: {
    status?: DonationStatus | DonationStatus[];
    category?: string;
    search?: string;
    donor_id?: string;
    lat?: number;
    lng?: number;
    maxDistance?: number;
    sortBy?: 'newest' | 'nearest' | 'expiry';
  } = {}): Promise<Donation[]> {
    const query = new URLSearchParams();
    if (params.status) {
      if (Array.isArray(params.status)) {
        query.append('status', params.status.join(','));
      } else {
        query.append('status', params.status);
      }
    }
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.donor_id) query.append('donor_id', params.donor_id);
    if (params.lat) query.append('lat', params.lat.toString());
    if (params.lng) query.append('lng', params.lng.toString());
    if (params.maxDistance) query.append('maxDistance', params.maxDistance.toString());
    if (params.sortBy) query.append('sortBy', params.sortBy);

    const queryString = query.toString();
    const res = await apiRequest<{ success: boolean; data: Donation[] }>(
      `/donations${queryString ? `?${queryString}` : ''}`
    );
    return res.data;
  },

  async getDonationById(id: string): Promise<Donation> {
    const res = await apiRequest<{ success: boolean; data: Donation }>(`/donations/${id}`);
    return res.data;
  },

  async createDonation(payload: any): Promise<Donation> {
    const res = await apiRequest<{ success: boolean; data: Donation }>('/donations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateDonation(id: string, payload: any): Promise<Donation> {
    const res = await apiRequest<{ success: boolean; data: Donation }>(`/donations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async cancelDonation(id: string): Promise<Donation> {
    const res = await apiRequest<{ success: boolean; data: Donation }>(`/donations/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  // --- BOOKINGS ---
  async bookFood(payload: {
    donation_id: string;
    receiver_id: string;
    quantity: number;
    receiver_notes?: string;
  }): Promise<{ booking: Booking; remaining_available: number; donation_status: string }> {
    const res = await apiRequest<{
      success: boolean;
      data: { booking: Booking; remaining_available: number; donation_status: string };
    }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async getBookings(params: {
    receiver_id?: string;
    donor_id?: string;
    status?: string;
  } = {}): Promise<Booking[]> {
    const query = new URLSearchParams();
    if (params.receiver_id) query.append('receiver_id', params.receiver_id);
    if (params.donor_id) query.append('donor_id', params.donor_id);
    if (params.status) query.append('status', params.status);

    const res = await apiRequest<{ success: boolean; data: Booking[] }>(
      `/bookings${query.toString() ? `?${query.toString()}` : ''}`
    );
    return res.data;
  },

  async cancelBooking(bookingId: string, reason?: string): Promise<any> {
    const res = await apiRequest<{ success: boolean; data: any }>(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return res.data;
  },

  async completeBooking(bookingId: string): Promise<any> {
    const res = await apiRequest<{ success: boolean; data: any }>(`/bookings/${bookingId}/complete`, {
      method: 'POST',
    });
    return res.data;
  },

  async updateTrackingStatus(
    bookingId: string,
    stage: 'confirmed' | 'on_the_way' | 'arrived_at_pickup' | 'picked_up' | 'distributed',
    note?: string,
    etaMinutes?: number
  ): Promise<any> {
    const res = await apiRequest<{ success: boolean; data: any }>(`/bookings/${bookingId}/tracking`, {
      method: 'PATCH',
      body: JSON.stringify({ stage, note, eta_minutes: etaMinutes }),
    });
    return res.data;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<{ unreadCount: number; data: InAppNotification[] }> {
    const res = await apiRequest<{ success: boolean; unreadCount: number; data: InAppNotification[] }>(
      `/notifications?user_id=${userId}`
    );
    return { unreadCount: res.unreadCount, data: res.data };
  },

  async markNotificationRead(id: string): Promise<any> {
    const res = await apiRequest<{ success: boolean; data: any }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return res.data;
  },

  async markAllNotificationsRead(): Promise<any> {
    const res = await apiRequest<{ success: boolean; data: any }>(`/notifications/mark-all-read`, {
      method: 'POST',
    });
    return res.data;
  },

  // --- AUTH & PROFILE ---
  async register(payload: any): Promise<{ profile: Profile; token: string }> {
    const res = await apiRequest<{ success: boolean; data: { profile: Profile; token: string } }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  async login(payload: { email: string; password: string; expectedRole?: UserRole }): Promise<{ profile: Profile; token: string }> {
    const res = await apiRequest<{ success: boolean; data: { profile: Profile; token: string } }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  async getProfile(userId: string): Promise<Profile> {
    const res = await apiRequest<{ success: boolean; data: Profile }>(`/auth/profile?user_id=${userId}`);
    return res.data;
  },

  async updateProfile(payload: Partial<Profile>): Promise<Profile> {
    const res = await apiRequest<{ success: boolean; data: Profile }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async switchRole(targetRole: UserRole): Promise<{ profile: Profile; activeRole: UserRole }> {
    const res = await apiRequest<{
      success: boolean;
      data: { profile: Profile; activeRole: UserRole };
    }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ newRole: targetRole }),
    });
    return res.data;
  }
};
