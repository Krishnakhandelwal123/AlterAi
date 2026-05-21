const STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'because', 'been', 'being', 'could', 'from',
  'have', 'into', 'just', 'know', 'like', 'more', 'that', 'their', 'there',
  'they', 'this', 'what', 'when', 'where', 'which', 'with', 'would', 'your'
]);

const INTENT_TERMS = {
  experience: ['experience', 'experienced', 'work', 'worked', 'role', 'roles', 'company', 'companies', 'employment', 'professional', 'developer', 'engineer', 'intern', 'project'],
  skills: ['skills', 'skill', 'technology', 'technologies', 'tools', 'stack', 'framework', 'language', 'languages'],
  education: ['education', 'degree', 'college', 'university', 'school', 'graduation', 'cgpa', 'gpa'],
  projects: ['project', 'projects', 'built', 'developed', 'created', 'implemented']
};

export const getQueryTerms = (query) => {
  const baseTerms = String(query || '')
    .toLowerCase()
    .match(/[a-z0-9+#.-]{3,}/g) || [];

  const expanded = new Set(baseTerms.filter((term) => !STOP_WORDS.has(term)));
  for (const [intent, terms] of Object.entries(INTENT_TERMS)) {
    if (baseTerms.includes(intent)) {
      terms.forEach((term) => expanded.add(term));
    }
  }

  return [...expanded];
};

export const rankRelevantChunks = (chunks, query, limit = 8) => {
  const terms = getQueryTerms(query);
  if (!terms.length) return [];
  const asksExperience = terms.includes('experience');

  return (chunks || [])
    .map((chunk, index) => {
      const text = typeof chunk === 'string' ? chunk : chunk?.chunk_text;
      const lower = String(text || '').toLowerCase();
      let score = terms.reduce((total, term) => {
        if (!lower.includes(term)) return total;
        const occurrences = lower.split(term).length - 1;
        return total + 1 + Math.min(occurrences, 3);
      }, 0);
      if (asksExperience && /\bexperience\s+[a-z0-9]/i.test(String(text || ''))) score += 6;
      if (asksExperience && /\b(intern|developer|engineer|contributor|remote|pvt|ltd)\b/i.test(String(text || ''))) score += 3;
      return { text, index, score };
    })
    .filter((item) => item.text && item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((item) => item.text);
};

export const retrieveRelevantContext = async ({
  supabase,
  personalityId,
  query,
  embedChunks,
  logger = console,
  maxContextChunks = 10
}) => {
  const selected = [];
  const seen = new Set();
  const addChunk = (chunk) => {
    const text = typeof chunk === 'string' ? chunk : chunk?.chunk_text;
    const normalized = String(text || '').trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    selected.push(normalized);
  };

  try {
    const [queryVec] = await embedChunks([query]);
    const { data: vectorChunks, error } = await supabase.rpc('match_personality_embeddings', {
      query_embedding: queryVec,
      match_threshold: 0.15,
      match_count: 12,
      p_personality_id: personalityId
    });

    if (error) throw error;
    vectorChunks?.forEach(addChunk);
  } catch (error) {
    logger.warn('[chat] Vector RAG failed:', error.message);
  }

  try {
    const { data: allChunks, error } = await supabase
      .from('personality_embeddings')
      .select('chunk_text')
      .eq('personality_id', personalityId)
      .limit(250);

    if (error) throw error;
    rankRelevantChunks(allChunks, query, 8).forEach(addChunk);
  } catch (error) {
    logger.warn('[chat] Lexical RAG failed:', error.message);
  }

  return selected.slice(0, maxContextChunks).join('\n\n');
};
