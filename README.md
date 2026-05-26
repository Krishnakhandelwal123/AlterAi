<div align="center">

<img src="https://img.shields.io/badge/Status-Building%20🚧-cyan?style=for-the-badge&color=00d4ff" />
<img src="https://img.shields.io/badge/Version-0.1.0-blueviolet?style=for-the-badge" />

<br />
<br />

# ALTER AI

### *Clone yourself. Let AI do the talking.*

**AI Personality-as-a-Service — currently in active development 🚧**

<br />

[🌐 Live Demo](#) · [📖 Docs](#) · [🐛 Report Bug](https://github.com/Krishnakhandelwal123/AlterAi/issues) · [💡 Request Feature](https://github.com/Krishnakhandelwal123/AlterAi/issues)

</div>

---

# ⚠️ Build Status

> **Alter AI is actively being built.** Core features are functional but the platform is not yet publicly launched.

| Feature | Status |
|---|---|
| Auth (Google, GitHub, Twitter) | ✅ Done |
| Dashboard UI | ✅ Done |
| Create Clone Flow | ✅ Done |
| Training Data Pipeline (RAG) | ✅ Done |
| Public Chat Page `/chat/:slug` | ✅ Done |
| Razorpay Billing (Pro / Creator) | ✅ Done |
| Share & Embed (iframe + floating widget) | ✅ Done |
| Analytics Dashboard | 🔄 In Progress |
| Voice Cloning (ElevenLabs) | ✅ Done |
| In-app Notifications & Settings | ✅ Done |
| Social import (GitHub, Reddit, Notion, Medium, X) | ✅ Done |
| LinkedIn / Instagram import | ⬜ API limits (use Upload/Paste) |
| Mobile Responsive Polish | ⬜ Upcoming |
| Production Deploy | ⬜ Upcoming |

---

# 🧠 What is Alter AI?

**Alter AI** is an AI Personality-as-a-Service (PAaaS) platform that lets creators, educators, and influencers **clone themselves into an AI** — trained on their real content, responding in their voice and tone, available 24/7.

You train it once.  
It answers forever.

### The problem it solves

Everyone who has ever built an audience faces the same problem — people want access to you, but there is only one of you.

DMs go unanswered.  
Questions pile up.  
Knowledge disappears.

Alter AI solves this by letting your AI clone handle conversations while you focus on building.

---

# ✨ How It Works

### Step 1 → Create your clone
Set a name, personality, tone, and identity for your AI.

### Step 2 → Train it on your content
Upload PDFs, DOCX files, text, Q&A pairs, links, and other training sources.

### Step 3 → Share your public chat link

```bash
your-app.com/chat/yourname
```

Anyone can talk to your AI clone 24/7.

---

# 🔧 Tech Stack

## Frontend (`client/`)

```txt
React 18 + Vite         → UI framework
React Router            → Routing
Tailwind CSS            → Styling
Supabase JS             → Auth session (OAuth)
Playfair Display        → Display typography
DM Mono + Inter         → UI & body typography
Locomotive Scroll       → Smooth scrolling (marketing pages)
```

## Backend (`server/`)

```txt
Node.js + Express 5     → REST API + SSE chat streaming
Supabase                → PostgreSQL + Auth + Storage
pgvector                → Vector similarity search (768-dim)
@xenova/transformers    → Local embeddings (all-mpnet-base-v2)
Google Gemini API       → Chat replies (streaming)
Razorpay                → Subscriptions (INR)
Multer                  → File upload handling
pdf-parse + mammoth     → PDF/DOCX extraction
Nodemailer              → Transactional email
```

---

# 🧠 AI Pipeline (RAG)

```txt
User uploads training data
(text, PDFs, DOCX, Q&A, links, etc.)

↓
Backend chunks content (~400 tokens)

↓
Local Xenova all-mpnet-base-v2
creates 768-dim vector embeddings (no OpenAI cost)

↓
Vectors stored in Supabase pgvector (personality_embeddings)

↓
Visitor asks a question on /chat/:slug

↓
Question embedding generated (same local model)

↓
Top relevant chunks retrieved
via match_personality_embeddings RPC + keyword rerank

↓
Context injected into Gemini system prompt

↓
Response streamed back via Server-Sent Events (SSE)
```

**Models in use**

| Layer | Technology |
|-------|------------|
| Embeddings | `Xenova/all-mpnet-base-v2` (local, 768-dim) |
| Chat | Google **Gemini** (`GEMINI_MODEL`, default `gemini-2.5-flash`) |
| Payments | **Razorpay** (Pro ₹1,599/mo · Creator ₹3,999/mo) |

---

# 🔐 Auth & Security

```txt
Supabase Auth          → OAuth (Google, GitHub, Twitter)
Supabase JWT           → Bearer token on protected API routes
Service role (server)  → Backend DB access with app-level ownership checks
AES-256 encryption     → OAuth token encryption (social connections)
Row Level Security     → Supabase RLS on billing/email tables
Helmet.js              → Secure HTTP headers
Rate limiting          → express-rate-limit
Input validation       → express-validator (training routes)
```

> **Note:** `JWT_SECRET` in `.env.example` is legacy documentation only. API auth uses Supabase session access tokens validated via `supabaseAdmin.auth.getUser()`.

---

# 🏗️ Architecture

```txt
┌─────────────────────────────────────────────────────┐
│                 FRONTEND (React / Vite)             │
│   Home → Auth → Dashboard → Public Chat Page        │
└──────────────────────┬──────────────────────────────┘
                       │ REST + SSE (Bearer JWT)
┌──────────────────────▼──────────────────────────────┐
│                 BACKEND (Express)                   │
│   /api/auth  /api/clone  /api/training  /api/chat   │
│   /api/billing  /api/share  /api/analytics           │
│   /api/notifications                                 │
│                                                     │
│ Middleware: authenticate → checkPlan → validate    │
└──────┬───────────────────────────────┬─────────────┘
       │                               │
┌──────▼──────┐                ┌───────▼────────┐
│  Supabase   │                │ Google Gemini  │
│ PostgreSQL  │                │  (chat stream) │
│ pgvector    │◄── RAG ───────►│                │
│ Storage     │   local embed  └────────────────┘
│ Auth        │   (Xenova CPU)
└─────────────┘
       │
┌──────▼──────┐
│  Razorpay   │  orders · verify · webhooks
└─────────────┘
```

---

# 📁 Project Structure

```bash
AlterAI/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # Home, Auth, ChatPage, dashboard pages
│   │   ├── components/     # chat, clones, training, share, dashboard
│   │   ├── hooks/          # useClones, useChat, useBillingSubscription…
│   │   ├── api/            # cloneApi, billingApi, shareApi, userApi
│   │   ├── context/        # AuthContext
│   │   └── lib/            # supabase.js
│   └── package.json
│
├── server/                 # Express API
│   ├── index.js
│   ├── routes/             # auth, clone, training, chat, billing, share…
│   ├── middleware/         # authenticate, checkPlan, rateLimiter
│   ├── utils/              # ai.js, embedder.js, trainer.js, retrieval.js
│   ├── config/             # planLimits.js, billingPlans.js
│   ├── sql/                # Supabase migration snippets
│   └── package.json
│
├── .env.example            # Shared env template (root)
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) project (Auth + Postgres + Storage)
- [Google AI Studio](https://aistudio.google.com/) API key (Gemini)
- [Razorpay](https://razorpay.com) keys (for billing — optional in local dev)

---

## 1. Clone the repository

```bash
git clone https://github.com/Krishnakhandelwal123/AlterAi.git
cd AlterAi
```

---

## 2. Install dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd server
npm install
```

---

## 3. Configure environment variables

Copy the template at the repo root:

```bash
cp .env.example .env
```

Fill in `.env` (both apps read from the root via Vite `envDir: '..'` and server `dotenv`):

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Express
PORT=3001
CLIENT_URL=http://localhost:5173

# Google Gemini (chat)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Razorpay (billing)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Email (optional — welcome + subscription reminders)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
EMAIL_FROM_NAME=AlterAI
```

See `.env.example` for the full list including email reminder tuning.

---

## 4. Set up Supabase

1. Enable the **vector** extension in the SQL editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. Create core tables (`personalities`, `training_data`, `personality_embeddings`, `users`, etc.) — use your project schema or the SQL snippets under `server/sql/`.

3. Run incremental migrations as needed:

| File | Purpose |
|------|---------|
| `server/sql/match_personality_embeddings.sql` | Vector search RPC |
| `server/sql/billing_razorpay.sql` | Subscriptions & payments |
| `server/sql/share_events.sql` | Share analytics |
| `server/sql/email_events.sql` | Email reminder dedup |
| `server/sql/user_profile_settings.sql` | Profile columns & notification prefs |
| `server/sql/user_notifications.sql` | In-app notification inbox |
| `server/sql/social_connections.sql` | Training Data social platform tokens (GitHub, Reddit, etc.) |

---

## 5. Start the application

### Backend (terminal 1)

```bash
cd server
npm run dev
# or: node index.js
```

### Frontend (terminal 2)

```bash
cd client
npm run dev
```

Open:

```bash
http://localhost:5173
```

API health (after start):

```bash
http://localhost:3001/health
```

---

# 💳 Plans (Razorpay)

| Plan | Price | Highlights |
|------|-------|------------|
| **Free** | ₹0 | 1 clone · 100 knowledge chunks · basic analytics |
| **Pro** | ₹1,599/mo | 5 clones · 500 chunks · priority training |
| **Creator** | ₹3,999/mo | 50 clones · 2,000 chunks · voice cloning (when enabled) |

Limits are enforced in `server/config/planLimits.js` and surfaced in the dashboard **Billing** page.

---

# 🗺️ Roadmap

## Completed
- ✅ OAuth authentication (Google, GitHub, Twitter)
- ✅ Clone creation & management
- ✅ RAG training pipeline (local embeddings + pgvector)
- ✅ Public AI chat page with SSE streaming (Gemini)
- ✅ Razorpay subscriptions (Pro / Creator)

## In Progress
- 🔄 Analytics dashboard polish
- 🔄 Share & embed system

## Upcoming
- ⬜ Production deployment
- ✅ Voice cloning (ElevenLabs + Creator plan)
- ⬜ Twitter/X import
- ⬜ Deeper Notion & GitHub connectors
- ⬜ Mobile app

---

# 🤝 Contributing

Alter AI is currently being developed as a solo project.

Feedback, ideas, and contributions will be welcomed after the MVP launch.

If you find the project interesting, consider starring the repository ⭐

---

# 👨‍💻 Built By

## Krishna Khandelwal

B.Tech CSE — Manipal University Jaipur

- GitHub → https://github.com/Krishnakhandelwal123
- LinkedIn → https://www.linkedin.com/in/krishna-khandelwal-470b30280/

---

<div align="center">

### ⭐ Building in public

Follow the journey of Alter AI 🚀

</div>
