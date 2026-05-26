import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Check,
  ChevronDown,
  Code2,
  Copy,
  ExternalLink,
  FolderOpen,
  HelpCircle,
  LifeBuoy,
  Link as LinkIcon,
  Bell,
  Mail,
  MessageCircle,
  Mic,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';

const SUPPORT_EMAIL = 'alterai.tech@gmail.com';

const docs = [
  {
    id: 'clone-setup',
    category: 'Basics',
    icon: Sparkles,
    title: 'Complete clone setup (step by step)',
    summary: 'End-to-end guide: account → clone → train → test → publish → share or embed.',
    readTime: '12 min',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Alter AI lets you build a public AI clone trained on your content. Visitors chat at /chat/your-slug. You manage everything from the dashboard.',
          'Follow the steps below in order. Skipping training or publishing too early is the most common reason clones give weak answers.'
        ]
      },
      {
        heading: 'Step 1 — Sign in and open the dashboard',
        steps: [
          'Go to Auth and sign in with Google, GitHub, or X (via Supabase).',
          'After redirect, you land on Dashboard Home.',
          'Open Settings once to confirm your display name and avatar if you want them on account surfaces.'
        ]
      },
      {
        heading: 'Step 2 — Create a clone',
        steps: [
          'Open Create Clone (or My Clones → create).',
          'Set Name (how the clone introduces itself), Bio (what it represents), and Tone (friendly, professional, etc.).',
          'Pick a slug — lowercase, no spaces — this becomes your public URL: /chat/your-slug.',
          'Add Topics (press Enter after each) so starter questions and retrieval stay focused.',
          'Optional: Welcome message, topics to avoid, and avatar color.',
          'Save. The clone starts as draft/private.'
        ]
      },
      {
        heading: 'Step 3 — Add training data',
        steps: [
          'Open Training Data and select your clone.',
          'Add at least one source: Paste text, Q&A pairs, PDF/DOCX (Pro+), or links where your plan allows.',
          'Wait until status shows trained (embeddings are generated locally, then stored in Supabase).',
          'Add Q&A for facts that must stay exact: pricing, policies, booking steps, FAQs.',
          'Retest after each major upload — answers improve as chunk count grows.'
        ]
      },
      {
        heading: 'Step 4 — Test before going live',
        steps: [
          'From My Clones, open the chat preview or visit /chat/your-slug while logged in.',
          'Ask 5–10 real visitor questions. If answers are vague, add more training — do not publish yet.',
          'Edit welcome message and topics on the clone if starters feel off.',
          'Use Clear chat in the preview to reset the session while testing.'
        ]
      },
      {
        heading: 'Step 5 — Publish',
        steps: [
          'Open Share for that clone (or publish from My Clones).',
          'Turn visibility to Public / Live. Publishing requires at least one trained source.',
          'Copy the public link and open it in an incognito window to confirm visitors see the chat.',
          'Only share or embed after this check passes.'
        ]
      },
      {
        heading: 'Step 6 — Share or embed',
        steps: [
          'Share page: copy link, QR, or social share actions.',
          'Embed Widget (Creator plan): copy iframe or floating widget script for your website.',
          'Floating widget: paste script before </body>; test locally with /embed-demo.html and your slug.',
          'Track visits and conversations under Analytics.'
        ]
      },
      {
        heading: 'Optional — Voice (Creator + ElevenLabs)',
        body: [
          'Voice cloning in Alter requires Creator plan in the app and an ElevenLabs Starter (or higher) API key on the server. Record 30+ seconds on Dashboard → Voice, then enable voice in chat.',
          'If voice is not configured yet, text chat and embed still work normally.'
        ]
      }
    ]
  },
  {
    id: 'environment-setup',
    category: 'Basics',
    icon: Settings,
    title: 'Environment & database setup',
    summary: 'Configure .env, Supabase SQL, storage buckets, and run client + server locally.',
    readTime: '10 min',
    sections: [
      {
        heading: 'Prerequisites',
        list: [
          'Node.js 18+',
          'Supabase project (Auth + Postgres + Storage)',
          'Google Gemini API key (chat)',
          'Razorpay keys (billing — optional for local dev)'
        ]
      },
      {
        heading: 'Root .env file',
        body: [
          'Copy .env.example to .env in the project root. The client reads VITE_* variables; the server reads the rest.',
          'VITE_API_URL should point to your Express API (e.g. http://localhost:3001). CLIENT_URL should match your Vite dev URL (e.g. http://localhost:5173).',
          'Never put SUPABASE_SERVICE_ROLE_KEY or ElevenLabs keys in the frontend — server only.'
        ]
      },
      {
        heading: 'Run SQL in Supabase',
        body: [
          'Open Supabase → SQL Editor and run the scripts under server/sql/ for your project. At minimum: personalities/training tables (your schema), match_personality_embeddings.sql, billing_razorpay.sql, user_profile_settings.sql, user_notifications.sql, share_events.sql, voice_profiles.sql if using voice.',
          'Create Storage buckets: training-files (training uploads), avatars (profile photos), voice-samples (private, for voice cloning).'
        ]
      },
      {
        heading: 'Run locally',
        steps: [
          'Terminal 1: cd server → npm install → npx nodemon (port 3001).',
          'Terminal 2: cd client → npm install → npm run dev (port 5173).',
          'Open http://localhost:5173, sign in, and confirm API calls succeed (no long 401 timeouts).',
          'If auth fails with connect timeout, check VITE_SUPABASE_URL, firewall/VPN, and that the Supabase project is not paused.'
        ]
      }
    ]
  },
  {
    id: 'getting-started',
    category: 'Basics',
    icon: Sparkles,
    title: 'Quick start summary',
    summary: 'Short checklist after your environment is configured.',
    readTime: '3 min',
    sections: [
      {
        heading: 'Five-minute checklist',
        list: [
          'Create one clone with a clear slug.',
          'Add training → wait for trained status.',
          'Test at /chat/slug with real questions.',
          'Publish from Share when answers are good enough.',
          'Copy link or embed code (Creator for website widget).'
        ]
      },
      {
        heading: 'Before going public',
        list: [
          'Slug is short and memorable (your name or brand).',
          'At least one high-quality trained source exists.',
          'Welcome message sets expectations for visitors.',
          'You tested in an incognito window after publishing.'
        ]
      }
    ]
  },
  {
    id: 'clones',
    category: 'Clones',
    icon: MessageCircle,
    title: 'Managing clones',
    summary: 'Draft vs live, editing, publishing rules, and public chat behavior.',
    readTime: '6 min',
    sections: [
      {
        heading: 'Clone statuses',
        body: [
          'Draft / private: only you see the clone in the dashboard. Public chat and embeds return not found for visitors.',
          'Live / public: anyone with the link can open /chat/your-slug and send messages (within plan rate limits).',
          'Training strength grows with more chunks — check Training Data and Analytics when answers feel shallow.'
        ]
      },
      {
        heading: 'Editing a clone',
        steps: [
          'My Clones → Edit on a card (or open clone settings).',
          'Update name, bio, tone, topics, avoid list, welcome message, slug (careful — old links break if you change slug).',
          'Save changes. Retest chat after major edits.',
          'Use Delete only when you want to remove the clone and its training permanently.'
        ]
      },
      {
        heading: 'Publishing rules',
        list: [
          'You must have at least one trained source before publish.',
          'Unpublish (draft) anytime from Share — embeds and public links stop working for visitors.',
          'Rate limits apply per visitor per day and per creator per month depending on plan.'
        ]
      },
      {
        heading: 'Good clone structure',
        list: [
          'Name: clear and recognizable.',
          'Bio: one or two sentences that explain who the clone represents.',
          'Tone: match how you want the clone to sound in public conversations.',
          'Welcome message: explain what visitors can ask without overpromising.',
          'Topics: 3–6 focused themes visitors can tap as starters.'
        ]
      }
    ]
  },
  {
    id: 'training-data',
    category: 'Training',
    icon: FolderOpen,
    title: 'Training data guide',
    summary: 'Sources by plan, processing flow, and how to improve answer quality.',
    readTime: '9 min',
    sections: [
      {
        heading: 'How training works',
        body: [
          'Content is chunked (~400 tokens), embedded locally with Xenova (768-dim vectors), stored in Supabase pgvector, then retrieved when visitors ask questions. Gemini generates replies using that context plus your clone tone and bio.',
          'After upload, wait for status trained. Failed items show an error — fix content or plan limits and retry.'
        ]
      },
      {
        heading: 'Supported training sources',
        body: [
          'All plans: paste text, Q&A pairs, some links. Pro/Creator: PDF, DOCX, more files and sources. Creator unlocks additional social imports where enabled in Training Data.',
          'Use Q&A pairs for facts that must stay consistent: pricing, policies, contact info, booking steps.'
        ]
      },
      {
        heading: 'Training quality checklist',
        list: [
          'Remove duplicate or outdated content before uploading.',
          'Prefer specific examples over broad marketing copy.',
          'Add source material in the same language visitors will use.',
          'Update training whenever your offer, brand, or policies change.',
          'Retest the clone after every major training update.'
        ]
      },
      {
        heading: 'What not to upload',
        body: [
          'Do not upload secrets, passwords, private keys, legal documents you cannot share, medical records, or confidential customer data. Treat anything used for training as information the clone may rely on in conversation.'
        ]
      }
    ]
  },
  {
    id: 'sharing',
    category: 'Sharing',
    icon: LinkIcon,
    title: 'Sharing your clone',
    summary: 'Publish, copy links, QR codes, and social distribution.',
    readTime: '5 min',
    sections: [
      {
        heading: 'Share page workflow',
        steps: [
          'Dashboard → Share (pick clone if you have several).',
          'Toggle Public / Live when training is ready.',
          'Copy the chat URL — format: your-domain.com/chat/slug.',
          'Use QR, platform buttons, or copy actions; share events may appear in Analytics.',
          'Switch back to private while editing sensitive training.'
        ]
      },
      {
        heading: 'Public links',
        body: [
          'When public, anyone with the link can chat. You receive in-app notifications for new conversations if enabled under Settings → Notifications.',
          'Test in incognito after publishing so you see exactly what visitors see.'
        ]
      },
      {
        heading: 'Where to share',
        list: [
          'Personal website, portfolio, or Link-in-bio.',
          'LinkedIn, X, WhatsApp, and creator profiles.',
          'Email signatures and newsletters.',
          'Product pages, course pages, and support docs.'
        ]
      }
    ]
  },
  {
    id: 'embed-widget',
    category: 'Embed',
    icon: Code2,
    title: 'Embedding Alter on your website',
    summary: 'Iframe embed vs floating widget.js — setup, testing, and production.',
    readTime: '10 min',
    code: `<!-- Floating widget (Creator plan) — paste before </body> -->
<script
  src="https://your-domain.com/widget.js"
  data-slug="your-clone-slug"
  data-theme="dark"
  data-position="bottom-right"
  data-color="#00D4FF"
  data-label="Chat with AI"
  async></script>`,
    sections: [
      {
        heading: 'Who can embed',
        body: [
          'Website embed codes (iframe + floating script) are available on the Creator plan. Free and Pro users can still use the public chat link anywhere.',
          'Copy snippets from Dashboard → Embed Widget or Share → Embed tab after the clone is public.'
        ]
      },
      {
        heading: 'How the floating widget works',
        body: [
          'Your site loads widget.js from the same domain as your Alter app (e.g. your-domain.com/widget.js).',
          'The script adds a corner launcher button. On click, it opens a panel with an iframe pointing to /chat/slug?embed=true&widget=true.',
          'Chat runs inside Alter; the script is only the shell. widget.js and /chat must share one origin (your deployed frontend URL).'
        ]
      },
      {
        heading: 'Iframe embed',
        steps: [
          'Copy the iframe snippet from Embed Widget.',
          'Paste into your page HTML where the chat section should appear.',
          'Set height to at least 560–600px for comfortable scrolling.',
          'URL includes ?embed=true for a compact chat layout without the full marketing header.'
        ]
      },
      {
        heading: 'Floating widget setup',
        steps: [
          'Publish the clone first.',
          'Copy the script tag from Embed Widget (Share → Script tab).',
          'Paste before </body> on every page where you want the launcher.',
          'Set data-slug to your public clone slug exactly as in /chat/slug.',
          'Optional: data-theme (dark|light), data-position (bottom-right, bottom-left, top-right, top-left), data-color (#hex), data-label (button text).'
        ]
      },
      {
        heading: 'Local testing',
        steps: [
          'Run client (npm run dev) and server (nodemon).',
          'Edit client/public/embed-demo.html — replace YOUR_SLUG with your slug.',
          'Open http://localhost:5173/embed-demo.html and click the launcher.',
          'Confirm http://localhost:5173/widget.js loads (not 404).'
        ]
      },
      {
        heading: 'Production checklist',
        list: [
          'CLIENT_URL / PUBLIC_APP_URL in server .env matches your live site.',
          'widget.js is deployed with the frontend (Vite public/ folder).',
          'Clone is public; test embed in incognito.',
          'If iframe is blank, check CSP frame-ancestors on your host (Alter allows embedding on /chat routes).',
          'Third-party site must allow scripts from your Alter domain.'
        ]
      }
    ]
  },
  {
    id: 'notifications',
    category: 'Account',
    icon: Bell,
    title: 'Notifications',
    summary: 'Dashboard bell, email preferences, and what triggers each alert.',
    readTime: '5 min',
    sections: [
      {
        heading: 'In-app notifications (bell)',
        body: [
          'The bell in the dashboard top bar shows alerts: new visitor chats, training complete/failed, clone published, billing events, plan limits, and voice ready.',
          'Click an item to mark read and jump to the relevant page. Use Mark all read or delete per item.',
          'Requires user_notifications table — run server/sql/user_notifications.sql in Supabase if the bell shows errors.'
        ]
      },
      {
        heading: 'Settings → Notifications',
        steps: [
          'Open Settings → Notifications tab.',
          'Master toggles: In-app notifications and Email notifications.',
          'Per category: conversations, training, publish, billing, plan limits, voice, digests, product updates.',
          'Save. Email categories only send when SMTP is configured on the server (SMTP_USER, SMTP_PASS in .env).'
        ]
      },
      {
        heading: 'What triggers alerts',
        list: [
          'New conversation — first message from a visitor on a public clone.',
          'Training updates — source finished training or failed.',
          'Clone published — visibility turned public or back to draft.',
          'Billing — successful subscription payment or renewal reminders.',
          'Voice ready — voice clone completed (when ElevenLabs is configured).'
        ]
      }
    ]
  },
  {
    id: 'voice',
    category: 'Voice',
    icon: Mic,
    title: 'Voice cloning',
    summary: 'Creator plan in Alter, ElevenLabs API, recording, and chat playback.',
    readTime: '7 min',
    sections: [
      {
        heading: 'Requirements',
        list: [
          'Alter AI Creator plan (dashboard gate).',
          'ElevenLabs Starter or higher on the API key used in server .env (ELEVENLABS_API_KEY).',
          'Supabase bucket voice-samples (private) and voice_profiles.sql applied.',
          'Clone must be public for visitors to hear voice in chat when enabled.'
        ]
      },
      {
        heading: 'Setup steps',
        steps: [
          'Add ELEVENLABS_API_KEY to root .env (server only). Restart nodemon.',
          'Dashboard → Voice → select clone → record at least 30 seconds in a quiet room.',
          'Click Clone My Voice. On success, enable voice on the clone in chat settings.',
          'On the public chat page, toggle Voice on — assistant replies can play as audio (short responses).'
        ]
      },
      {
        heading: 'Recording tips',
        list: [
          'Quiet room, no music or background noise.',
          'Normal speaking voice, steady distance from the mic.',
          'Minimum 30 seconds; more variety improves consistency.',
          'Only use voice you own or have rights to clone.'
        ]
      },
      {
        heading: 'Troubleshooting',
        body: [
          '“Subscription does not include instant voice cloning” — upgrade your ElevenLabs account (Starter+), not just Alter Creator.',
          '“Error parsing the body” — usually fixed by server-side upload format; retry after a clean recording.',
          'Voice toggle greyed out — voice not enabled for that clone or clone not public.'
        ]
      }
    ]
  },
  {
    id: 'analytics',
    category: 'Analytics',
    icon: BarChart3,
    title: 'Understanding analytics',
    summary: 'Read conversations, visitors, shares, and source performance without guessing.',
    readTime: '5 min',
    sections: [
      {
        heading: 'Core metrics',
        list: [
          'Conversations: chat sessions started with your clone.',
          'Visitors: unique visitors where tracking data is available.',
          'Messages: total user and clone messages across conversations.',
          'Shares: copy, social, QR, and embed-related share actions.'
        ]
      },
      {
        heading: 'How to use analytics',
        body: [
          'Use analytics to find weak spots. If visitors start conversations but stop quickly, improve the welcome message and add clearer starter questions. If shares are low, place the public link in higher-traffic channels.'
        ]
      }
    ]
  },
  {
    id: 'account-settings',
    category: 'Account',
    icon: Settings,
    title: 'Profile and account settings',
    summary: 'Update your profile, avatar, website, location, and in-app or email notification preferences.',
    readTime: '4 min',
    sections: [
      {
        heading: 'Profile updates',
        body: [
          'Changes in Settings update the profile stored for your account and refresh across the dashboard immediately. Your avatar appears in account menus and other user-facing dashboard surfaces.'
        ]
      },
      {
        heading: 'Notifications',
        body: [
          'Open Settings → Notifications to control in-app alerts (dashboard bell) and email categories.',
          'In-app alerts cover new visitor chats, training results, clone publish status, billing, plan limits, and voice cloning.',
          'Email digests require SMTP on the server and the master “Email notifications” toggle.'
        ]
      },
      {
        heading: 'Security',
        body: [
          'Authentication is handled by your sign-in provider through Supabase Auth. If you signed in with Google, GitHub, or X, manage provider-level password and account security from that provider.'
        ]
      }
    ]
  },
  {
    id: 'billing',
    category: 'Billing',
    icon: Zap,
    title: 'Billing and plan limits',
    summary: 'Free, Pro, Creator — Razorpay upgrades and what each tier unlocks.',
    readTime: '6 min',
    sections: [
      {
        heading: 'Plans (INR via Razorpay)',
        body: [
          'Free: limited clones, training, and visitor messages — good for testing.',
          'Pro: more clones, PDF/DOCX training, higher limits.',
          'Creator: highest limits, voice cloning in Alter, website embed (iframe + widget), and full analytics-style usage.',
          'Upgrade from Dashboard → Billing & Plans. Payments use Razorpay; keep webhook configured in production.'
        ]
      },
      {
        heading: 'When you hit a limit',
        body: [
          'Training upload, chunk count, visitor daily caps, or creator monthly message caps may block actions. The UI and notifications show which limit applied.',
          'Upgrade plan or reduce usage; downgrade rules prevent paying for a lower tier while a higher one is active in the same period.'
        ]
      },
      {
        heading: 'Upgrade checklist',
        list: [
          'Pro when you need PDFs and more training volume.',
          'Creator before website embed or voice cloning.',
          'Confirm Razorpay keys and CLIENT_URL in .env for successful checkout redirect.'
        ]
      }
    ]
  },
  {
    id: 'privacy-safety',
    category: 'Safety',
    icon: ShieldCheck,
    title: 'Privacy and safety practices',
    summary: 'Protect sensitive information and set realistic expectations for AI answers.',
    readTime: '6 min',
    sections: [
      {
        heading: 'Safe usage',
        body: [
          'AI clones can make mistakes. Do not present a clone as a guaranteed replacement for professional legal, financial, medical, or emergency advice.',
          'Use training data that you are comfortable having the clone reference. Keep confidential client information and private credentials out of training data.'
        ]
      },
      {
        heading: 'Publishing responsibility',
        list: [
          'Review answers before sharing widely.',
          'Keep public clones updated as your information changes.',
          'Make private any clone that gives outdated or unsafe responses.',
          'Never upload content you do not have the rights to use.'
        ]
      }
    ]
  }
];

