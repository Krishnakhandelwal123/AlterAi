import {
  LayoutDashboard,
  Layers,
  Plus,
  BarChart3,
  Mic,
  FolderOpen,
  Share2,
  LayoutGrid,
  CreditCard,
  Settings,
  HelpCircle,
  Activity,
  Puzzle,
  Cpu,
  Shield
} from 'lucide-react';

export const dashboardNavSections = [
  {
    id: 'main',
    label: 'MAIN',
    items: [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/dashboard/clones', label: 'My Clones', icon: Layers, end: false },
      { to: '/dashboard/create', label: 'Create Clone', icon: Plus, end: false, createStyle: true },
      { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, end: false }
    ]
  },
  {
    id: 'tools',
    label: 'CLONE TOOLS',
    items: [
      { to: '/dashboard/voice', label: 'Voice Clone', icon: Mic, end: false },
      { to: '/dashboard/training', label: 'Training Data', icon: FolderOpen, end: false },
      { to: '/dashboard/share', label: 'Share & Embed', icon: Share2, end: false },
      { to: '/dashboard/embed', label: 'Embed Widget', icon: LayoutGrid, end: false }
    ]
  },
  {
    id: 'workspace',
    label: 'WORKSPACE',
    items: [
      { to: '/dashboard/activity', label: 'Activity', icon: Activity, end: false },
      { to: '/dashboard/integrations', label: 'Integrations', icon: Puzzle, end: false },
      { to: '/dashboard/models', label: 'Models', icon: Cpu, end: false },
      { to: '/dashboard/security', label: 'API & security', icon: Shield, end: false }
    ]
  },
  {
    id: 'account',
    label: 'ACCOUNT',
    items: [
      { to: '/dashboard/billing', label: 'Billing & Plans', icon: CreditCard, end: false },
      { to: '/dashboard/settings', label: 'Settings', icon: Settings, end: false },
      { to: '/dashboard/help', label: 'Help & Docs', icon: HelpCircle, end: false }
    ]
  }
];

export const topBarMeta = (pathname) => {
  const map = [
    { match: /^\/dashboard\/?$/, title: 'Dashboard', crumb: 'Overview · Updated just now' },
    { match: /^\/dashboard\/clones/, title: 'My Clones', crumb: 'Manage your AI personalities' },
    { match: /^\/dashboard\/create/, title: 'Create Clone', crumb: 'Onboarding wizard' },
    { match: /^\/dashboard\/analytics/, title: 'Analytics', crumb: 'Performance & growth' },
    { match: /^\/dashboard\/voice/, title: 'Voice Clone', crumb: 'Sound like you' },
    { match: /^\/dashboard\/training/, title: 'Training Data', crumb: 'Sources & uploads' },
    { match: /^\/dashboard\/share/, title: 'Share & Embed', crumb: 'Links & social' },
    { match: /^\/dashboard\/embed/, title: 'Embed Widget', crumb: 'Website integration' },
    { match: /^\/dashboard\/activity/, title: 'Activity', crumb: 'Workspace' },
    { match: /^\/dashboard\/integrations/, title: 'Integrations', crumb: 'Workspace' },
    { match: /^\/dashboard\/models/, title: 'Models', crumb: 'Workspace' },
    { match: /^\/dashboard\/security/, title: 'API & security', crumb: 'Workspace' },
    { match: /^\/dashboard\/billing/, title: 'Billing & Plans', crumb: 'Usage & upgrades' },
    { match: /^\/dashboard\/settings/, title: 'Settings', crumb: 'Profile & preferences' },
    { match: /^\/dashboard\/help/, title: 'Help & Docs', crumb: 'Guides & support' }
  ];
  const hit = map.find((m) => m.match.test(pathname));
  return hit || { title: 'Dashboard', crumb: 'Alter AI' };
};
