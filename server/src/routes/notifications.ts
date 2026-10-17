import { Router, Request, Response } from 'express';
import { dbService } from '../db.js';

const router = Router();

// GET /api/notifications - user notifications
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.user_id as string);
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    const notifications = dbService.getNotifications(userId);
    const unreadCount = notifications.filter(n => !n.is_read).length;
    res.json({
      success: true,
      unreadCount,
      data: notifications
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/notifications/:id/read - mark single read
router.patch('/:id/read', (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.user_id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    const notifId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = dbService.markNotificationAsRead(notifId, userId);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/notifications/mark-all-read - mark all read
router.post('/mark-all-read', (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.user_id;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    const result = dbService.markAllNotificationsAsRead(userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
