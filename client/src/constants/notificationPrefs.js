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

export const IN_APP_NOTIFICATION_GROUPS = [
  {
    title: 'Master controls',
    description: 'Turn categories on or off for the notification bell and dashboard alerts.',
    items: [
      ['inAppAlerts', 'In-app notifications', 'Show alerts in the bell menu while you use Alter AI.'],
      ['emailAlerts', 'Email notifications', 'Allow transactional emails when SMTP is configured.']
    ]
  },
  {
    title: 'Clone activity',
    items: [
      ['newConversation', 'New conversations', 'When a visitor starts chatting with a public clone.'],
      ['chatActivity', 'Follow-up messages', 'Every visitor message (can be frequent).'],
      ['clonePublished', 'Publish status', 'When a clone goes live or returns to draft.'],
      ['trainingUpdates', 'Training updates', 'When training completes or fails.'],
      ['voiceUpdates', 'Voice cloning', 'When voice setup finishes successfully.']
    ]
  },
  {
    title: 'Account & billing',
    items: [
      ['billingAlerts', 'Billing & subscriptions', 'Payments, plan upgrades, and renewal reminders.'],
      ['planLimitAlerts', 'Plan limits', 'When training or usage hits your plan cap.']
    ]
  }
];

export const EMAIL_NOTIFICATION_GROUPS = [
  {
    title: 'Email digests',
    description: 'Requires email alerts to be on and server SMTP settings.',
    items: [
      ['dailySummary', 'Daily summary', 'A daily snapshot of clone conversations.'],
      ['weeklyAnalytics', 'Weekly analytics', 'Weekly performance report for your clones.'],
      ['productUpdates', 'Product updates', 'New features, tips, and platform announcements.']
    ]
  }
];

export const NOTIFICATION_TYPE_META = {
  new_conversation: { icon: 'message', accent: '#00d4ff' },
  chat_message: { icon: 'message', accent: '#00d4ff' },
  training_complete: { icon: 'sparkles', accent: '#059669' },
  training_failed: { icon: 'alert', accent: '#f87171' },
  clone_published: { icon: 'globe', accent: '#a78bfa' },
  clone_unpublished: { icon: 'globe', accent: '#94a3b8' },
  billing_success: { icon: 'card', accent: '#fbbf24' },
  billing_reminder: { icon: 'card', accent: '#fbbf24' },
  plan_limit: { icon: 'alert', accent: '#fb923c' },
  voice_ready: { icon: 'mic', accent: '#c084fc' },
  welcome: { icon: 'sparkles', accent: '#00d4ff' }
};

export const formatNotificationTime = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
