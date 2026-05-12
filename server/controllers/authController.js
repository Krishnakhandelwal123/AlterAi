import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { AuthError } from '../middleware/errorHandler.js';
import { parseVerifyTokenBody } from '../schemas/authSchemas.js';

const mapProfile = (profile, user) => ({
  id: profile?.id || user.id,
  email: profile?.email || user.email,
  name: profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || '',
  avatar: profile?.avatar || user.user_metadata?.avatar_url || '',
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
      const { data: created } = await supabaseAdmin.from('users').insert(payload).select('*').single();
      profile = created;
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
