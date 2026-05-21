create extension if not exists vector;

create or replace function public.match_personality_embeddings(
  query_embedding vector(768),
  match_threshold float default 0.15,
  match_count int default 12,
  p_personality_id uuid default null
)
returns table (
  id uuid,
  chunk_text text,
  similarity float
)
language sql
stable
as $$
  select
    pe.id,
    pe.chunk_text,
    1 - (pe.embedding <=> query_embedding) as similarity
  from public.personality_embeddings pe
  where
    (p_personality_id is null or pe.personality_id = p_personality_id)
    and 1 - (pe.embedding <=> query_embedding) >= match_threshold
  order by pe.embedding <=> query_embedding
  limit match_count;
$$;
