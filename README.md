# 🚀 AI-Driven Autonomous Portfolio with Voice Narrations

An intelligent, self-updating portfolio system that synchronizes with Google Drive (CV) and GitHub (repositories) using AI analysis. Automatically extracts skills, discovers projects, generates AI voice narrations for new projects, and updates the frontend via Supabase.

## 🧠 How It Works

This is a fully autonomous system with four core layers:

**1. Data Collection**
- CV from Google Drive → Parsed by Cloudflare Llama 3.2 LLM
- GitHub repositories tagged with `portfolio` → Analyzed with Cloudflare Mistral 7b
- Extracted into structured categories (skills, projects)

**2. Voice Generation** (Monthly only, for new projects)
- Project metadata → Google Gemini API generates narration script
- Script → ElevenLabs TTS API (via Cloudflare Worker) generates MP3 audio
- Rachel voice (natural-sounding, female)
- Deduplication prevents re-generation of existing projects

**3. Storage**
- Results saved to Supabase PostgreSQL (single source of truth)
- Voice narrations (scripts + audio URLs) cached in Supabase
- MP3 files stored in Supabase Storage (public, CDN-cached)
- Metadata tracks sync timestamps

**4. Display**
- Frontend fetches from Supabase via API
- React Context provides live data to components
- Voice player embedded in project cards
- Real-time updates without page reload

**Triggers**:
- **Monthly**: October 1st 00:00 UTC (GitHub Actions) - includes voice generation
- **Manual**: Live Sync button - CV + project analysis only (no audio)

---

## 🎯 Features

### Core Functionality
- ✅ Automatic CV analysis and skill extraction (Cloudflare LLM)
- ✅ GitHub project discovery with AI enhancement (Cloudflare LLM)
- ✅ Voice narration generation for new projects (Google Gemini + ElevenLabs)
- ✅ MP3 audio streaming from Supabase Storage
- ✅ Live sync button for on-demand updates (no audio)
- ✅ Monthly auto-sync with voice generation (Oct 1st)
- ✅ High-Five counter with daily persistence
- ✅ CV viewer modal
- ✅ Responsive UI (mobile-first)
- ✅ Dark theme with glassmorphism
- ✅ Real-time data refresh
- ✅ Comprehensive error logging with email notifications

### Technical Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase PostgreSQL + Storage
- **AI/LLM**: 
  - Cloudflare Workers AI (Llama 3.2, Mistral 7b)
  - Google Gemini API (voice scripts)
  - ElevenLabs API (TTS audio)
- **UI**: Material-UI 7.3.7 + Emotion
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel + Cloudflare Workers
- **CI/CD**: GitHub Actions

---

## 🛠️ Setup & Deployment

### Local Development

1. **Clone and install**:
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   npm install
   ```

2. **Set environment variables** (copy `.env.example` to `.env`):
   ```bash
   # AI & APIs
   GOOGLE_API_KEY=your_google_key
   CLOUDFLARE_WORKER_URL=https://your-worker.workers.dev/
   DRIVE_FOLDER_ID=your_drive_folder_id
   TOKEN_GIT=your_github_token
   ELEVENLABS_API_KEY=your_elevenlabs_key
   CONTACT_EMAIL=your_email@example.com

   # Public (browser-accessible)
   NEXT_PUBLIC_GOOGLE_API_KEY=same_as_above
   NEXT_PUBLIC_DRIVE_FOLDER_ID=same_as_above

   # Database (Supabase)
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Run development server**:
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

4. **Manual sync** (test AI analysis):
   ```bash
   node scripts/update-cv-data.js
   ```

### Production Deployment (Vercel)

1. **Connect GitHub repository** to Vercel
2. **Add environment variables** in Vercel project settings
3. **Deploy**:
   ```bash
   git push origin main
   # Vercel auto-deploys on push
   ```

4. **GitHub Actions setup** (for monthly auto-sync):
   - Add same env vars to GitHub Secrets
   - Workflow runs on 1st of month at 00:00 UTC
   - Manual trigger available via `gh workflow run update-skills.yml`

### Environment Variables Guide

| Variable | Type | Purpose | Scope |
|----------|------|---------|-------|
| `GOOGLE_API_KEY` | Key | Google Drive read + Gemini API | Both |
| `DRIVE_FOLDER_ID` | ID | Drive folder containing CV | Both |
| `TOKEN_GIT` | Token | GitHub API for repo discovery | Server only |
| `CLOUDFLARE_WORKER_URL` | URL | Worker endpoint for LLM calls | Server only |
| `ELEVENLABS_API_KEY` | Key | ElevenLabs TTS API (voice generation) | Server + Cloudflare |
| `CONTACT_EMAIL` | Email | Receives workflow notifications | Server only |
| `SUPABASE_URL` | URL | Supabase PostgreSQL URL | Server only |
| `SUPABASE_ANON_KEY` | Key | Supabase public key for queries | Client/Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Key | Supabase admin key (CI/CD only) | Server only |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Key | Public Drive access (client) | Client only |
| `NEXT_PUBLIC_DRIVE_FOLDER_ID` | ID | Public Drive folder (client) | Client only |

