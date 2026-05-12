import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { ValidationError } from '../middleware/errorHandler.js';

export const getProfile = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', req.user.id).maybeSingle();
    if (error) throw error;
    return res.json(
      data || {
        id: req.user.id,
        email: req.user.email,
        name: req.user.user_metadata?.full_name || req.user.user_metadata?.name || '',
        avatar: req.user.user_metadata?.avatar_url || ''
      }
    );
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    if (name && name.length > 50) {
      throw new ValidationError('Name must be at most 50 characters');
    }

    const updates = {};
    if (typeof name === 'string') updates.name = name.trim();
    if (typeof avatar === 'string') updates.avatar = avatar.trim();

    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({ id: req.user.id, email: req.user.email, ...updates }, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    return next(error);
  }
};
