-- ==============================================================================
-- FOOD BRIDGE: DATABASE SCHEMA & MIGRATIONS (Supabase PostgreSQL)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    address TEXT,
    organization_name TEXT,
    active_role TEXT NOT NULL DEFAULT 'donor' CHECK (active_role IN ('donor', 'receiver')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. USER ROLES TABLE (Supports multiple authorized roles: donor, receiver)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('donor', 'receiver')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 3. DONATIONS TABLE
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    food_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Cooked Meals', 'Fruits', 'Vegetables', 'Bakery', 'Dairy', 'Packaged Food', 'Grains', 'Beverages', 'Other'
    )),
    description TEXT NOT NULL,
    image_urls TEXT[] NOT NULL DEFAULT '{}',
    total_quantity NUMERIC(10, 2) NOT NULL CHECK (total_quantity > 0),
    available_quantity NUMERIC(10, 2) NOT NULL CHECK (available_quantity >= 0 AND available_quantity <= total_quantity),
    quantity_unit TEXT NOT NULL CHECK (quantity_unit IN (
        'Packets', 'Items', 'Kilograms (kg)', 'Grams (g)', 'Litres (L)', 'Millilitres (mL)'
    )),
    preparation_time TIMESTAMPTZ,
    expiry_time TIMESTAMPTZ NOT NULL,
    pickup_address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    pickup_instructions TEXT,
    food_safety_confirmed BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN (
        'available', 'partially_booked', 'booked', 'expired', 'cancelled'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE RESTRICT,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quantity_reserved NUMERIC(10, 2) NOT NULL CHECK (quantity_reserved > 0),
    booking_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (booking_status IN (
        'confirmed', 'cancelled', 'completed', 'expired'
    )),
    booking_reference TEXT NOT NULL UNIQUE,
    receiver_notes TEXT,
    booked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'donation_created', 'booking_confirmed', 'booking_received', 
        'booking_cancelled', 'donation_expired', 'booking_completed', 'system'
    )),
    related_donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
    related_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_category ON public.donations(category);
