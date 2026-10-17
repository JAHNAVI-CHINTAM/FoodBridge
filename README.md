# 🍲 Food Bridge — Food Donation and Sharing Platform

> **Share Food. Spread Hope.**  
> A modern, responsive, full-stack food donation web platform that connects food donors (restaurants, hotels, bakeries, event organizers, supermarkets, and individuals) with receivers (NGOs, orphanages, community kitchens, shelters, and people in need). Built with the speed, discovery, and visual polish of modern food platforms (Swiggy / Zomato), dedicated entirely to zero food waste and community nourishment.

---

## 🌟 Highlights & Key Features

- **Role-Based Portals & Dashboards**:
  - **Donor Portal**: List surplus food in under 60 seconds with photos, quantity units, categories, preparation time, and automated expiry windows. Track active donations, view bookings received with receiver contact information, and review archived expired donations.
  - **Receiver Portal**: Modern food discovery feed with cards, search, category filters, distance radius, and an interactive discovery map. Atomic booking workflow supporting full or partial quantity reservations.
- **Strict Booking Consistency & Concurrency Protection**:
  - Atomic database transactions with row locks (`FOR UPDATE`) prevent double bookings, race conditions, and overselling.
  - If a receiver books the entire available donation, it is **immediately removed** from the available-food feed for all other receivers.
  - Partial reservations immediately decrement available quantities in real time.
  - Valid booking cancellation safely restores reserved quantities back to available inventory.
- **Automated Expiry Sweeps**:
  - Background worker checks and automatically transitions past-due donations to `expired` status.
  - The server verifies expiration timestamps on every booking attempt, blocking any expired listing from being claimed.
- **Google Maps & Geolocation Integration**:
  - Places address search and geolocation coordinate pinpointing for donors.
  - Interactive discovery map displaying active donation markers with hover info cards.
  - "Get Directions" turn-by-turn navigation link to Google Maps (`/maps/dir/?api=1&destination=lat,lng`).
  - High-fidelity interactive coordinate fallback when API keys are being provisioned.
- **Multi-Role User Profile & Safe Role Switching**:
  - Users can switch between Donor and Receiver view without bypassing permissions or losing historical data.
- **Real-Time In-App Notifications**:
  - Unread count badge in header bell dropdown for donation creation, booking confirmation, donor alerts, cancellations, and handovers.
- **Real Impact Statistics**:
  - Computes meals shared, donations completed, kg food waste diverted, and active donors/receivers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v7 |
| **Backend** | Node.js, Express, TypeScript, Zod schema validation, CORS |
| **Database & Auth** | Supabase PostgreSQL, Row Level Security (RLS), Stored Procedures (RPC), Supabase Auth |
| **Mapping** | Google Maps JavaScript API, Google Places Autocomplete, Geocoding, Google Directions navigation |
| **Persistence** | Supabase Cloud Database + Seamless Local Persistent Engine (`data/db.json`) for instant out-of-the-box evaluation |

---

## 📁 Repository Structure

```
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/common/  # Navbar, Footer, Badge, Toast, GoogleMapViewer, LocationAutocomplete
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── pages/              # LandingPage, AuthPage, ProfilePage
│   │   │   ├── donor/          # DonorDashboard, DonorDonations, AddDonationModal, DonorBookings, DonorExpired
│   │   │   └── receiver/       # ReceiverDashboard, AvailableFood, FoodDetailModal, MyBookings
│   │   ├── services/           # Universal API client & Supabase connector
│   │   └── types/              # Full TypeScript models
│   ├── tailwind.config.js      # Custom theme colors (brand green, warm orange)
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── routes/             # donations.ts, bookings.ts, notifications.ts, stats.ts, auth.ts
│   │   ├── db.ts               # Atomic transactions, concurrency locks, expiry sweeps
│   │   ├── types.ts            # Server data types
│   │   └── index.ts            # Express server, recurring worker, health check
│   ├── test/                   # Automated E2E & unit test suite (29 critical test assertions)
│   └── package.json
│
├── supabase/                   # Supabase PostgreSQL schema, migrations, and seed data
│   ├── schema.sql              # Tables, constraints, indexes, RLS policies, atomic RPC functions
│   └── seed.sql                # Realistic initial seed data for donors, donations, and receivers
│
├── .env.example                # Placeholder environment variables template
└── README.md                   # Complete documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v24 recommended)
- **npm**: v9.0.0 or higher

### 2. Install Dependencies
Clone the repository and install dependencies in both client and server:

```powershell
# Install client dependencies
cd client
npm.cmd install

# Install server dependencies
cd ../server
npm.cmd install
cd ..
```

### 3. Environment Variables Setup
Copy the `.env.example` file to create `.env` in the `client/` and `server/` directories:

```powershell
# In root / server
Copy-Item .env.example server/.env
# In client
Copy-Item client/.env.example client/.env
```

Contents of `.env.example`:
```env
# Server Configuration
PORT=5000

# Supabase PostgreSQL & Auth Credentials
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# Google Maps Platform API Key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# Frontend Environment Variables (Vite)
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