---

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/projects` | GET | Fetch portfolio projects from Supabase |
| `/api/skills` | GET | Fetch skill stacks & tools |
| `/api/metadata` | GET | Fetch sync metadata & timestamps |
| `/api/workflow-logs` | GET | Query workflow execution history |
| `/api/highfive` | GET | Fetch high-five counter |
| `/api/highfive` | POST | Increment high-five counter |
| `/api/cv` | GET | Stream CV PDF |
| `/api/contact` | POST | Submit contact form |
| `/api/dispatch-sync` | POST | Trigger GitHub Actions sync |

---

---

## 🔄 Workflow Architecture

### Monthly Sync (Oct 1st 00:00 UTC via GitHub Actions)
1. Fetch CV from Google Drive
2. Parse CV with Cloudflare Llama 3.2
3. Analyze skills with Cloudflare Llama 3.2
4. Fetch GitHub repos
5. Analyze projects with Cloudflare Mistral 7b
6. For **NEW** projects only (deduplication):
   - Generate narration script with Google Gemini
   - Convert script to MP3 with ElevenLabs
   - Upload MP3 to Supabase Storage
   - Save metadata to Supabase
7. Send email report (success/failure)
8. **Duration:** 40-120 seconds
9. **Cost:** $0 (all services in free tier)

### Live Sync (Manual button)
1-5 (same as above)
- Skip step 6 (no audio generation)
- **Duration:** 25-60 seconds
- **Cost:** $0

### Deduplication
- Checks `voice_narrations` table before generating
- Same project never gets voice regenerated
- Manual deletion from DB forces regeneration

### Error Handling
- Comprehensive logging via `workflow-logger.js`
- Email notifications to `CONTACT_EMAIL`
- JSON reports saved to `logs/` for debugging
- Query via `/api/workflow-logs?action=last`

---

---

---

## � Available Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
npm run predeploy    # Full validation (lint + type-check + build)
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── projects/        # GET projects from Supabase
│   │   ├── skills/          # GET skills from Supabase
│   │   ├── workflow-logs/    # GET workflow history
│   │   ├── highfive/        # GET/POST high-five counter
│   │   ├── cv/              # Stream CV PDF
│   │   ├── contact/         # POST contact form
│   │   └── dispatch-sync/   # POST trigger manual sync
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── Header.tsx           # Nav with View CV, Live Sync, High-Five
│   ├── SkillsSection.tsx    # Hexagonal skill cards
│   ├── ProjectsSection.tsx  # Project showcase cards
│   ├── ContactSection.tsx   # Contact form
│   ├── HighFiveButton.tsx   # Daily counter button
│   └── Tess/                # 3D character (React Three Fiber)
├── context/
│   ├── PortfolioDataContext.tsx  # Global data + refresh hook
│   └── AudioContext.tsx          # Voice player state
├── hooks/
│   └── useAudioAnalyzer.ts       # Audio visualization hook
└── theme/
    ├── theme.ts             # MUI theme configuration
    └── constants.ts         # Theme colors & values

scripts/
├── update-cv-data.js        # Main sync orchestrator
├── lib/
│   ├── ai-service.js        # AI operations (Gemini + Cloudflare)
│   ├── supabase-service.js  # Database operations
│   ├── workflow-logger.js   # Logging & email notifications
│   ├── drive-service.js     # Google Drive API
│   └── github-service.js    # GitHub API
└── (other helper scripts - optional)

public/
└── (static assets)

logs/
└── workflow-*.json          # Timestamped sync reports

.github/workflows/
└── update-skills.yml        # Monthly auto-sync scheduler
```

---

- **LockerGateway** — Animated splash screen
- **Header** — Navigation with View CV, Live Sync, High-Five buttons
- **SkillsSection** — Hexagonal skill cards
- **ProjectsSection** — Project showcase cards
- **ContactSection** — Contact form
- **PortfolioDataContext** — Global data + refresh hook

---

## 📝 Quality Assurance

✅ TypeScript: 0 errors (strict mode)  
✅ ESLint: 0 errors (after fixes)  
✅ Build: Compiles successfully (15.7s)
✅ Accessibility: ~90% WCAG compliant
✅ Performance: Optimized for Vercel  
✅ E-E.A.T. Signals: Strong (expertise, authority, trust)

See `LINT_AND_ACCESSIBILITY_REPORT.md` for detailed audit.  

---

## 💡 How to Customize

**Voice Script Prompt**: Edit `scripts/lib/ai-service.js` → `generateNarrationScript()` method  
**Update Skills Categories**: Edit `scripts/lib/ai-service.js` → skill categorization logic  
**Modify Theme**: Edit `src/theme/theme.ts` and `src/theme/constants.ts`  
**Add Components**: Create in `src/components/`  
**Change API Behavior**: Edit `src/app/api/*/route.ts`  
**Adjust Sync Schedule**: Edit `.github/workflows/update-skills.yml` → `cron` expression  

---

## 🤝 Contributing

Feel free to fork, modify, and use as your own portfolio!

---

**Built with TypeScript, AI, and Vercel. Deployed with confidence.**  
**Engineered by Alfar Abusalihu** ✨
