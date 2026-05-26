export const products = [
  {
    id: 'alter-free',
    name: 'Alter Free',
    subName: 'Start with one AI clone.',
    price: 'Free',
    description: 'One public clone · RAG training · Shareable chat link',
    folderPath: '/AlterAiImages',
    imagePrefix: 'ezgif-frame-',
    imageExt: '.jpg',
    frameCount: 200,
    themeColor: '#00D4FF',
    gradient: 'linear-gradient(135deg, #000000 0%, #001A33 100%)',
    accentGradient: 'linear-gradient(135deg, #00D4FF 0%, #0066FF 100%)',
    features: ['1 AI clone', 'RAG memory', 'Public chat page'],
    stats: [
      { label: 'Setup', val: '~10 min' },
      { label: 'Online', val: '24/7' },
      { label: 'Chunks', val: '100' }
    ],
    section1: { title: 'Alter AI.', subtitle: 'Clone yourself. Start free.' },
    section2: {
      title: 'Trained on your content.',
      subtitle: 'Upload documents, paste writing, add Q&A — your clone answers from real knowledge, not generic fluff.'
    },
    section3: {
      title: 'Sounds like you.',
      subtitle: 'Set tone, topics, and guardrails so every reply matches how you actually communicate.'
    },
    section4: { title: 'Share in one link.', subtitle: '' },
    detailsSection: {
      title: 'Your knowledge, always on.',
      description:
        'Upload writing, documents, or Q&A pairs. Alter chunks and embeds your content locally, stores vectors in Supabase, and uses Google Gemini to reply in your voice. Publish a `/chat/yourname` link — visitors get answers while you focus on building.',
      imageAlt: 'Alter AI clone preview'
    },
    freshnessSection: {
      title: 'Gets sharper over time',
      description:
        'Add training sources whenever your offer or content changes. Each update refreshes what your clone can cite — no retraining wizard required.'
    },
    buyNowSection: {
      price: 'Free',
      unit: '1 clone · community support',
      processingParams: ['Local embeddings', 'pgvector search', 'Gemini chat'],
      deliveryPromise: 'Create a clone, add training data, and publish when answers look right.',
      returnPolicy: 'Upgrade anytime to Pro or Creator for more clones, chunks, and traffic.'
    }
  },
  {
    id: 'alter-pro',
    name: 'Alter Pro',
    subName: 'For creators going public.',
    price: '₹1,599/mo',
    description: '5 clones · 500 chunks · Razorpay billing',
    folderPath: '/AlterAiImages',
    imagePrefix: 'ezgif-frame-',
    imageExt: '.jpg',
    frameCount: 200,
    themeColor: '#00D4FF',
    gradient: 'linear-gradient(135deg, #000000 0%, #001A33 100%)',
    accentGradient: 'linear-gradient(135deg, #00D4FF 0%, #0066FF 100%)',
    features: ['5 AI clones', 'Advanced uploads', 'Priority training'],
    stats: [
      { label: 'Clones', val: '5' },
      { label: 'Msgs/mo', val: '7.5K' },
      { label: 'Chunks', val: '500' }
    ],
    section1: { title: 'Alter Pro.', subtitle: 'Scale your reach.' },
    section2: {
      title: 'More knowledge per clone.',
      subtitle: 'Larger files, more Q&A pairs, and higher monthly message limits for active audiences.'
    },
    section3: {
      title: 'Built for sharing.',
      subtitle: 'Analytics, embed options, and multiple public clones for different brands or topics.'
    },
    section4: { title: 'Pay with Razorpay.', subtitle: '' },
    detailsSection: {
      title: 'Grow beyond one clone',
      description:
        'Pro unlocks five personalities, richer training limits, and priority processing. Checkout runs through Razorpay — activate instantly after payment verification in the dashboard.',
      imageAlt: 'Alter Pro plan'
    },
    freshnessSection: {
      title: 'Room to experiment',
      description:
        'Run separate clones for coaching, courses, or side projects. Each clone keeps its own training data and public slug.'
    },
    buyNowSection: {
      price: '₹1,599',
      unit: '/month · billed via Razorpay',
      processingParams: ['5 clones', 'PDF & DOCX', 'Priority training'],
      deliveryPromise: 'Upgrade from Billing & Plans — Pro activates after successful payment.',
      returnPolicy: 'Manage or change plans from your dashboard billing page.'
    }
  },
  {
    id: 'alter-creator',
    name: 'Alter Creator',
    subName: 'Maximum reach and depth.',
    price: '₹3,999/mo',
    description: '50 clones · 2,000 chunks · voice (coming soon)',
    folderPath: '/AlterAiImages',
    imagePrefix: 'ezgif-frame-',
    imageExt: '.jpg',
    frameCount: 200,
    themeColor: '#7C3AED',
    gradient: 'linear-gradient(135deg, #000000 0%, #1A0B2E 100%)',
    accentGradient: 'linear-gradient(135deg, #A855F7 0%, #6D28D9 100%)',
    features: ['50 AI clones', 'Social sources', 'Voice clone (soon)'],
    stats: [
      { label: 'Clones', val: '50' },
      { label: 'Msgs/mo', val: '20K' },
      { label: 'Chunks', val: '2K' }
    ],
    section1: { title: 'Alter Creator.', subtitle: 'Built for scale.' },
    section2: {
      title: 'Heavy training limits.',
      subtitle: 'Large document libraries, more links, and the highest visitor message caps.'
    },
    section3: {
      title: 'Every channel.',
      subtitle: 'Connect supported social sources where enabled and keep multiple live clones in rotation.'
    },
    section4: { title: 'For serious operators.', subtitle: '' },
    detailsSection: {
      title: 'Operate at creator scale',
      description:
        'Creator is for teams and power users who need dozens of clones, deep knowledge bases, and the highest traffic allowances. Voice cloning will layer on top when that integration ships.',
      imageAlt: 'Alter Creator plan'
    },
    freshnessSection: {
      title: 'Enterprise-grade headroom',
      description:
        'Twenty thousand creator messages per month, advanced analytics, and priority support — without swapping stacks or vendors.'
    },
    buyNowSection: {
      price: '₹3,999',
      unit: '/month · Razorpay',
      processingParams: ['50 clones', 'Social import', 'Voice (upcoming)'],
      deliveryPromise: 'Subscribe from Billing & Plans — Creator unlocks immediately after verification.',
      returnPolicy: 'Downgrade or cancel according to your Razorpay subscription settings.'
    }
  }
];