> **Note**: Food Bridge includes an integrated high-fidelity persistence engine loaded with realistic seed data out-of-the-box. The application works immediately for full interactive testing even before external API keys are configured!

---

## 🗄️ Supabase PostgreSQL Setup & Migrations

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Under **Project Settings -> API**, copy your `Project URL` and `anon public` key.

### 2. Apply Database Schema & Migrations
1. In your Supabase dashboard, navigate to the **SQL Editor**.
2. Open the file `supabase/schema.sql` in this repo, copy its entire contents, paste into the SQL Editor, and click **Run**.
3. This creates:
   - `profiles` table (linked to `auth.users`)
   - `user_roles` table (supports multiple roles: `donor`, `receiver`)
   - `donations` table (with quantities, expiry timestamps, GPS coordinates, categories, and status checks)
   - `bookings` table (with unique references `FB-YYYYMMDD-XXXX`, donor & receiver relations)
   - `notifications` table (with unread flags and links to donations/bookings)
   - Full Row Level Security (RLS) policies
   - Stored Procedure `public.book_food_atomic`: Performs concurrency-safe `FOR UPDATE` row locking, checks expiration, decrements available inventory, updates donation status, creates unique reference, and issues notifications.
   - Stored Procedure `public.cancel_booking_atomic`: Restores reserved quantities back to available inventory and notifies both parties.
   - Trigger `on_auth_user_created`: Automatically creates a matching profile in `profiles` and assigns initial roles.

### 3. Load Realistic Seed Data
1. Open `supabase/seed.sql` in the Supabase SQL Editor and click **Run**.
2. This populates realistic hotel banquets, bakeries, shelters, active listings with food images, and initial bookings.

---

## 🗺️ Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
   - **Directions API**
3. Generate an API Key under **Credentials**.
4. Set the key in `client/.env`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
   ```
5. *(Fallback included)*: If an API key is not present, Food Bridge automatically displays an interactive coordinate pinpointing tool and direct links to Google Maps turn-by-turn navigation.

---

## 🏃 Running the Application

### Option A: Run Server & Client Simultaneously

**Terminal 1 (Backend Server):**
```powershell
cd server
npm.cmd run dev
```
*API server starts at `http://localhost:5000`*

**Terminal 2 (Frontend Client):**
```powershell
cd client
npm.cmd run dev
```
*Vite dev server starts at `http://localhost:5173`*

---

## 🧪 Running Automated Tests

Run the comprehensive test suite verifying all 4 critical end-to-end user journeys and database constraints:

```powershell
cd server
npm.cmd test
```

### Verified Test Matrix (29 Assertions):
1. **Scenario A: Donor Journey**
   - Donor profile registration and role assignment
   - Initial donation listing creation and positive quantity validation
   - Donor active listings query isolation
2. **Scenario B: Receiver Journey**
   - Receiver account creation
   - Real-time food discovery feed
   - Category filtering (Cooked Meals, Bakery, Fruits, etc.)
3. **Scenario C: Booking Consistency & Concurrency Protection**
   - Full reservation of 10 packets by Receiver A
   - Immediate removal of fully reserved donation from available feed
   - Rejection of double booking attempts by Receiver B
   - Partial reservation (20 items - 6 = 14 remaining) and status transition to `partially_booked`
   - Strict rejection of overselling requests exceeding available inventory
   - Booking cancellation: instant restoration of reserved quantity back to available inventory
4. **Scenario D: Expiry Automation & Multi-Tenant Security**
   - Expired donation cannot be booked (rejected with explicit error)
   - Automatic expiry sweeper transitions overdue listings to `expired`
   - Prevention of unauthorized edits on other donors' listings
   - Seamless role switching (`donor` <-> `receiver`) without privilege escalation
   - Delivery of in-app notifications with unread counts

---

## 🚢 Deployment Instructions

### Deploy Frontend (Vercel)
1. Push your repository to GitHub.
2. In Vercel, import the repository and set:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variables:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://food-bridge-api.onrender.com/api`)
   - `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps key
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Deploy Backend (Render / Railway / Node VPS)
1. In Render or Railway, choose Web Service from the `server` directory.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Add Environment Variables:
   - `PORT`: `5000`
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service key

---

## 🤝 Pre-configured Evaluator Demo Logins

For instant evaluation without creating new credentials, click the **Instant Evaluator Demo Access** buttons on the Login page:

| Role | Name | Email | Password |
|---|---|---|---|
| **Donor** | Chef Rajesh Kumar (Grand Palace Banquets) | `rajesh@grandpalace.com` | `password123` |
| **Donor** | Priya Sharma (Artisan Bakehouse) | `priya@artisanbakehouse.com` | `password123` |
| **Receiver** | Anand Verma (Hope Community Shelter) | `anand@hopefoundation.org` | `password123` |
| **Receiver** | Sister Mary Thomas (St. Jude Care Center) | `mary@stjudeshelter.org` | `password123` |

---

## 📄 License
This project is open-source under the MIT License.
