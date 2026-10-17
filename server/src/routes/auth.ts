import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { dbService } from '../db.js';
import { UserRole } from '../types.js';

const router = Router();

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['donor', 'receiver']),
  organization_name: z.string().optional(),
  address: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  expectedRole: z.enum(['donor', 'receiver']).optional()
});

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);
    const existing = dbService.getProfileByEmail(validated.email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const newProfile = dbService.createProfile({
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      full_name: validated.full_name,
      email: validated.email.toLowerCase(),
      phone: validated.phone || null,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(validated.full_name)}`,
      address: validated.address || null,
      organization_name: validated.organization_name || null,
      active_role: validated.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, validated.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        profile: newProfile,
        token: `mock-jwt-token-${newProfile.id}`
      }
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

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, expectedRole } = loginSchema.parse(req.body);
    const profile = dbService.getProfileByEmail(email);

    if (!profile) {
      return res.status(401).json({
        success: false,
        error: 'No account found with this email. Please check your credentials or register.'
      });
    }

    const fullProfile = dbService.getProfileById(profile.id);
    if (!fullProfile) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    // Role check if specific card was chosen
    if (expectedRole && !fullProfile.roles.includes(expectedRole)) {
      return res.status(403).json({
        success: false,
        error: `This account does not have access as a ${expectedRole}. Please select ${fullProfile.active_role} login or switch roles from profile.`
      });
    }

    // If expectedRole is valid for this user, activate it
    let activeRole = fullProfile.active_role;
    if (expectedRole && fullProfile.roles.includes(expectedRole) && activeRole !== expectedRole) {
      const switched = dbService.switchRole(fullProfile.id, expectedRole);
      activeRole = switched.activeRole;
    }

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        profile: {
          ...fullProfile,
          active_role: activeRole
        },
        token: `token-${fullProfile.id}`
      }
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

// GET /api/auth/profile
router.get('/profile', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || req.query.user_id as string;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized: missing user ID' });
    }
    const profile = dbService.getProfileById(userId);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || req.body.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const updated = dbService.updateProfile(userId, req.body);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/auth/switch-role
router.post('/switch-role', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || req.body.user_id;
    const { newRole } = req.body;
    if (!userId || !newRole) {
      return res.status(400).json({ success: false, error: 'User ID and target role are required' });
    }
    if (newRole !== 'donor' && newRole !== 'receiver') {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    const result = dbService.switchRole(userId, newRole as UserRole);
    res.json({
      success: true,
      message: `Switched active dashboard to ${newRole}`,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
