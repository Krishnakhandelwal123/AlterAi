import { checkLimit } from '../utils/planChecker.js';
import { supabase } from '../lib/supabase.js';

export const checkPlan = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const personalityId = req.body?.personalityId || req.params?.personalityId || req.query?.personalityId;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      if (!personalityId) {
        return res.status(400).json({ success: false, error: 'personalityId is required' });
      }

      const { data: personality } = await supabase
        .from('personalities')
        .select('id, user_id')
        .eq('id', personalityId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!personality) {
        return res.status(403).json({ success: false, error: 'Clone not found or access denied' });
      }

      let checkValue = null;
      if (action === 'add_text') checkValue = req.body?.content;
      if (action === 'upload_file') checkValue = req.file;
      if (action === 'connect_social') checkValue = req.body?.platform;
      if (action === 'add_chunks') checkValue = req.estimatedChunks;

      const result = await checkLimit(userId, personalityId, action, checkValue);
      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          error: result.reason,
          code: 'PLAN_LIMIT_REACHED',
          upgrade: result.upgrade
        });
      }

      req.plan = result.plan;
      req.planLimits = result.limits;
      req.usage = result.usage;
      return next();
    } catch (_error) {
      return res.status(500).json({ success: false, error: 'Something went wrong' });
    }
  };
};