CREATE INDEX IF NOT EXISTS idx_donations_expiry_time ON public.donations(expiry_time);
CREATE INDEX IF NOT EXISTS idx_donations_coordinates ON public.donations(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_bookings_receiver_id ON public.bookings(receiver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_donor_id ON public.bookings(donor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_donation_id ON public.bookings(donation_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ==============================================================================
-- AUTOMATIC TIMESTAMP UPDATE TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_donations_updated_at BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION ON USER SIGNUP TRIGGER (Supabase Auth)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role TEXT;
BEGIN
    default_role := COALESCE(NEW.raw_user_meta_data->>'role', 'donor');
    
    INSERT INTO public.profiles (id, full_name, email, phone, organization_name, address, active_role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'organization_name',
        NEW.raw_user_meta_data->>'address',
        default_role
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    INSERT INTO public.user_roles (user_id, role, is_active)
    VALUES (NEW.id, default_role, true)
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on auth.users create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ATOMIC STORED PROCEDURE: BOOK FOOD
-- Prevents race conditions, double bookings, and overselling via row lock
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.book_food_atomic(
    p_donation_id UUID,
    p_receiver_id UUID,
    p_quantity NUMERIC,
    p_receiver_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_donation RECORD;
    v_new_available NUMERIC;
    v_new_status TEXT;
    v_booking_ref TEXT;
    v_booking_id UUID;
    v_receiver_name TEXT;
BEGIN
    -- 1. Lock donation row for update to ensure concurrency safety
    SELECT * INTO v_donation
    FROM public.donations
    WHERE id = p_donation_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Donation listing not found';
    END IF;

    -- 2. Validate current donation status and expiry
    IF v_donation.expiry_time <= timezone('utc'::text, now()) THEN
        UPDATE public.donations
        SET status = 'expired', updated_at = timezone('utc'::text, now())
        WHERE id = p_donation_id;
        RAISE EXCEPTION 'This food donation has expired and cannot be booked';
    END IF;

    IF v_donation.status NOT IN ('available', 'partially_booked') THEN
        RAISE EXCEPTION 'This food donation is no longer available (current status: %)', v_donation.status;
    END IF;

    -- 3. Validate quantity
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Reserved quantity must be greater than zero';
    END IF;

    IF p_quantity > v_donation.available_quantity THEN
        RAISE EXCEPTION 'Requested quantity (%) exceeds currently available quantity (%)', 
            p_quantity, v_donation.available_quantity;
    END IF;

    -- Prevent self-booking (donor cannot book own food)
    IF v_donation.donor_id = p_receiver_id THEN
        RAISE EXCEPTION 'Donors cannot book their own food listings';
    END IF;

    -- 4. Calculate new available quantity and resulting status
    v_new_available := v_donation.available_quantity - p_quantity;
    IF v_new_available = 0 THEN
        v_new_status := 'booked';
    ELSE
        v_new_status := 'partially_booked';
    END IF;

    -- 5. Generate human-readable unique booking reference (e.g. FB-20251017-X82A)
    v_booking_ref := 'FB-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 4));

    -- 6. Insert booking record
    INSERT INTO public.bookings (
        donation_id,
        receiver_id,
        donor_id,
        quantity_reserved,
        booking_status,
        booking_reference,
        receiver_notes
    ) VALUES (
        p_donation_id,
        p_receiver_id,
        v_donation.donor_id,
        p_quantity,
        'confirmed',
        v_booking_ref,
        p_receiver_notes
    ) RETURNING id INTO v_booking_id;

    -- 7. Update donation available quantity and status
    UPDATE public.donations
    SET 
        available_quantity = v_new_available,
        status = v_new_status,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_donation_id;

    -- 8. Get receiver's name for donor notification
    SELECT full_name INTO v_receiver_name
    FROM public.profiles
    WHERE id = p_receiver_id;

    -- 9. Trigger in-app notifications for both receiver and donor
    -- Notification for Receiver
    INSERT INTO public.notifications (
        user_id, title, message, notification_type, related_donation_id, related_booking_id
    ) VALUES (
        p_receiver_id,
        'Booking Confirmed!',
        'You have successfully booked ' || p_quantity || ' ' || v_donation.quantity_unit || ' of ' || v_donation.food_name || '. Ref: ' || v_booking_ref,
        'booking_confirmed',
        p_donation_id,
        v_booking_id
    );

    -- Notification for Donor
    INSERT INTO public.notifications (
        user_id, title, message, notification_type, related_donation_id, related_booking_id
    ) VALUES (
        v_donation.donor_id,
        'New Food Booking Received',
        COALESCE(v_receiver_name, 'A receiver') || ' just booked ' || p_quantity || ' ' || v_donation.quantity_unit || ' of ' || v_donation.food_name || '. Ref: ' || v_booking_ref,
        'booking_received',
        p_donation_id,
        v_booking_id
    );

    -- Return JSON result
    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'booking_reference', v_booking_ref,
        'quantity_reserved', p_quantity,
        'remaining_available', v_new_available,
        'donation_status', v_new_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ATOMIC STORED PROCEDURE: CANCEL BOOKING
-- Safely restores quantity back to donation
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.cancel_booking_atomic(
    p_booking_id UUID,
    p_user_id UUID,
    p_cancellation_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_booking RECORD;
    v_donation RECORD;
    v_new_available NUMERIC;
    v_new_status TEXT;
BEGIN
    SELECT * INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found';
    END IF;

    -- Verify user permission (either receiver who made booking or donor who listed it)
    IF v_booking.receiver_id <> p_user_id AND v_booking.donor_id <> p_user_id THEN
        RAISE EXCEPTION 'Unauthorized to cancel this booking';
    END IF;

    IF v_booking.booking_status <> 'confirmed' THEN
        RAISE EXCEPTION 'Only confirmed bookings can be cancelled (current status: %)', v_booking.booking_status;
    END IF;

    -- Lock donation row
    SELECT * INTO v_donation
    FROM public.donations
    WHERE id = v_booking.donation_id
    FOR UPDATE;

    -- Restore quantity if donation has not expired or been cancelled
    IF v_donation.expiry_time > timezone('utc'::text, now()) AND v_donation.status <> 'cancelled' THEN
        v_new_available := LEAST(v_donation.available_quantity + v_booking.quantity_reserved, v_donation.total_quantity);
        IF v_new_available >= v_donation.total_quantity THEN
            v_new_status := 'available';
        ELSE
            v_new_status := 'partially_booked';
        END IF;

        UPDATE public.donations
        SET 
            available_quantity = v_new_available,
            status = v_new_status,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_donation.id;
    END IF;

    -- Update booking status
    UPDATE public.bookings
    SET 
        booking_status = 'cancelled',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_booking_id;

    -- Send notifications to both parties
    INSERT INTO public.notifications (
        user_id, title, message, notification_type, related_donation_id, related_booking_id
    ) VALUES (
        v_booking.receiver_id,
        'Booking Cancelled',
        'Booking ' || v_booking.booking_reference || ' for ' || v_donation.food_name || ' has been cancelled.',
        'booking_cancelled',
        v_donation.id,
        v_booking.id
    );

    INSERT INTO public.notifications (
        user_id, title, message, notification_type, related_donation_id, related_booking_id
    ) VALUES (
        v_booking.donor_id,
        'Booking Cancelled',
        'Booking ' || v_booking.booking_reference || ' for ' || v_donation.food_name || ' was cancelled. Quantity returned to available inventory.',
        'booking_cancelled',
        v_donation.id,
        v_booking.id
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'restored_quantity', v_booking.quantity_reserved
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- FUNCTION: CHECK AND MARK EXPIRED DONATIONS
-- Automatically transitions overdue donations
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_expired_donations()
RETURNS INTEGER AS $$
DECLARE
    v_affected_rows INTEGER;
BEGIN
    UPDATE public.donations
    SET 
        status = 'expired',
        updated_at = timezone('utc'::text, now())
    WHERE 
        expiry_time <= timezone('utc'::text, now())
        AND status IN ('available', 'partially_booked');
        
    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
    RETURN v_affected_rows;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- 2. User Roles RLS
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
    ON public.user_roles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 3. Donations RLS
-- Anyone authenticated can view active donations; donors can view all their own
CREATE POLICY "Authenticated users can view active donations"
    ON public.donations FOR SELECT
    TO authenticated
    USING (
        status IN ('available', 'partially_booked') 
        OR donor_id = auth.uid()
    );

-- Public landing page can preview available donations
CREATE POLICY "Anon users can view available donations"
    ON public.donations FOR SELECT
    TO anon
    USING (status IN ('available', 'partially_booked') AND expiry_time > timezone('utc'::text, now()));

CREATE POLICY "Donors can create donations"
    ON public.donations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donors can update their own donations"
    ON public.donations FOR UPDATE
    TO authenticated
    USING (auth.uid() = donor_id);

CREATE POLICY "Donors can delete/cancel their own donations"
    ON public.donations FOR DELETE
    TO authenticated
    USING (auth.uid() = donor_id);

-- 4. Bookings RLS
CREATE POLICY "Receivers and Donors can view related bookings"
    ON public.bookings FOR SELECT
    TO authenticated
    USING (auth.uid() = receiver_id OR auth.uid() = donor_id);

CREATE POLICY "Receivers can insert bookings"
    ON public.bookings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "Participants can update their booking status"
    ON public.bookings FOR UPDATE
    TO authenticated
    USING (auth.uid() = receiver_id OR auth.uid() = donor_id);

-- 5. Notifications RLS
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Storage bucket setup instructions for food images:
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'food-images');
-- CREATE POLICY "Authenticated users can upload food images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'food-images' AND auth.role() = 'authenticated');
