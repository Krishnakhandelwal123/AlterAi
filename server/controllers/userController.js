import path from 'path';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { ValidationError } from '../middleware/errorHandler.js';
import { sanitizeNotificationPrefs } from '../config/notificationPrefs.js';

const AVATAR_BUCKET = 'avatars';

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

const normalizeWebsite = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new ValidationError('Website must be a valid http or https URL');
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    throw new ValidationError('Website must be a valid URL');
  }
};

const getProfileRow = async (userId) => {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
};

const saveProfile = async (user, updates) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert({ id: user.id, email: user.email, ...updates }, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) throw error;

  await supabaseAdmin.auth.admin
    .updateUserById(user.id, {
      user_metadata: {
        name: data.name || '',
        full_name: data.name || '',
        avatar_url: data.avatar || ''
      }
    })
    .catch(() => undefined);

  return mapProfile(data, user);
};

const ensureAvatarBucket = async () => {
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  if (error) throw error;
  if (buckets?.some((bucket) => bucket.name === AVATAR_BUCKET)) return;

  const { error: createError } = await supabaseAdmin.storage.createBucket(AVATAR_BUCKET, {
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  });
  if (createError) throw createError;
};

export const getProfile = async (req, res, next) => {
  try {
    const profile = await getProfileRow(req.user.id);
    return res.json(mapProfile(profile, req.user));
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, website, location, notifications } = req.body;
    const updates = {};

    if (typeof name === 'string') {
      const nextName = name.trim();
      if (nextName && nextName.length < 2) throw new ValidationError('Name must be at least 2 characters');
      if (nextName.length > 50) throw new ValidationError('Name must be at most 50 characters');
      updates.name = nextName;
    }

    if (typeof bio === 'string') {
      const nextBio = bio.trim();
      if (nextBio.length > 240) throw new ValidationError('Bio must be at most 240 characters');
      updates.bio = nextBio;
    }

    if (typeof website === 'string') {
      updates.website = normalizeWebsite(website);
    }

    if (typeof location === 'string') {
      const nextLocation = location.trim();
      if (nextLocation.length > 80) throw new ValidationError('Location must be at most 80 characters');
      updates.location = nextLocation;
    }

    if (notifications !== undefined) {
      updates.notifications = sanitizeNotificationPrefs(notifications);
    }

    const profile = await saveProfile(req.user, updates);
    return res.json(profile);
  } catch (error) {
    return next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) throw new ValidationError('Avatar image is required');
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      throw new ValidationError('Avatar must be a JPG, PNG, WEBP, or GIF image');
    }

    await ensureAvatarBucket();

    const ext = path.extname(file.originalname || '').toLowerCase() || `.${file.mimetype.split('/')[1]}`;
    const filePath = `${req.user.id}/avatar-${Date.now()}${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabaseAdmin.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
    const profile = await saveProfile(req.user, { avatar: publicUrlData.publicUrl });

    return res.json(profile);
  } catch (error) {
    return next(error);
  }
};