const faqs = [
  {
    q: 'Why does my clone say it does not know something?',
    a: 'Usually missing training on that topic. Add Q&A pairs or documents that answer it directly, wait for trained status, then test again.'
  },
  {
    q: 'Can I keep a clone private?',
    a: 'Yes. Keep draft/private on the Share page. Visitors cannot open /chat/slug or use embed codes until you publish.'
  },
  {
    q: 'Why is my embed or widget not loading?',
    a: 'Confirm the clone is public, data-slug matches your slug, widget.js loads from the same domain as /chat (your CLIENT_URL), and your site allows that script/iframe. Test with /embed-demo.html locally first.'
  },
  {
    q: 'Why do I get 401 errors or login timeouts?',
    a: 'Often Supabase connectivity: check VITE_SUPABASE_URL and keys in .env, project not paused, no VPN/firewall block, restart server and client. Run user_notifications.sql if the bell fails.'
  },
  {
    q: 'Why does voice cloning fail?',
    a: 'You need Alter Creator plus ElevenLabs Starter+ on the API key in server .env. Record 30+ seconds, ensure voice-samples bucket exists, restart nodemon after adding ELEVENLABS_API_KEY.'
  },
  {
    q: 'Where does my profile photo appear?',
    a: 'Settings → profile avatar shows on dashboard account UI. Clone color/avatar is set per clone at creation or edit.'
  },
  {
    q: 'How do notifications work?',
    a: 'The dashboard bell shows in-app alerts when enabled under Settings → Notifications. Email alerts need SMTP configured in server .env and Email notifications turned on.'
  },
  {
    q: 'Can I delete old training data?',
    a: 'Use Training Data to remove outdated sources, then retest key questions. Removing chunks may change answers until you add better material.'
  }
];

