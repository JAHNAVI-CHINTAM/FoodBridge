import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { dbService } from '../db.js';

const router = Router();

const bookFoodSchema = z.object({
  donation_id: z.string().min(1, 'Donation ID is required'),
  receiver_id: z.string().min(1, 'Receiver ID is required'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  receiver_notes: z.string().optional()
});

const updateTrackingSchema = z.object({
  stage: z.enum(['confirmed', 'on_the_way', 'arrived_at_pickup', 'picked_up', 'distributed']),
  note: z.string().optional(),
  eta_minutes: z.number().optional()
});

// POST /api/bookings - atomic book food
router.post('/', (req: Request, res: Response) => {
  try {
    const validated = bookFoodSchema.parse(req.body);
    const result = dbService.bookFoodAtomic(validated);
    res.status(201).json({
      success: true,
      message: 'Food booked successfully!',
      data: result
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/bookings - fetch bookings for user
router.get('/', (req: Request, res: Response) => {
  try {
    const { receiver_id, donor_id, status } = req.query;
    const bookings = dbService.getBookings({
      receiver_id: typeof receiver_id === 'string' ? receiver_id : undefined,
      donor_id: typeof donor_id === 'string' ? donor_id : undefined,
      status: typeof status === 'string' ? status : undefined
    });
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/bookings/:id/tracking - live food tracking status update
router.patch('/:id/tracking', (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }
    const validated = updateTrackingSchema.parse(req.body);
    const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = dbService.updateTrackingStage({
      booking_id: bookingId,
      user_id: userId,
      stage: validated.stage,
      note: validated.note,
      eta_minutes: validated.eta_minutes
    });
    res.json({
      success: true,
      message: `Tracking updated to ${validated.stage}`,
      data: result
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/bookings/:id/cancel - cancel and restore inventory
router.post('/:id/cancel', (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }
    const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = dbService.cancelBookingAtomic(bookingId, userId, req.body.reason);
    res.json({
      success: true,
      message: 'Booking cancelled. Quantity restored to donation inventory.',
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/bookings/:id/complete - mark pickup completed
router.post('/:id/complete', (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }
    const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = dbService.completeBooking(bookingId, userId);
    res.json({
      success: true,
      message: 'Booking marked as completed',
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
