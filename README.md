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
| Share & Embed | 🔄 In Progress |
| Analytics Dashboard | 🔄 In Progress |
| Stripe Payments | ⬜ Upcoming |
| Voice Cloning (ElevenLabs) | ⬜ Upcoming |
| Twitter/X Import | ⬜ Upcoming |
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
Upload PDFs, DOCX files, text, Q&A pairs, and other training sources.

### Step 3 → Share your public chat link

```bash
alter.ai/chat/yourname
```

Anyone can talk to your AI clone 24/7.

---

# 🔧 Tech Stack

## Frontend

```txt
React.js + Vite        → UI framework
Tailwind CSS           → Styling
Playfair Display       → Display typography
DM Mono                → UI typography
Locomotive Scroll      → Smooth scrolling
```

## Backend

```txt
Node.js + Express.js   → API server
Supabase               → PostgreSQL + Auth + Storage
pgvector               → Vector similarity search
OpenAI API             → GPT-4o + Embeddings
Multer                 → File upload handling
pdf-parse + mammoth    → PDF/DOCX extraction
```

---

# 🧠 AI Pipeline (RAG)

```txt
User uploads training data
(text, PDFs, DOCX, Q&A, etc.)

↓
Backend chunks content (~400 tokens)

↓
OpenAI text-embedding-3-small
creates vector embeddings

↓
Vectors stored in Supabase pgvector

↓
User asks a question

↓
Question embedding generated

↓
Top relevant chunks retrieved
via vector similarity search

↓
Context injected into GPT-4o prompt

↓
AI response streamed back
using Server-Sent Events (SSE)
```

---

# 🔐 Auth & Security

```txt
Supabase Auth          → OAuth (Google, GitHub, Twitter)
JWT verification       → Protected API routes
AES-256 encryption     → OAuth token encryption
Row Level Security     → Supabase RLS policies
Helmet.js              → Secure HTTP headers
Rate limiting          → express-rate-limit
Input validation       → express-validator
```

---

# 🏗️ Architecture

```txt
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                 │
│   Home → Auth → Dashboard → Chat Page              │
└──────────────────────┬──────────────────────────────┘
                       │ REST API + SSE
┌──────────────────────▼──────────────────────────────┐
│                 BACKEND (Express)                   │
│   /api/auth  /api/clone  /api/training  /api/chat  │
│                                                     │
│ Middleware: authenticate → checkPlan → validate    │
└──────┬───────────────────────────────┬─────────────┘
       │                               │
┌──────▼──────┐                ┌───────▼────────┐
│  Supabase   │                │   OpenAI API   │
│ PostgreSQL  │                │     GPT-4o     │
│ pgvector    │◄──── RAG ────► │   Embeddings   │
│ Storage     │                └────────────────┘
│ Auth        │
└─────────────┘
```

---

# 📁 Project Structure

```bash
alter-ai/
├── src/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Auth.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ChatPage.jsx
│   │   └── TrainingData.jsx
│   │
│   ├── components/
│   │   ├── chat/
│   │   ├── clones/
│   │   ├── training/
│   │   └── share/
│   │
│   ├── hooks/
│   ├── api/
│   └── lib/
│       └── supabase.js
│
├── server/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── clone.js
│   │   ├── training.js
│   │   └── chat.js
│   │
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── checkPlan.js
│   │   └── rateLimiter.js
│   │
│   └── utils/
│       ├── chunker.js
│       ├── embedder.js
│       ├── trainer.js
│       └── encrypt.js
│
├── .env.example
├── .gitignore
└── package.json
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

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
npm install
```

### Backend

```bash
cd server
npm install
```

---

## 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in your `.env` file:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Server
PORT=3001
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_char_encryption_key
```

---

## 4. Enable pgvector in Supabase

Run this in the Supabase SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 5. Start the application

### Frontend

```bash
npm run dev
```

### Backend

```bash
cd server
node index.js
```

Open:

```bash
http://localhost:5173
```

---

# 🗺️ Current Roadmap

## Completed
- ✅ Authentication system
- ✅ Clone creation flow
- ✅ RAG training pipeline
- ✅ Public AI chat page

## In Progress
- 🔄 Analytics dashboard
- 🔄 Share & embed system

## Upcoming
- ⬜ Stripe subscriptions
- ⬜ Production deployment
- ⬜ Voice cloning
- ⬜ Twitter/X import
- ⬜ Notion & GitHub integrations
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
