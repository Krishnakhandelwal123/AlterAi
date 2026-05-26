import { chunkText } from './chunker.js';
import { embedChunks } from './embedder.js';
import { checkLimit } from './planChecker.js';
import { supabase } from '../lib/supabase.js';
import {
  notifyPlanLimit,
  notifyTrainingComplete,
  notifyTrainingFailed
} from '../services/notificationService.js';

const getPersonalityLabel = async (personalityId) => {
  const { data } = await supabase
    .from('personalities')
    .select('name')
    .eq('id', personalityId)
    .maybeSingle();
  return data?.name || 'Your clone';
};

export const trainOnContent = async ({ userId, personalityId, content, sourceType, trainingDataId = null }) => {
  try {
    const chunks = chunkText(content);
    if (chunks.length === 0) {
      if (trainingDataId) {
        await supabase
          .from('training_data')
          .update({ status: 'failed', error_message: 'Not enough content to train on' })
          .eq('id', trainingDataId)
          .eq('user_id', userId);
      }
      return { success: false, error: 'Not enough content to train on' };
    }

    const planGate = await checkLimit(userId, personalityId, 'add_chunks', chunks.length);
    if (!planGate.allowed) {
      if (trainingDataId) {
        await supabase
          .from('training_data')
          .update({ status: 'failed', error_message: planGate.reason })
          .eq('id', trainingDataId)
          .eq('user_id', userId);
      }
      const cloneName = await getPersonalityLabel(personalityId);
      void notifyPlanLimit({ userId, message: planGate.reason });
      void notifyTrainingFailed({
        userId,
        cloneName,
        personalityId,
        reason: planGate.reason
      });
      return { success: false, error: planGate.reason };
    }

    const embeddings = await embedChunks(chunks);
    const rows = chunks.map((chunk, index) => ({
      personality_id: personalityId,
      user_id: userId,
      chunk_text: chunk,
      embedding: embeddings[index],
      source_type: sourceType,
      training_data_id: trainingDataId
    }));

    if (trainingDataId) {
      await supabase.from('personality_embeddings').delete().eq('training_data_id', trainingDataId).eq('user_id', userId);
    }

    const { error } = await supabase.from('personality_embeddings').insert(rows);
    if (error) throw error;

    if (trainingDataId) {
      await supabase
        .from('training_data')
        .update({ status: 'trained', chunk_count: chunks.length, error_message: null })
        .eq('id', trainingDataId)
        .eq('user_id', userId);
    }

    const cloneName = await getPersonalityLabel(personalityId);
    void notifyTrainingComplete({
      userId,
      cloneName,
      personalityId,
      chunks: chunks.length
    });

    return { success: true, chunks: chunks.length };
  } catch (error) {
    if (trainingDataId) {
      await supabase
        .from('training_data')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', trainingDataId)
        .eq('user_id', userId);
    }
    const cloneName = await getPersonalityLabel(personalityId);
    void notifyTrainingFailed({
      userId,
      cloneName,
      personalityId,
      reason: error.message
    });
    return { success: false, error: error.message };
  }
};
