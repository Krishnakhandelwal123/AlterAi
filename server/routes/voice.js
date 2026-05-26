import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/authenticate.js';
import { supabase } from '../lib/supabase.js';
import { getUserPlan } from '../utils/planChecker.js';
import { notifyVoiceReady } from '../services/notificationService.js';

const router = Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AUDIO_MIMES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'video/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  'application/octet-stream'
]);

const speakLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many voice requests. Please wait.' }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    const name = (file.originalname || '').toLowerCase();
    const allowedExt = ['.webm', '.wav', '.mp3', '.ogg', '.m4a', '.mp4', '.mpeg'];
    const hasAllowedExt = allowedExt.some((ext) => name.endsWith(ext));

    if (AUDIO_MIMES.has(mime) || hasAllowedExt) {
      cb(null, true);
      return;
    }
    cb(new Error('Invalid audio format. Use MP3, WAV, WebM, OGG, or M4A.'));
  }
});

const handleAudioUpload = (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Audio file is too large (max 10MB).'
          : err.message || 'Could not read audio upload';
      return res.status(400).json({ error: message });
    }
    next();
  });
};

const getElevenLabsKey = () => {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new Error('ELEVENLABS_API_KEY is not configured');
  }
  return key;
};

const parseElevenLabsError = async (response) => {
  try {
    const body = await response.json();
    const detailItems = Array.isArray(body?.detail) ? body.detail : null;
    const detailFromArray = detailItems
      ?.map((item) => item?.msg || item?.message)
      .filter(Boolean)
      .join('; ');
    const detail = detailFromArray || body?.detail?.message || body?.detail || body?.message || JSON.stringify(body);
    const text = typeof detail === 'string' ? detail : JSON.stringify(detail);

    if (response.status === 401) return 'Invalid ElevenLabs API key. Check server configuration.';
    if (response.status === 429 || /quota|limit/i.test(text)) {
      return 'ElevenLabs quota exceeded. Try again later or upgrade your ElevenLabs plan.';
    }
    if (/instant voice cloning|does not include/i.test(text)) {
      return 'Your ElevenLabs account needs Starter plan or higher for voice cloning. Upgrade at elevenlabs.io — this is separate from your Alter AI Creator plan.';
    }
    if (/parsing the body|uploadfile|expected upload/i.test(text)) {
      return 'ElevenLabs could not read the audio file. Re-record (30+ seconds) and try again.';
    }
    if (/invalid|audio|format|corrupt/i.test(text)) {
      return 'Invalid audio sample. Please re-record in a quiet room and try again.';
    }
    if (response.status >= 500) {
      return 'ElevenLabs is temporarily unavailable. Please try again in a few minutes.';
    }
    return text || 'ElevenLabs request failed';
  } catch {
    return 'ElevenLabs request failed';
  }
};

/** Native FormData + Blob — Node fetch handles multipart correctly (form-data package does not). */
const buildElevenLabsVoiceForm = (file, voiceName, personalityName) => {
  const mime = file.mimetype || 'audio/webm';
  const ext = mime.includes('wav') ? 'wav' : mime.includes('webm') ? 'webm' : 'mp3';
  const filename = file.originalname || `voice_sample.${ext}`;

  const form = new FormData();
  form.append('name', voiceName || `${personalityName} Voice`);
  form.append('description', 'AI voice clone for Alter AI');
  form.append('files', new Blob([file.buffer], { type: mime }), filename);
  form.append('labels', JSON.stringify({ source: 'alter-ai' }));
  return form;
};

const deleteElevenLabsVoice = async (voiceId) => {
  if (!voiceId) return;
  try {
    await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      method: 'DELETE',
      headers: { 'xi-api-key': getElevenLabsKey() }
    });
  } catch (err) {
    console.error('[voice] ElevenLabs delete failed:', err.message);
  }
};

const ensureCreatorPlan = async (userId, res) => {
  const plan = await getUserPlan(userId);
  if (plan !== 'creator') {
    res.status(403).json({
      error: 'Voice cloning requires Creator plan',
      code: 'PLAN_REQUIRED',
      upgrade: 'creator'
    });
    return false;
  }
  return true;
};

