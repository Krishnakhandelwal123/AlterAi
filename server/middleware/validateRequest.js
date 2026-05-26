import { body, param, query, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((entry) => entry.msg)
    });
  }
  return next();
};

export const rules = {
  personalityParam: [param('personalityId').isUUID().withMessage('Invalid personality ID')],
  text: [
    body('personalityId').isUUID().withMessage('Invalid personality ID'),
    body('content')
      .isString()
      .withMessage('Content must be text')
      .isLength({ min: 10 })
      .withMessage('Minimum 10 characters required')
      .isLength({ max: 100000 })
      .withMessage('Content too long')
  ],
  qa: [
    body('personalityId').isUUID().withMessage('Invalid personality ID'),
    body('question')
      .isString()
      .isLength({ min: 2, max: 1000 })
      .withMessage('Question must be at least 2 characters'),
    body('answer')
      .isString()
      .isLength({ min: 2, max: 10000 })
      .withMessage('Answer must be at least 2 characters')
  ],
  link: [
    body('personalityId').isUUID().withMessage('Invalid personality ID'),
    body('url').isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Must be a valid URL')
  ],
  medium: [
    body('personalityId').isUUID().withMessage('Invalid personality ID'),
    body('username').isString().matches(/^[@]?[a-zA-Z0-9_-]+$/).withMessage('Invalid Medium username')
  ],
  socialConnect: [
    body('personalityId').isUUID().withMessage('Select a clone first (invalid personality ID)'),
    body('platform')
      .isString()
      .matches(/^(twitter|reddit|github|linkedin|notion|instagram|medium)$/)
      .withMessage('Invalid platform'),
    body('handle')
      .optional({ values: 'falsy' })
      .trim()
      .isString()
      .isLength({ max: 120 })
      .withMessage('Handle must be 120 characters or fewer'),
    body('accessToken')
      .optional({ values: 'falsy' })
      .trim()
      .custom((value, { req }) => {
        const platform = String(req.body?.platform || '').toLowerCase();
        if (['reddit', 'medium'].includes(platform)) return true;
        const token = String(value || '').trim();
        if (token.length < 8) {
          throw new Error('Access token must be at least 8 characters');
        }
        return true;
      }),
    body('refreshToken').optional({ values: 'falsy' }).isString().isLength({ max: 5000 }).withMessage('Invalid refresh token')
  ],
  socialSync: [
    body('personalityId').isUUID().withMessage('Invalid personality ID'),
    param('platform')
      .isString()
      .matches(/^(twitter|reddit|github|linkedin|notion|instagram|medium)$/)
      .withMessage('Invalid platform')
  ],
  socialPlatform: [
    param('platform')
      .isString()
      .matches(/^(twitter|reddit|github|linkedin|notion|instagram|medium)$/)
      .withMessage('Invalid platform')
  ],
  plan: [query('personalityId').optional().isUUID().withMessage('Invalid personality ID')],
  delete: [param('trainingDataId').isUUID().withMessage('Invalid training data ID')]
};
