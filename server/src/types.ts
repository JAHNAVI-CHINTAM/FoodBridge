export type UserRole = 'donor' | 'receiver';

export type FoodCategory =
  | 'Cooked Meals'
  | 'Fruits'
  | 'Vegetables'
  | 'Bakery'
  | 'Dairy'
  | 'Packaged Food'
  | 'Grains'
  | 'Beverages'
  | 'Other';

export type QuantityUnit =
  | 'Packets'
  | 'Items'
  | 'Kilograms (kg)'
  | 'Grams (g)'
  | 'Litres (L)'
  | 'Millilitres (mL)';

export type DonationStatus =
  | 'available'
  | 'partially_booked'
  | 'booked'
  | 'expired'
  | 'cancelled';

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'expired';

export type FoodTrackingStage =
  | 'confirmed'         // Booking confirmed, preparing food handover
  | 'on_the_way'        // Receiver / volunteer on the way to pickup location
  | 'arrived_at_pickup' // Receiver reached donor's kitchen / loading bay
  | 'picked_up'         // Food handed over and verified with reference code
  | 'distributed';      // Delivered to shelter / distributed to beneficiaries

export interface TrackingTimelineEvent {
  stage: FoodTrackingStage;
  label: string;
  timestamp: string;
  note?: string | null;
  updated_by_role: 'donor' | 'receiver' | 'system';
}

export type NotificationType =
  | 'donation_created'
  | 'booking_confirmed'
  | 'booking_received'
  | 'booking_cancelled'
  | 'donation_expired'
  | 'booking_completed'
  | 'tracking_update'
  | 'system';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  phone_contact_opt_in?: boolean;
  whatsapp_enabled?: boolean;
  avatar_url?: string | null;
  address?: string | null;
  organization_name?: string | null;
  active_role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  food_name: string;
  category: FoodCategory;
  description: string;
  image_urls: string[];
  total_quantity: number;
  available_quantity: number;
  quantity_unit: QuantityUnit;
  preparation_time?: string | null;
  expiry_time: string;
  pickup_address: string;
  latitude: number;
  longitude: number;
  pickup_instructions?: string | null;
  food_safety_confirmed: boolean;
  status: DonationStatus;
  created_at: string;
  updated_at: string;
  donor?: {
    id: string;
    full_name: string;
    organization_name?: string | null;
    phone?: string | null;
    phone_contact_opt_in?: boolean;
    whatsapp_enabled?: boolean;
    avatar_url?: string | null;
  };
}

export interface Booking {
  id: string;
  donation_id: string;
  receiver_id: string;
  donor_id: string;
  quantity_reserved: number;
  booking_status: BookingStatus;
  booking_reference: string;
  receiver_notes?: string | null;
  tracking_stage?: FoodTrackingStage;
  tracking_timeline?: TrackingTimelineEvent[];
  estimated_arrival_minutes?: number | null;
  booked_at: string;
  updated_at: string;
  completed_at?: string | null;
  donation?: Donation;
  receiver?: {
    id: string;
    full_name: string;
    organization_name?: string | null;
    phone?: string | null;
    phone_contact_opt_in?: boolean;
    whatsapp_enabled?: boolean;
    avatar_url?: string | null;
    email: string;
  };
  donor?: {
    id: string;
    full_name: string;
    organization_name?: string | null;
    phone?: string | null;
    phone_contact_opt_in?: boolean;
    whatsapp_enabled?: boolean;
    avatar_url?: string | null;
    email: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  related_donation_id?: string | null;
  related_booking_id?: string | null;
  is_read: boolean;
  created_at: string;
}
