import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { dbService } from '../db.js';
import { DonationStatus } from '../types.js';

const router = Router();

const createDonationSchema = z.object({
  donor_id: z.string().min(1, 'Donor ID is required'),
  food_name: z.string().min(2, 'Food name must be at least 2 characters'),
  category: z.enum([
    'Cooked Meals',
    'Fruits',
    'Vegetables',
    'Bakery',
    'Dairy',
    'Packaged Food',
    'Grains',
    'Beverages',
    'Other'
  ]),
  description: z.string().min(10, 'Please provide a clear description (at least 10 chars)'),
  image_urls: z.array(z.string()).default([]),
  total_quantity: z.number().positive('Quantity must be greater than zero'),
  quantity_unit: z.enum([
    'Packets',
    'Items',
    'Kilograms (kg)',
    'Grams (g)',
    'Litres (L)',
    'Millilitres (mL)'
  ]),
  preparation_time: z.string().optional().nullable(),
  expiry_time: z.string().refine(val => new Date(val) > new Date(), {
    message: 'Expiry time must be in the future'
  }),
  pickup_address: z.string().min(5, 'Pickup address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  pickup_instructions: z.string().optional().nullable(),
  food_safety_confirmed: z.boolean().refine(val => val === true, {
    message: 'You must confirm that the food is fresh and safe for consumption'
  })
});

// GET /api/donations - list with filters
router.get('/', (req: Request, res: Response) => {
  try {
    const {
      status,
      category,
      search,
      donor_id,
      lat,
      lng,
      maxDistance,
      sortBy
    } = req.query;

    let parsedStatus: DonationStatus | DonationStatus[] | undefined = undefined;
    if (status) {
      if (typeof status === 'string' && status.includes(',')) {
        parsedStatus = status.split(',') as DonationStatus[];
      } else {
        parsedStatus = status as DonationStatus;
      }
    }

    const donations = dbService.getDonations({
      status: parsedStatus,
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined,
      donor_id: typeof donor_id === 'string' ? donor_id : undefined,
      userLat: lat ? Number(lat) : undefined,
      userLng: lng ? Number(lng) : undefined,
      maxDistanceKm: maxDistance ? Number(maxDistance) : undefined,
      sortBy: (sortBy as 'newest' | 'nearest' | 'expiry') || 'newest'
    });

    res.json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/donations/:id - single detail
router.get('/:id', (req: Request, res: Response) => {
  try {
    const donationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const donation = dbService.getDonationById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, error: 'Donation not found' });
    }
    res.json({ success: true, data: donation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/donations - create
router.post('/', (req: Request, res: Response) => {
  try {
    const validated = createDonationSchema.parse(req.body);
    const created = dbService.createDonation(validated as any);
    res.status(201).json({
      success: true,
      message: 'Food donation published successfully!',
      data: created
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

// PUT /api/donations/:id - update
router.put('/:id', (req: Request, res: Response) => {
  try {
    const donorId = (req.headers['x-user-id'] as string) || req.body.donor_id;
    if (!donorId) {
      return res.status(401).json({ success: false, error: 'Donor identification required' });
    }
    const donationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = dbService.updateDonation(donationId, donorId, req.body);
    res.json({
      success: true,
      message: 'Donation updated successfully',
      data: updated
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/donations/:id - cancel listing
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const donorId = (req.headers['x-user-id'] as string) || req.body.donor_id;
    if (!donorId) {
      return res.status(401).json({ success: false, error: 'Donor identification required' });
    }
    const donationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const cancelled = dbService.deleteOrCancelDonation(donationId, donorId);
    res.json({
      success: true,
      message: 'Donation listing cancelled',
      data: cancelled
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