const ensurePersonalityOwnership = async (personalityId, userId) => {
  const { data, error } = await supabase
    .from('personalities')
    .select('id, name, user_id')
    .eq('id', personalityId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// POST /api/voice/clone
router.post('/clone', authenticate, handleAudioUpload, async (req, res) => {
  try {
    if (!(await ensureCreatorPlan(req.user.id, res))) return;

    const personalityId = req.body?.personalityId;
    const voiceName = typeof req.body?.voiceName === 'string' ? req.body.voiceName.trim() : '';
    const durationSeconds = Number(req.body?.durationSeconds || 0);

    if (!personalityId || !UUID_REGEX.test(personalityId)) {
      return res.status(400).json({ error: 'Valid personalityId is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    if (durationSeconds > 0 && durationSeconds < 30) {
      return res.status(400).json({ error: 'Recording must be at least 30 seconds' });
    }

    const personality = await ensurePersonalityOwnership(personalityId, req.user.id);
    if (!personality) {
      return res.status(404).json({ error: 'Clone not found' });
    }

    const userId = req.user.id;
    const ext = req.file.mimetype.includes('webm') ? 'webm' : req.file.mimetype.includes('wav') ? 'wav' : 'mp3';
    const storagePath = `${userId}/${personalityId}/sample_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('voice-samples')
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) {
      const msg = uploadError.message?.includes('Bucket not found')
        ? 'Storage bucket "voice-samples" not found. Create it in Supabase Storage (private).'
        : uploadError.message;
      return res.status(500).json({ error: msg });
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from('voice-samples')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    if (signedError) {
      return res.status(500).json({ error: 'Could not create sample URL' });
    }

    const { data: existingProfile } = await supabase
      .from('voice_profiles')
      .select('elevenlabs_voice_id')
      .eq('personality_id', personalityId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingProfile?.elevenlabs_voice_id) {
      await deleteElevenLabsVoice(existingProfile.elevenlabs_voice_id);
    }

    const elevenForm = buildElevenLabsVoiceForm(req.file, voiceName, personality.name);

    const elevenRes = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': getElevenLabsKey()
      },
      body: elevenForm
    });

    if (!elevenRes.ok) {
      return res.status(elevenRes.status >= 500 ? 503 : 400).json({
        error: await parseElevenLabsError(elevenRes)
      });
    }

    const elevenData = await elevenRes.json();
    const voiceId = elevenData?.voice_id;

    if (!voiceId) {
      return res.status(500).json({ error: 'ElevenLabs did not return a voice ID' });
    }

    const { error: profileError } = await supabase.from('voice_profiles').upsert(
      {
        personality_id: personalityId,
        user_id: userId,
        elevenlabs_voice_id: voiceId,
        sample_url: signedData.signedUrl,
        sample_name: req.file.originalname || `sample.${ext}`,
        is_active: true
      },
      { onConflict: 'personality_id' }
    );

    if (profileError) {
      await deleteElevenLabsVoice(voiceId);
      return res.status(500).json({ error: profileError.message || 'Could not save voice profile' });
    }

    const { error: enableError } = await supabase
      .from('personalities')
      .update({ voice_enabled: true })
      .eq('id', personalityId)
      .eq('user_id', userId);

    if (enableError) {
      return res.status(500).json({ error: enableError.message });
    }

    void notifyVoiceReady({
      userId,
      cloneName: personality.name,
      personalityId
    });

    return res.status(201).json({
      success: true,
      voiceId,
      message: 'Voice cloned successfully!'
    });
  } catch (err) {
    console.error('[voice] clone error:', err);
    if (err.message?.includes('ELEVENLABS_API_KEY')) {
      return res.status(503).json({ error: 'Voice service is not configured on the server.' });
    }
    if (err.message?.includes('Invalid audio')) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message || 'Voice cloning failed' });
  }
});

// POST /api/voice/speak — public
router.post('/speak', speakLimiter, async (req, res) => {
  try {
    const { text, personalityId } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }
    if (text.length > 500) {
      return res.status(400).json({ error: 'Text must be 500 characters or less' });
    }
    if (!personalityId || !UUID_REGEX.test(personalityId)) {
      return res.status(400).json({ error: 'Valid personalityId is required' });
    }

    const { data: voiceProfile, error: voiceError } = await supabase
      .from('voice_profiles')
      .select('elevenlabs_voice_id')
      .eq('personality_id', personalityId)
      .eq('is_active', true)
      .maybeSingle();

    if (voiceError) throw voiceError;
    if (!voiceProfile) {
      return res.status(404).json({ error: 'Voice not available' });
    }

    const { data: personality, error: personalityError } = await supabase
      .from('personalities')
      .select('id, is_public, voice_enabled')
      .eq('id', personalityId)
      .maybeSingle();

    if (personalityError) throw personalityError;
    if (!personality?.is_public || !personality?.voice_enabled) {
      return res.status(404).json({ error: 'Voice not enabled for this clone' });
    }

    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceProfile.elevenlabs_voice_id}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': getElevenLabsKey(),
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg'
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!ttsRes.ok) {
      return res.status(ttsRes.status >= 500 ? 503 : 400).json({
        error: await parseElevenLabsError(ttsRes)
      });
    }

    const arrayBuffer = await ttsRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set('Content-Type', 'audio/mpeg');
    res.set('Content-Length', String(buffer.byteLength));
    res.set('Cache-Control', 'no-cache');
    return res.send(buffer);
  } catch (err) {
    console.error('[voice] speak error:', err);
    return res.status(500).json({ error: 'Could not generate speech' });
  }
});

// GET /api/voice/status/:personalityId
router.get('/status/:personalityId', authenticate, async (req, res) => {
  try {
    const { personalityId } = req.params;
    if (!UUID_REGEX.test(personalityId)) {
      return res.status(400).json({ error: 'Invalid personality ID' });
    }

    const personality = await ensurePersonalityOwnership(personalityId, req.user.id);
    if (!personality) {
      return res.status(404).json({ error: 'Clone not found' });
    }

    const [{ data: voiceProfile }, { data: personalityRow }] = await Promise.all([
      supabase
        .from('voice_profiles')
        .select('id, is_active, created_at, sample_name')
        .eq('personality_id', personalityId)
        .eq('user_id', req.user.id)
        .maybeSingle(),
      supabase
        .from('personalities')
        .select('voice_enabled')
        .eq('id', personalityId)
        .single()
    ]);

    return res.json({
      success: true,
      hasVoice: Boolean(voiceProfile),
      voiceEnabled: Boolean(personalityRow?.voice_enabled),
      voiceProfile: voiceProfile || null
    });
  } catch (err) {
    console.error('[voice] status error:', err);
    return res.status(500).json({ error: 'Could not load voice status' });
  }
});

// PATCH /api/voice/toggle/:personalityId
router.patch('/toggle/:personalityId', authenticate, async (req, res) => {
  try {
    const { personalityId } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' });
    }

    const personality = await ensurePersonalityOwnership(personalityId, req.user.id);
    if (!personality) {
      return res.status(404).json({ error: 'Clone not found' });
    }

    if (enabled) {
      const { data: profile } = await supabase
        .from('voice_profiles')
        .select('id')
        .eq('personality_id', personalityId)
        .eq('user_id', req.user.id)
        .maybeSingle();

      if (!profile) {
        return res.status(400).json({ error: 'Clone a voice before enabling voice responses' });
      }
    }

    const { data, error } = await supabase
      .from('personalities')
      .update({ voice_enabled: enabled })
      .eq('id', personalityId)
      .eq('user_id', req.user.id)
      .select('voice_enabled')
      .single();

    if (error) throw error;

    return res.json({ success: true, voice_enabled: data.voice_enabled });
  } catch (err) {
    console.error('[voice] toggle error:', err);
    return res.status(500).json({ error: 'Could not update voice setting' });
  }
});

// DELETE /api/voice/:personalityId
router.delete('/:personalityId', authenticate, async (req, res) => {
  try {
    const { personalityId } = req.params;

    const personality = await ensurePersonalityOwnership(personalityId, req.user.id);
    if (!personality) {
      return res.status(404).json({ error: 'Clone not found' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('voice_profiles')
      .select('id, elevenlabs_voice_id')
      .eq('personality_id', personalityId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      return res.status(404).json({ error: 'Voice profile not found' });
    }

    await deleteElevenLabsVoice(profile.elevenlabs_voice_id);

    const { error: deleteError } = await supabase
      .from('voice_profiles')
      .delete()
      .eq('personality_id', personalityId)
      .eq('user_id', req.user.id);

    if (deleteError) throw deleteError;

    await supabase
      .from('personalities')
      .update({ voice_enabled: false })
      .eq('id', personalityId)
      .eq('user_id', req.user.id);

    return res.json({ success: true, message: 'Voice deleted successfully' });
  } catch (err) {
    console.error('[voice] delete error:', err);
    return res.status(500).json({ error: 'Could not delete voice' });
  }
});

export default router;
