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
  Mail,
  MessageCircle,
  Mic,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';

const docs = [
  {
    id: 'getting-started',
    category: 'Basics',
    icon: Sparkles,
    title: 'Getting started with Alter',
    summary: 'Create your first AI clone, train it, publish it, and share it with visitors.',
    readTime: '6 min',
    sections: [
      {
        heading: 'Recommended setup flow',
        body: [
          'Start by creating one focused clone. Give it a clear name, short bio, tone, and a simple slug that you are comfortable sharing publicly.',
          'Add training data next. A clone can only answer well when it has useful source material, so upload documents, paste writing samples, add Q&A pairs, or connect supported content sources.',
          'Test the clone from your chat page before publishing. Ask questions your visitors are likely to ask and add more training data when answers feel thin or generic.'
        ]
      },
      {
        heading: 'Before going public',
        list: [
          'Use a short slug such as your name, brand, or project.',
          'Add at least one high-quality training source.',
          'Check the welcome message and starter questions.',
          'Publish only when answers are accurate enough for real visitors.'
        ]
      }
    ]
  },
  {
    id: 'clones',
    category: 'Clones',
    icon: MessageCircle,
    title: 'Managing clones',
    summary: 'Understand clone status, editing, deleting, and public chat behavior.',
    readTime: '5 min',
    sections: [
      {
        heading: 'Clone statuses',
        body: [
          'Draft clones are private and only visible inside your dashboard. Live clones are public and can be opened from the share link.',
          'Training status depends on the amount and processing state of your uploaded or pasted source material. More complete training produces better answers.'
        ]
      },
      {
        heading: 'Good clone structure',
        list: [
          'Name: clear and recognizable.',
          'Bio: one or two sentences that explain who the clone represents.',
          'Tone: match how you want the clone to sound in public conversations.',
          'Welcome message: explain what visitors can ask without overpromising.'
        ]
      }
    ]
  },
  {
    id: 'training-data',
    category: 'Training',
    icon: FolderOpen,
    title: 'Training data guide',
    summary: 'Learn what to upload, how to structure knowledge, and how to improve answers.',
    readTime: '8 min',
    sections: [
      {
        heading: 'Supported training sources',
        body: [
          'Alter supports direct text, Q&A pairs, documents, links/RSS, and social-style content sources where enabled. The best results come from clean, specific content written in your actual voice.',
          'Use Q&A pairs for factual answers that must be consistent, such as pricing, availability, booking steps, service policies, or frequently asked questions.'
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
    summary: 'Publish your clone, copy the public link, and share it across your channels.',
    readTime: '4 min',
    sections: [
      {
        heading: 'Public links',
        body: [
          'The Share page is the main control center for public visibility. When a clone is public, anyone with the link can open the chat page and start a conversation.',
          'Keep a clone private while you are still editing training data or testing answers. Public links should only be shared after the clone is ready for real visitors.'
        ]
      },
      {
        heading: 'Where to share',
        list: [
          'Personal website or portfolio.',
          'LinkedIn, X, WhatsApp, and creator profiles.',
          'Email signatures and newsletters.',
          'Landing pages, product pages, and support pages.'
        ]
      }
    ]
  },
  {
    id: 'embed-widget',
    category: 'Embed',
    icon: Code2,
    title: 'Embedding Alter on your website',
    summary: 'Use iframe or floating widget snippets to place your clone on a website.',
    readTime: '7 min',
    code: `<iframe
  src="https://your-domain.com/chat/your-clone?embed=true"
  width="100%"
  height="600"
  style="border:0;border-radius:16px"
  allow="microphone"
  title="Alter AI Clone">
</iframe>`,
    sections: [
      {
        heading: 'Iframe embed',
        body: [
          'Use the iframe when you want the clone to appear as a full section inside a page. This works well on portfolio pages, product support pages, and gated community pages.'
        ]
      },
      {
        heading: 'Floating widget',
        body: [
          'Use the widget script when you want a small launcher in the corner of your site. It is better for general websites where visitors may need quick access without dedicating a full page section.'
        ]
      },
      {
        heading: 'Embed checklist',
        list: [
          'Publish the clone before copying embed code.',
          'Use the embed preview to check layout before shipping.',
          'Keep the iframe height at 560px or higher for comfortable chat.',
          'Test on mobile and desktop after adding the code to your site.'
        ]
      }
    ]
  },
  {
    id: 'voice',
    category: 'Voice',
    icon: Mic,
    title: 'Voice cloning',
    summary: 'Prepare clean voice samples and understand when voice features are available.',
    readTime: '5 min',
    sections: [
      {
        heading: 'Recording tips',
        list: [
          'Record in a quiet room without music or background noise.',
          'Use a normal speaking voice and consistent distance from the microphone.',
          'Avoid clipped audio, long silences, and multiple speakers.',
          'Only upload voice data you own or have permission to use.'
        ]
      },
      {
        heading: 'Availability',
        body: [
          'Voice features may depend on your plan and the current product configuration. If voice controls are disabled, check Billing & Plans or contact support for access details.'
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
    summary: 'Update your profile, avatar, website, location, and notification preferences.',
    readTime: '4 min',
    sections: [
      {
        heading: 'Profile updates',
        body: [
          'Changes in Settings update the profile stored for your account and refresh across the dashboard immediately. Your avatar appears in account menus and other user-facing dashboard surfaces.'
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
    summary: 'Know when plan limits apply and how upgrades affect clone features.',
    readTime: '4 min',
    sections: [
      {
        heading: 'Plan limits',
        body: [
          'Plans can limit clone count, training sources, analytics depth, voice access, or advanced sharing features. When an action is blocked, the dashboard should explain which limit was reached.'
        ]
      },
      {
        heading: 'Upgrade checklist',
        list: [
          'Upgrade when you need more clones or training capacity.',
          'Review plan features before publishing high-traffic embeds.',
          'Contact support for creator or business workflows that need custom limits.'
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
    a: 'The clone probably does not have enough relevant training data. Add direct Q&A pairs or clearer documents covering that topic, then test again.'
  },
  {
    q: 'Can I keep a clone private?',
    a: 'Yes. Keep it in draft/private mode from the Share page. Private clones cannot be opened by public visitors or embedded on a website.'
  },
  {
    q: 'Why is my embed not loading?',
    a: 'Check that the clone is public, the iframe source uses the correct chat URL, and your website does not block iframes or third-party scripts with a strict content security policy.'
  },
  {
    q: 'Where does my profile photo appear?',
    a: 'Your avatar is used across dashboard account surfaces. Clone avatars are separate and are managed from clone creation or clone settings.'
  },
  {
    q: 'Can I delete old training data?',
    a: 'Use the Training Data page to review and remove outdated sources when available. After changing sources, retest important answers.'
  }
];

const quickLinks = [
  { label: 'Create a clone', href: '/dashboard/create', icon: Sparkles },
  { label: 'Add training data', href: '/dashboard/training', icon: FolderOpen },
  { label: 'Share a clone', href: '/dashboard/share', icon: LinkIcon },
  { label: 'Embed widget', href: '/dashboard/embed', icon: Code2 },
  { label: 'Billing', href: '/dashboard/billing', icon: Zap },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings }
];

const categories = ['All', ...Array.from(new Set(docs.map((doc) => doc.category)))];

const Help = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [activeDocId, setActiveDocId] = useState(docs[0].id);
  const [openFaq, setOpenFaq] = useState(faqs[0].q);
  const [copied, setCopied] = useState('');

  const filteredDocs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return docs.filter((doc) => {
      const matchesCategory = category === 'All' || doc.category === category;
      const searchable = `${doc.title} ${doc.summary} ${doc.category} ${doc.sections
        .map((section) => `${section.heading} ${(section.body || []).join(' ')} ${(section.list || []).join(' ')}`)
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
            <span>Send details, clone name, and screenshots when possible.</span>
            <a href="mailto:support@alter.ai?subject=Alter%20AI%20support%20request">
              <Mail size={14} />
              Contact support
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
          <aside className="help-doc-list">
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

            {activeDoc.sections.map((section) => (
              <section key={section.heading}>
                <h3>{section.heading}</h3>
                {section.body?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
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
      align-items: start;
    }

    .help-doc-list {
      display: grid;
      gap: 8px;
      padding: 10px;
      overflow: visible;
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
      padding: 24px;
    }

    .help-article header {
      display: flex;
      align-items: center;
      gap: 14px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      padding-bottom: 20px;
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

      .help-doc-list {
        overflow: visible;
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
