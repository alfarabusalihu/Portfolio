# 🚀 AI-Driven Autonomous Portfolio

An intelligent, self-updating portfolio that syncs with Google Drive (CV) and GitHub (repositories) using AI. Features smart voice narration generation with change detection, dynamic skill icon resolution, and real-time updates via Supabase.

## ✨ Key Features

- 🤖 **AI-Powered Analysis** - Gemini AI extracts skills from CV and analyzes repositories.
- 🎙️ **Smart Voice Narrations** - Generates audio narrations only for new/updated projects with change detection (80–90% cost savings).
- 🔄 **Auto-Sync & Live Dispatch** - Monthly GitHub Actions workflow (`update-skills.yml`) + instant manual live sync button in header.
- 🎨 **3D Character Guide (Tess)** - Interactive React Three Fiber model with voice narrations.
- 📱 **Seamless Responsive Design** - Pure CSS display breakpoints (`xs`, `sm`, `md`, `lg`) with sticky mobile/tablet top panel, smooth Framer Motion transitions, and glassmorphism styling.
- ⚡ **Decoupled Skills Architecture** - `/api/skills` serves pure database records while frontend interface map (`src/interfaces/skillIcons.ts`) handles dynamic Lucide icon resolution.
- 🎯 **Change Detection** - MD5 hash tracking prevents redundant audio regeneration.

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript 5, Material-UI 7, Framer Motion, React Three Fiber, Lucide Icons  
- **Backend:** Supabase (PostgreSQL + Storage)  
- **AI & Speech:** Google Gemini (CV/Repo Analysis), ElevenLabs (Text-to-Speech)  
- **Automation & Deploy:** Vercel (Hosting) + GitHub Actions (Monthly & On-Demand Sync)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (copy .env.example to .env)
# Required: GEMINI_API_KEY_CV, GEMINI_API_KEY_AUDIO, ELEVENLABS_API_KEY
# SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_API_KEY, etc.

# Validate setup
npm run validate

# Run development server
npm run dev

# Check TypeScript build
npx tsc --noEmit
```

## 📋 Available Commands

```bash
npm run dev              # Development server
npm run build            # Production build
npm run validate         # Check environment setup
npm run sync:live        # Quick sync (no audio)
npm run sync:monthly     # Full sync with smart audio generation
```

## 🔄 How It Works

### Monthly Auto-Sync (GitHub Actions)
1. Fetch CV from Google Drive → Parse & extract skills with Gemini AI.
2. Fetch GitHub repos tagged with `portfolio`.
3. **Smart Voice Generation:**
   - Calculate README hash for each project.
   - Compare with stored hash in database.
   - **NEW project** → Generate script + audio narration.
   - **UPDATED project** (hash mismatch) → Regenerate audio.
   - **UNCHANGED project** → Skip (saves API quota).
4. Upload MP3 files to Supabase Storage.
5. Sync data to Supabase database.

### Live Sync (Header Button)
- Calls `/api/dispatch-sync` via GitHub REST API to trigger `update-skills.yml` workflow on demand.

## 🎙️ Tess 3D Guide & Responsive Layout

- **Header Control:** "Meet Tess" button strictly displays when scrolled to the Projects section.
- **Desktop (`≥ 1200px` / `lg`):** Tess stays pinned in a sleek right side panel (`380px` / `420px`).
- **Mobile & Tablet (`< 1200px`):** Tess stays pinned at top (`position: 'sticky'`, `top: 0`) while project cards scroll underneath smoothly.
- **Audio Integration:** Speaker icons on project cards trigger CDN-cached voice narration MP3s.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                 # API routes (projects, skills, voice-narrations, workflow-logs, dispatch-sync)
│   ├── page.tsx             # Main page layout (Dashboard, Projects, Contact)
│   └── layout.tsx           # Global layout & providers
├── components/
│   ├── Tess/                # 3D character (Stage, Rig, Lighting, Platform)
│   ├── SkillsSection.tsx    # Skills beehive grid with dynamic icon mapping
│   ├── ProjectsSection.tsx  # Project cards showroom with Tess guide
│   ├── ContactSection.tsx   # Contact section
│   ├── SocialLinks.tsx      # Responsive social links
│   └── Header.tsx           # Navigation header with CV & Live Sync buttons
├── interfaces/
│   └── skillIcons.ts        # Frontend icon map & type definitions for skills
└── context/
    ├── PortfolioDataContext.tsx  # Global project & skill state
    └── AudioContext.tsx          # Voice player state

.github/
└── workflows/
    └── update-skills.yml    # Monthly & on-demand sync pipeline

scripts/
├── update-cv-data.js        # Main sync orchestrator
├── validate-setup.js        # Setup validator
└── lib/                     # AI, GitHub, & Supabase services
```

## 📊 API Endpoints

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/projects` | GET | Fetch portfolio projects |
| `/api/skills` | GET | Fetch raw technical skills |
| `/api/voice-narrations` | GET | Fetch voice narration audio URLs |
| `/api/workflow-logs` | GET | Fetch GitHub Actions execution logs |
| `/api/dispatch-sync` | POST | Trigger live workflow sync via GitHub API |
| `/api/cv` | GET | Stream CV PDF |
| `/api/highfive` | GET/POST | High-five counter |

## 🤝 Contributing & License

Feel free to fork and adapt! Key architecture highlights:
- Pure CSS responsive breakpoints for 3D elements.
- Decoupled API-to-frontend icon resolution.
- Cost-optimized AI voice generation using hash change detection.
