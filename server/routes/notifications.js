import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  deleteNotification,
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../services/notificationService.js';

const router = Router();
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.use(authenticate);

router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
});

router.get('/', async (req, res) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const limit = Number(req.query.limit) || 30;
    const notifications = await listNotifications(req.user.id, { limit, unreadOnly });
    const unreadCount = await getUnreadCount(req.user.id);

    return res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (err) {
    console.error('[notifications] list error:', err);
    return res.status(500).json({ error: 'Could not load notifications' });
  }
});

router.get('/unread-count', async (req, res) => {
  try {
    const unreadCount = await getUnreadCount(req.user.id);
    return res.json({ success: true, unreadCount });
  } catch (err) {
    console.error('[notifications] count error:', err);
    return res.status(500).json({ error: 'Could not load notification count' });
  }
});

router.patch('/read-all', async (req, res) => {
  try {
    await markAllNotificationsRead(req.user.id);
    return res.json({ success: true, unreadCount: 0 });
  } catch (err) {
    console.error('[notifications] read-all error:', err);
    return res.status(500).json({ error: 'Could not mark notifications as read' });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: 'Invalid notification id' });
    }

    const updated = await markNotificationRead(req.user.id, id);
    if (!updated) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const unreadCount = await getUnreadCount(req.user.id);
    return res.json({ success: true, unreadCount });
  } catch (err) {
    console.error('[notifications] read error:', err);
    return res.status(500).json({ error: 'Could not update notification' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: 'Invalid notification id' });
    }

    await deleteNotification(req.user.id, id);
    const unreadCount = await getUnreadCount(req.user.id);
    return res.json({ success: true, unreadCount });
  } catch (err) {
    console.error('[notifications] delete error:', err);
    return res.status(500).json({ error: 'Could not delete notification' });
  }
});

export default router;