const quickLinks = [
  { label: 'Create a clone', href: '/dashboard/create', icon: Sparkles },
  { label: 'Add training data', href: '/dashboard/training', icon: FolderOpen },
  { label: 'Share a clone', href: '/dashboard/share', icon: LinkIcon },
  { label: 'Embed widget', href: '/dashboard/embed', icon: Code2 },
  { label: 'Voice cloning', href: '/dashboard/voice', icon: Mic },
  { label: 'Billing', href: '/dashboard/billing', icon: Zap },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings }
];

const categories = ['All', ...Array.from(new Set(docs.map((doc) => doc.category)))];

/** Keep wheel/touch scroll inside help panels (Locomotive/Lenis no longer wraps dashboard). */
const trapPanelWheel = (event) => {
  const el = event.currentTarget;
  if (el.scrollHeight <= el.clientHeight + 1) return;
  event.stopPropagation();
};

const Help = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [activeDocId, setActiveDocId] = useState('clone-setup');
  const [openFaq, setOpenFaq] = useState(faqs[0].q);
  const [copied, setCopied] = useState('');

  const filteredDocs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return docs.filter((doc) => {
      const matchesCategory = category === 'All' || doc.category === category;
      const searchable = `${doc.title} ${doc.summary} ${doc.category} ${doc.sections
        .map(
          (section) =>
            `${section.heading} ${(section.body || []).join(' ')} ${(section.list || []).join(' ')} ${(section.steps || []).join(' ')}`
        )
        .join(' ')}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, query]);

  const activeDoc = filteredDocs.find((doc) => doc.id === activeDocId) || filteredDocs[0] || docs[0];
  const ActiveIcon = activeDoc.icon;

  const copySnippet = async (doc) => {
    if (!doc.code) return;
    await navigator.clipboard.writeText(doc.code);
    setCopied(doc.id);
    window.setTimeout(() => setCopied(''), 1800);
  };

  return (
    <>
      <main className="help-page">
        <section className="help-hero">
          <div>
            <p className="help-eyebrow">Documentation</p>
            <h1>Help & docs</h1>
            <p className="help-hero-copy">
              Practical guides for building, training, publishing, embedding, and maintaining your Alter AI clones.
            </p>
          </div>
          <div className="help-support-card">
            <LifeBuoy size={18} />
            <strong>Need help?</strong>
            <span>Email {SUPPORT_EMAIL} with your clone slug, what you tried, and screenshots if possible.</span>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Alter%20AI%20support%20request`}>
              <Mail size={14} />
              {SUPPORT_EMAIL}
            </a>
          </div>
        </section>

        <section className="help-search-row">
          <div className="help-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search docs, embeds, training, billing..."
            />
          </div>
          <div className="help-categories">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? 'is-active' : ''}
                onClick={() => {
                  setCategory(item);
                  setActiveDocId('');
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="help-layout">
          <aside className="help-doc-list help-panel-scroll" onWheel={trapPanelWheel}>
            {filteredDocs.length ? (
              filteredDocs.map((doc) => {
                const Icon = doc.icon;
                const isActive = activeDoc.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    className={isActive ? 'is-active' : ''}
                    onClick={() => setActiveDocId(doc.id)}
                  >
                    <Icon size={16} />
                    <span>
                      <strong>{doc.title}</strong>
                      <small>{doc.category} - {doc.readTime}</small>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="help-empty">
                <HelpCircle size={18} />
                No docs match that search.
              </div>
            )}
          </aside>

          <article className="help-article">
            <header>
              <span className="help-article-icon">
                <ActiveIcon size={18} />
              </span>
              <div>
                <p>{activeDoc.category} - {activeDoc.readTime}</p>
                <h2>{activeDoc.title}</h2>
                <span>{activeDoc.summary}</span>
              </div>
            </header>

            <div className="help-article-body help-panel-scroll" onWheel={trapPanelWheel}>
              {activeDoc.sections.map((section) => (
                <section key={section.heading}>
                  <h3>{section.heading}</h3>
                  {section.body?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.steps ? (
                    <ol className="help-steps">
                      {section.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  ) : null}
                  {section.list ? (
                    <ul>
                      {section.list.map((item) => (
                        <li key={item}>
                          <Check size={14} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}

              {activeDoc.code ? (
                <section className="help-code-section">
                  <div className="help-code-head">
                    <h3>Example snippet</h3>
                    <button type="button" onClick={() => copySnippet(activeDoc)}>
                      {copied === activeDoc.id ? <Check size={14} /> : <Copy size={14} />}
                      {copied === activeDoc.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre><code>{activeDoc.code}</code></pre>
                </section>
              ) : null}
            </div>
          </article>
        </section>

        <section className="help-quick-links">
          <div className="help-section-head">
            <p>Shortcuts</p>
            <h2>Common tasks</h2>
          </div>
          <div className="help-link-grid">
            {quickLinks.map(({ label, href, icon: Icon }) => (
              <Link key={label} to={href}>
                <Icon size={17} />
                {label}
                <ExternalLink size={13} />
              </Link>
            ))}
          </div>
        </section>

        <section className="help-faq">
          <div className="help-section-head">
            <p>FAQ</p>
            <h2>Troubleshooting</h2>
          </div>
          <div className="help-faq-list">
            {faqs.map((item) => {
              const isOpen = openFaq === item.q;
              return (
                <button key={item.q} type="button" className={isOpen ? 'is-open' : ''} onClick={() => setOpenFaq(isOpen ? '' : item.q)}>
                  <span>
                    <strong>{item.q}</strong>
                    {isOpen ? <em>{item.a}</em> : null}
                  </span>
                  <ChevronDown size={16} />
                </button>
              );
            })}
          </div>
        </section>
      </main>

      <HelpStyles />
    </>
  );
};

const HelpStyles = () => (
  <style>{`
    .help-page {
      width: min(1120px, 100%);
      margin: 0 auto;
      padding: 28px 0 76px;
      color: #F0EEF8;
      overflow: visible;
    }

    .help-hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 280px;
      gap: 18px;
      align-items: stretch;
      margin-bottom: 18px;
    }

    .help-hero > div:first-child,
    .help-support-card,
    .help-search-row,
    .help-doc-list,
    .help-article,
    .help-quick-links,
    .help-faq {
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      background: rgba(255,255,255,0.025);
    }

    .help-hero > div:first-child {
      padding: 24px;
    }

    .help-eyebrow,
    .help-search,
    .help-categories,
    .help-doc-list,
    .help-article header p,
    .help-article section h3,
    .help-code-head,
    .help-section-head p,
    .help-link-grid,
    .help-faq-list,
    .help-support-card {
      font-family: 'DM Mono', monospace;
    }

    .help-eyebrow,
    .help-section-head p {
      margin: 0 0 7px;
      color: rgba(255,255,255,0.34);
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .help-hero h1,
    .help-section-head h2,
    .help-article header h2 {
      margin: 0;
      color: #fff;
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-weight: 300;
      letter-spacing: 0;
    }

    .help-hero h1 {
      font-size: 34px;
    }

    .help-hero-copy {
      max-width: 680px;
      margin: 10px 0 0;
      color: rgba(240,238,248,0.48);
      font: 14px/1.7 Inter, system-ui, sans-serif;
    }

    .help-support-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 18px;
      color: rgba(255,255,255,0.48);
      font-size: 11px;
      line-height: 1.55;
    }

    .help-support-card svg {
      color: rgba(0,212,255,0.78);
    }

    .help-support-card strong {
      color: #fff;
      font-weight: 400;
    }

    .help-support-card a {
      display: inline-flex;
      width: fit-content;
      min-height: 36px;
      align-items: center;
      gap: 7px;
      margin-top: auto;
      border: 1px solid rgba(0,212,255,0.28);
      border-radius: 9px;
      background: rgba(0,212,255,0.08);
      padding: 0 12px;
      color: rgba(0,212,255,0.9);
    }

    .help-search-row {
      display: grid;
      gap: 12px;
      margin-bottom: 18px;
      padding: 14px;
    }

    .help-search {
      position: relative;
    }

    .help-search svg {
      position: absolute;
      left: 13px;
      top: 13px;
      color: rgba(255,255,255,0.32);
    }

    .help-search input {
      width: 100%;
      height: 42px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      background: rgba(255,255,255,0.035);
      color: #fff;
      outline: 0;
      padding: 0 14px 0 38px;
      font: 12px 'DM Mono', monospace;
    }

    .help-search input:focus {
      border-color: rgba(0,212,255,0.34);
    }

    .help-categories {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .help-categories button {
      min-height: 32px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 999px;
      background: transparent;
      padding: 0 12px;
      color: rgba(255,255,255,0.48);
      font-size: 10px;
    }

    .help-categories button.is-active,
    .help-categories button:hover {
      border-color: rgba(0,212,255,0.28);
      background: rgba(0,212,255,0.08);
      color: rgba(0,212,255,0.9);
    }

    .help-layout {
      display: grid;
      grid-template-columns: minmax(250px, 300px) minmax(0, 1fr);
      gap: 18px;
      align-items: stretch;
    }

    .help-doc-list,
    .help-article {
      --help-panel-height: min(560px, calc(100dvh - 340px));
      height: var(--help-panel-height);
      min-height: var(--help-panel-height);
      max-height: var(--help-panel-height);
    }

    .help-doc-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px;
      overflow-x: hidden;
      overflow-y: scroll;
      overscroll-behavior: contain;
      touch-action: pan-y;
    }

    .help-panel-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.28) rgba(255, 255, 255, 0.06);
    }

    .help-panel-scroll::-webkit-scrollbar {
      width: 6px;
    }

    .help-panel-scroll::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.06);
      border-radius: 4px;
    }

    .help-panel-scroll::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.22);
      border-radius: 4px;
    }

    .help-panel-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.32);
    }

    .help-doc-list button {
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid transparent;
      border-radius: 10px;
      background: transparent;
      padding: 11px;
      color: rgba(255,255,255,0.48);
      text-align: left;
    }

    .help-doc-list button svg {
      color: rgba(255,255,255,0.34);
      flex-shrink: 0;
    }

    .help-doc-list button strong,
    .help-doc-list button small {
      display: block;
    }

    .help-doc-list button strong {
      color: rgba(255,255,255,0.76);
      font-size: 11px;
      font-weight: 400;
      line-height: 1.45;
    }

    .help-doc-list button small {
      margin-top: 4px;
      color: rgba(255,255,255,0.28);
      font-size: 9px;
    }

    .help-doc-list button.is-active,
    .help-doc-list button:hover {
      border-color: rgba(0,212,255,0.18);
      background: rgba(0,212,255,0.06);
    }

    .help-doc-list button.is-active svg,
    .help-doc-list button.is-active strong {
      color: rgba(0,212,255,0.9);
    }

    .help-empty {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      color: rgba(255,255,255,0.4);
      font-size: 11px;
    }

    .help-article {
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 24px;
    }

    .help-article header {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      padding-bottom: 20px;
    }

    .help-article-body {
      flex: 1;
      min-height: 0;
      overflow-x: hidden;
      overflow-y: scroll;
      overscroll-behavior: contain;
      touch-action: pan-y;
      padding-right: 6px;
    }

    .help-article-body > section:first-of-type {
      margin-top: 20px;
    }

    .help-article header > div {
      min-width: 0;
    }

    .help-article-icon {
      display: inline-flex;
      width: 42px;
      height: 42px;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(0,212,255,0.24);
      border-radius: 12px;
      background: rgba(0,212,255,0.07);
      color: rgba(0,212,255,0.9);
      flex-shrink: 0;
    }

    .help-article-icon svg {
      display: block;
    }

    .help-article header p {
      margin: 0 0 6px;
      color: rgba(255,255,255,0.34);
      font-size: 10px;
    }

    .help-article header h2 {
      font-size: clamp(24px, 3vw, 30px);
      line-height: 1.12;
      overflow-wrap: anywhere;
    }

    .help-article header > div > span {
      display: block;
      margin-top: 8px;
      color: rgba(240,238,248,0.48);
      font: 13px/1.65 Inter, system-ui, sans-serif;
    }

    .help-article section {
      margin-top: 24px;
    }

    .help-article section h3 {
      margin: 0 0 10px;
      color: #fff;
      font-size: 12px;
      font-weight: 400;
    }

    .help-article section p {
      margin: 0 0 12px;
      color: rgba(240,238,248,0.56);
      font: 14px/1.75 Inter, system-ui, sans-serif;
    }

    .help-article ul {
      display: grid;
      gap: 9px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .help-article li {
      display: flex;
      gap: 9px;
      align-items: flex-start;
      color: rgba(240,238,248,0.56);
      font: 13px/1.6 Inter, system-ui, sans-serif;
    }

    .help-article li svg {
      margin-top: 3px;
      color: #059669;
      flex-shrink: 0;
    }

    .help-steps {
      margin: 0 0 14px;
      padding-left: 22px;
      display: grid;
      gap: 10px;
    }

    .help-steps li {
      color: rgba(240,238,248,0.58);
      font: 14px/1.7 Inter, system-ui, sans-serif;
      padding-left: 4px;
    }

    .help-steps li::marker {
      color: rgba(0,212,255,0.75);
      font-family: 'DM Mono', monospace;
      font-size: 11px;
    }

    .help-code-section {
      border-top: 1px solid rgba(255,255,255,0.07);
      padding-top: 18px;
    }

    .help-code-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }

    .help-code-head h3 {
      margin: 0;
    }

    .help-code-head button {
      display: inline-flex;
      min-height: 34px;
      align-items: center;
      gap: 7px;
      border: 1px solid rgba(0,212,255,0.28);
      border-radius: 9px;
      background: rgba(0,212,255,0.08);
      padding: 0 12px;
      color: rgba(0,212,255,0.9);
      font: 10px 'DM Mono', monospace;
    }

    .help-code-section pre {
      overflow: auto;
      margin: 0;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 10px;
      background: #090909;
      padding: 14px;
      color: rgba(240,238,248,0.68);
      font: 11px/1.7 'DM Mono', monospace;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .help-quick-links,
    .help-faq {
      margin-top: 18px;
      padding: 20px;
    }

    .help-section-head h2 {
      font-size: 24px;
    }

    .help-link-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin-top: 16px;
    }

    .help-link-grid a {
      display: flex;
      align-items: center;
      gap: 9px;
      min-height: 46px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      background: rgba(255,255,255,0.025);
      padding: 0 12px;
      color: rgba(255,255,255,0.66);
      font-size: 11px;
    }

    .help-link-grid a svg:last-child {
      margin-left: auto;
      color: rgba(255,255,255,0.28);
    }

    .help-link-grid a:hover {
      border-color: rgba(0,212,255,0.24);
      color: rgba(0,212,255,0.9);
    }

    .help-faq-list {
      display: grid;
      gap: 10px;
      margin-top: 16px;
    }

    .help-faq-list button {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      background: rgba(255,255,255,0.025);
      padding: 15px;
      color: rgba(255,255,255,0.68);
      text-align: left;
    }

    .help-faq-list button strong,
    .help-faq-list button em {
      display: block;
    }

    .help-faq-list button strong {
      color: rgba(255,255,255,0.78);
      font-size: 12px;
      font-weight: 400;
    }

    .help-faq-list button em {
      margin-top: 9px;
      color: rgba(240,238,248,0.52);
      font: 13px/1.65 Inter, system-ui, sans-serif;
      font-style: normal;
    }

    .help-faq-list button svg {
      flex-shrink: 0;
      transition: transform 160ms ease;
    }

    .help-faq-list button.is-open {
      border-color: rgba(0,212,255,0.18);
    }

    .help-faq-list button.is-open svg {
      transform: rotate(180deg);
    }

    @media (max-width: 980px) {
      .help-hero,
      .help-layout {
        grid-template-columns: 1fr;
      }

      .help-doc-list,
      .help-article {
        --help-panel-height: min(480px, calc(100dvh - 360px));
      }
    }

    @media (max-width: 720px) {
      .help-page {
        padding: 22px 0 76px;
      }

      .help-hero h1 {
        font-size: 30px;
      }

      .help-link-grid {
        grid-template-columns: 1fr;
      }

      .help-article {
        padding: 18px;
      }

      .help-article header {
        flex-direction: column;
      }
    }
  `}</style>
);

export default Help;
