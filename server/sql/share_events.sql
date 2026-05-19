CREATE TABLE IF NOT EXISTS share_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  personality_id UUID REFERENCES personalities(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS share_events_personality_id_idx
  ON share_events (personality_id);

CREATE INDEX IF NOT EXISTS share_events_created_at_idx
  ON share_events (created_at);
