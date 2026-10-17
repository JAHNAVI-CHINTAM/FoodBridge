import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import donationsRouter from './routes/donations.js';
import bookingsRouter from './routes/bookings.js';
import notificationsRouter from './routes/notifications.js';
import statsRouter from './routes/stats.js';
import authRouter from './routes/auth.js';
import { sweepExpiredDonations } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
app.use(express.json({ limit: '10mb' }));

// Root status endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Food Bridge API Server',
    status: 'online',
    message: 'Welcome to Food Bridge Food Donation Platform API',
    endpoints: {
      health: '/api/health',
      donations: '/api/donations',
      stats: '/api/stats',
      bookings: '/api/bookings',
      notifications: '/api/notifications',
      auth: '/api/auth'
    },
    version: '1.0.0'
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  const isSupabaseConfigured = Boolean(
    process.env.SUPABASE_URL && 
    process.env.SUPABASE_KEY && 
    !process.env.SUPABASE_URL.includes('your-supabase-url')
  );

  res.json({
    status: 'ok',
    service: 'Food Bridge API',
    version: '1.0.0',
    mode: isSupabaseConfigured ? 'supabase-cloud' : 'local-persistent-store',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/donations', donationsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/auth', authRouter);

// Recurring background worker: Sweep expired donations every 60 seconds
setInterval(() => {
  try {
    const expiredCount = sweepExpiredDonations();
    if (expiredCount > 0) {
      console.log(`[Expiry Worker] Swept ${expiredCount} expired donation(s) to archived status.`);
    }
  } catch (err) {
    console.error('[Expiry Worker] Error running expiry sweep:', err);
  }
}, 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Food Bridge API Server running on http://localhost:${PORT}`);
  console.log(` Mode: ${process.env.SUPABASE_URL ? 'Supabase Hybrid' : 'High-Fidelity Persistence'}`);
  console.log(`=======================================================`);
  // Run initial sweep on boot
  sweepExpiredDonations();
});
