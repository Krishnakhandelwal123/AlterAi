/** User notification preferences (stored on users.notifications jsonb). */

export const DEFAULT_NOTIFICATION_PREFS = {
  inAppAlerts: true,
  emailAlerts: true,
  newConversation: true,
  chatActivity: false,
  trainingUpdates: true,
  clonePublished: true,
  billingAlerts: true,
  planLimitAlerts: true,
  voiceUpdates: true,
  weeklyAnalytics: false,
  dailySummary: true,
  productUpdates: true
};

/** Maps in-app notification type → preference key. */
export const PREF_KEY_BY_NOTIFICATION_TYPE = {
  new_conversation: 'newConversation',
  chat_message: 'chatActivity',
  training_complete: 'trainingUpdates',
  training_failed: 'trainingUpdates',
  clone_published: 'clonePublished',
  clone_unpublished: 'clonePublished',
  billing_success: 'billingAlerts',
  billing_reminder: 'billingAlerts',
  plan_limit: 'planLimitAlerts',
  voice_ready: 'voiceUpdates',
  welcome: 'productUpdates'
};

export const sanitizeNotificationPrefs = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }

  return Object.keys(DEFAULT_NOTIFICATION_PREFS).reduce((acc, key) => {
    acc[key] =
      typeof raw[key] === 'boolean' ? raw[key] : DEFAULT_NOTIFICATION_PREFS[key];
    return acc;
  }, {});
};

export const shouldDeliverInApp = (prefs, type) => {
  const settings = sanitizeNotificationPrefs(prefs);
  if (!settings.inAppAlerts) return false;
  const prefKey = PREF_KEY_BY_NOTIFICATION_TYPE[type];
  if (!prefKey) return true;
  return Boolean(settings[prefKey]);
};

export const shouldDeliverEmail = (prefs, prefKey) => {
  const settings = sanitizeNotificationPrefs(prefs);
  if (!settings.emailAlerts) return false;
  if (prefKey && typeof settings[prefKey] === 'boolean') {
    return settings[prefKey];
  }
  return true;
};
