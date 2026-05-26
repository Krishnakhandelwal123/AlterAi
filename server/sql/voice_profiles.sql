-- Voice cloning (ElevenLabs) — run in Supabase SQL editor
-- Also create Storage bucket "voice-samples" (private) in Dashboard → Storage

CREATE TABLE IF NOT EXISTS voice_profiles (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  personality_id      UUID REFERENCES personalities(id) ON DELETE CASCADE,
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  elevenlabs_voice_id TEXT NOT NULL,
  sample_url          TEXT,
  sample_name         TEXT,
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(personality_id)
);

ALTER TABLE personalities
  ADD COLUMN IF NOT EXISTS voice_enabled BOOLEAN DEFAULT false;

ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_voice_profiles" ON voice_profiles;
CREATE POLICY "users_own_voice_profiles"
  ON voice_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS voice_profiles_user_id_idx ON voice_profiles(user_id);
CREATE INDEX IF NOT EXISTS voice_profiles_personality_id_idx ON voice_profiles(personality_id);
