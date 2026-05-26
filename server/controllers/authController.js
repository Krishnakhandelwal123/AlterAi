import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { AuthError } from '../middleware/errorHandler.js';
import { parseVerifyTokenBody } from '../schemas/authSchemas.js';
import {
  DEFAULT_NOTIFICATION_PREFS,
  sanitizeNotificationPrefs
} from '../config/notificationPrefs.js';
import { safeSendEmail, sendWelcomeEmail } from '../services/emailService.js';
import { notifyWelcome, shouldSendUserEmail } from '../services/notificationService.js';

const mapProfile = (profile, user) => ({
  id: profile?.id || user.id,
  email: profile?.email || user.email,
  name: profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || '',
  avatar: profile?.avatar || user.user_metadata?.avatar_url || '',
  bio: profile?.bio || '',
  website: profile?.website || '',
  location: profile?.location || '',
  notifications: sanitizeNotificationPrefs(profile?.notifications),
  createdAt: profile?.created_at || user.created_at
});

export const verifyToken = async (req, res, next) => {
  try {
    const { accessToken } = parseVerifyTokenBody(req.body);

    const {
      data: { user },
      error
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) throw new AuthError('Invalid token');

    const payload = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      avatar: user.user_metadata?.avatar_url || ''
    };

    const { data: existing } = await supabaseAdmin.from('users').select('*').eq('id', user.id).maybeSingle();
    let isNewUser = false;
    let profile = existing;

    if (!existing) {
      isNewUser = true;
      const { data: created } = await supabaseAdmin
        .from('users')
        .insert({ ...payload, notifications: { ...DEFAULT_NOTIFICATION_PREFS } })
        .select('*')
        .single();
      profile = created;
      void notifyWelcome({ userId: user.id });
      void shouldSendUserEmail(user.id, 'productUpdates').then((allowed) => {
        if (!allowed) return;
        return safeSendEmail(
          sendWelcomeEmail({
            to: payload.email,
            name: payload.name
          }),
          'welcome email'
        );
      });
    }

    return res.json({ user: mapProfile(profile, user), isNewUser });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const { data: profile } = await supabaseAdmin.from('users').select('*').eq('id', req.user.id).maybeSingle();
    return res.json(mapProfile(profile, req.user));
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log(`Logout: ${req.user.id}`);
    }
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    return next(error);
  }
};
