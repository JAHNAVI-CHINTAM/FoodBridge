import { Router, Request, Response } from 'express';
import { dbService } from '../db.js';

const router = Router();

// GET /api/stats - impact statistics
router.get('/', (_req: Request, res: Response) => {
  try {
    const stats = dbService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
