-- ==============================================================================
-- FOOD BRIDGE: REALISTIC SEED DATA FOR DEMO & TESTING
-- ==============================================================================

-- Demo Profiles (Using fixed deterministic UUIDs)
INSERT INTO public.profiles (id, full_name, email, phone, avatar_url, address, organization_name, active_role)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111', 
        'Chef Rajesh Kumar', 
        'rajesh@grandpalace.com', 
        '+91 98765 43210', 
        'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
        'Grand Palace Hotel, MG Road, Bengaluru, Karnataka 560001', 
        'Grand Palace Hotel & Banquets', 
        'donor'
    ),
    (
        '22222222-2222-2222-2222-222222222222', 
        'Priya Sharma', 
        'priya@artisanbakehouse.com', 
        '+91 98234 56789', 
        'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
        'Artisan Bakehouse, 12th Main, Indiranagar, Bengaluru 560038', 
        'Artisan Bakehouse & Cafe', 
        'donor'
    ),
    (
        '33333333-3333-3333-3333-333333333333', 
        'Anand Verma', 
        'anand@hopefoundation.org', 
        '+91 91234 56780', 
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        'Hope Care Shelter, 4th Cross, Koramangala, Bengaluru 560034', 
        'Hope Community Foundation & Shelter', 
        'receiver'
    ),
    (
        '44444444-4444-4444-4444-444444444444', 
        'Sister Mary Thomas', 
        'mary@stjudeshelter.org', 
        '+91 99887 76655', 
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        'St. Jude Children Home, Austin Town, Bengaluru 560047', 
        'St. Jude Orphanage & Care Center', 
        'receiver'
    )
ON CONFLICT (id) DO NOTHING;

-- User Roles
INSERT INTO public.user_roles (user_id, role, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'donor', true),
    ('22222222-2222-2222-2222-222222222222', 'donor', true),
    ('33333333-3333-3333-3333-333333333333', 'receiver', true),
    ('44444444-4444-4444-4444-444444444444', 'receiver', true)
ON CONFLICT (user_id, role) DO NOTHING;

-- Realistic Active Donations
INSERT INTO public.donations (
    id, donor_id, food_name, category, description, image_urls, 
    total_quantity, available_quantity, quantity_unit, 
    preparation_time, expiry_time, pickup_address, latitude, longitude, 
    pickup_instructions, food_safety_confirmed, status
) VALUES
(
    'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Fresh Vegetable Biryani & Raita (Banquet Surplus)',
    'Cooked Meals',
    'Freshly prepared aromatic basmati rice vegetable biryani with assorted vegetables and creamy cooling raita. Prepared for an afternoon corporate lunch, completely untouched, hygienically packed in clean insulated food-grade containers.',
    ARRAY[
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80'
    ],
    40.00,
    30.00,
    'Packets',
    NOW() - INTERVAL '2 hours',
    NOW() + INTERVAL '6 hours',
    'Grand Palace Hotel, Banquet Rear Entrance Gate 3, MG Road, Bengaluru',
    12.9756,
    77.6083,
    'Please enter via Gate 3 rear loading bay. Contact Executive Sous Chef on arrival. Carry clean thermal transport bags if possible.',
    true,
    'available'
),
(
    'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Assorted Sourdough Breads & Butter Croissants',
    'Bakery',
    'Morning freshly baked sourdough loaves, baguettes, multigrain dinner rolls, and flaky butter croissants. 100% vegetarian, all baked early this morning, crisp and delicious.',
    ARRAY[
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80'
    ],
    25.00,
    25.00,
    'Items',
    NOW() - INTERVAL '4 hours',
    NOW() + INTERVAL '18 hours',
    'Artisan Bakehouse, 12th Main, Indiranagar 100 Feet Road, Bengaluru',
    12.9784,
    77.6408,
    'Collect from dispatch counter at the side lane. Ask for Manager Priya.',
    true,
    'available'
),
(
    'c3333333-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'Steamed Idli, Medu Vada & Sambar Combo',
    'Cooked Meals',
    'Hot steamed soft rice idlis with crispy lentil medu vadas and piping hot vegetable drumstick sambar. Packed hygienically.',
    ARRAY[
        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'
    ],
    50.00,
    50.00,
    'Packets',
    NOW() - INTERVAL '3 hours',
    NOW() + INTERVAL '5 hours',
    'Grand Palace Hotel, MG Road, Bengaluru',
    12.9756,
    77.6083,
    'Available for immediate pickup at kitchen staff counter.',
    true,
    'available'
),
(
    'd4444444-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'Organic Farm Apples & Bananas Crate',
    'Fruits',
    'Fresh ripe bananas and Himachal crisp apples. Wholesome, clean, rich in nutrients, perfect for shelter breakfast or snack.',
    ARRAY[
        'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80'
    ],
    30.00,
    30.00,
    'Kilograms (kg)',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '36 hours',
    'Indiranagar Distribution Hub, 100ft Road, Bengaluru',
    12.9719,
    77.6412,
    'Stored in crates at front porch.',
    true,
    'available'
),
(
    'e5555555-eeee-eeee-eeee-eeeeeeeeeeee',
    '11111111-1111-1111-1111-111111111111',
    'Fresh Full-Cream Pasteurized Milk (Unopened Pouches)',
    'Dairy',
    'Unopened 500ml pasteurized refrigerated milk pouches surplus from morning breakfast buffet prep. Maintained below 4°C.',
    ARRAY[
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80'
    ],
    20.00,
    20.00,
    'Litres (L)',
    NOW() - INTERVAL '6 hours',
    NOW() + INTERVAL '12 hours',
    'Grand Palace Hotel Cold Storage, MG Road, Bengaluru',
    12.9756,
    77.6083,
    'Collect from chilled receiving dock.',
    true,
    'available'
)
ON CONFLICT (id) DO NOTHING;

-- Sample Initial Completed Booking for stats
INSERT INTO public.bookings (
    id, donation_id, receiver_id, donor_id, quantity_reserved, booking_status, booking_reference, booked_at
) VALUES (
    'f6666666-ffff-ffff-ffff-ffffffffffff',
    'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    10.00,
    'confirmed',
    'FB-20251017-A912',
    NOW() - INTERVAL '1 hour'
) ON CONFLICT (id) DO NOTHING;

-- Initial Notification
INSERT INTO public.notifications (
    id, user_id, title, message, notification_type, related_donation_id, related_booking_id, is_read
) VALUES (
    '77777777-7777-7777-7777-777777777777',
    '33333333-3333-3333-3333-333333333333',
    'Welcome to Food Bridge!',
    'Your receiver account is active. Browse nearby surplus food donations and book them instantly.',
    'system',
    NULL,
    NULL,
    false
) ON CONFLICT (id) DO NOTHING;
