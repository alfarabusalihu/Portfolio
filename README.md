# 🚀 AI-Driven Autonomous Portfolio

An intelligent, self-updating portfolio that syncs with Google Drive (CV) and GitHub (repositories) using AI. Features smart voice narration generation with change detection, automatic skill extraction, and real-time updates via Supabase.

## ✨ Key Features

- 🤖 **AI-Powered Analysis** - Gemini AI extracts skills from CV and analyzes projects
- 🎙️ **Smart Voice Narrations** - Generates audio only for new/updated projects (80-90% cost savings)
- 🔄 **Auto-Sync** - Monthly GitHub Actions workflow + manual live sync button
- 🎨 **3D Character Guide** - Tess (React Three Fiber) with interactive audio
- 📊 **Real-Time Data** - Supabase backend with instant frontend updates
- 🎯 **Change Detection** - MD5 hash tracking prevents unnecessary regeneration
- 📱 **Responsive Design** - Glassmorphism UI with smooth animations

## 🛠️ Tech Stack

**Frontend:** Next.js 16 (App Router), TypeScript 5, Material-UI 7, Framer Motion, React Three Fiber  
**Backend:** Supabase (PostgreSQL + Storage)  
**AI:** Google Gemini (analysis, scripts), ElevenLabs (text-to-speech)  
**Deploy:** Vercel (frontend) + GitHub Actions (automation)

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

# Test database connection
node scripts/test-db-connection.js
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
1. Fetch CV from Google Drive → Parse & extract skills with Gemini
2. Fetch GitHub repos tagged with `portfolio`
3. **Smart Voice Generation:**
   - Calculate README hash for each project
   - Compare with stored hash in database
   - **NEW project** → Generate script + audio
   - **UPDATED project** (hash mismatch) → Regenerate
   - **UNCHANGED project** → Skip (saves API costs)
4. Upload MP3 files to Supabase Storage
5. Update database with all data
6. Send email report

**Result:** Only processes what changed, saving 80-90% on API costs

### Live Sync (Manual Button)
- Steps 1-2 only (no audio generation)
- Quick CV and project updates

## 🎙️ Voice Narration System

- Click "Meet Tess" to activate 3D character guide
- Speaker icons appear on projects with voice narrations
- Click to hear Tess explain each project
- Automatic generation for new projects
- Smart regeneration when README changes
- Stored in Supabase Storage (CDN-cached MP3s)

## � Project Structure

```
src/
├── app/
│   ├── api/           # API routes (projects, skills, voice-narrations, etc.)
│   └── page.tsx       # Main page
├── components/
│   ├── Tess/          # 3D character with audio integration
│   └── ...            # UI components
└── context/
    ├── PortfolioDataContext.tsx  # Global data state
    └── AudioContext.tsx          # Voice player state

scripts/
├── update-cv-data.js           # Main sync orchestrator
├── validate-setup.js           # Environment validation
├── test-voice-narrations.js    # Test voice system
└── lib/
    ├── ai-service.js           # Gemini AI integration
    ├── github-service.js       # GitHub API + change detection
    └── supabase-service.js     # Database operations
```

## 🔑 Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY_CV` | CV & skills analysis |
| `GEMINI_API_KEY_AUDIO` | Voice script generation |
| `ELEVENLABS_API_KEY` | Text-to-speech audio |
| `GOOGLE_API_KEY` | Google Drive access |
| `DRIVE_FOLDER_ID` | Folder containing CV |
| `GITHUB_USERNAME` | GitHub username |
| `TOKEN_GIT` | GitHub personal access token |
| `SUPABASE_URL` | Database URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Database admin key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Database public key |

See `.env.example` for complete list.

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/projects` | GET | Fetch portfolio projects |
| `/api/skills` | GET | Fetch technical skills |
| `/api/voice-narrations` | GET | Fetch voice metadata & URLs |
| `/api/metadata` | GET | Sync timestamps |
| `/api/highfive` | GET/POST | High-five counter |
| `/api/cv` | GET | Stream CV PDF |
| `/api/dispatch-sync` | POST | Trigger manual sync |

## 💡 Customization

- **Voice Prompts:** `scripts/lib/ai-service.js` → `generateNarrationScript()`
- **Skills Analysis:** `scripts/lib/ai-service.js` → `analyzeSkills()`
- **Theme:** `src/theme/theme.ts` and `src/theme/constants.ts`
- **Sync Schedule:** `.github/workflows/update-skills.yml` → cron expression

## 🧪 Testing

```bash
# Test database connection
node scripts/test-db-connection.js

# Test voice narrations setup
node scripts/test-voice-narrations.js

# Check Gemini models
npm run check:models
```

## 📚 Documentation

- `QUICK_START.md` - 5-minute voice narration setup
- `VOICE_SYSTEM_SUMMARY.md` - Complete voice system docs
- `scripts/README.md` - Scripts documentation
- `docs/VOICE_NARRATIONS_MIGRATION.md` - Technical details

## 🎯 Cost Optimization

**Traditional approach:** Regenerate all projects = 8 API calls/month  
**Smart approach:** Only new/updated projects = ~0-2 API calls/month  
**Savings:** 75-100% reduction in Gemini & ElevenLabs costs

## 🤝 Contributing

Fork and adapt! Key features:
- Smart change detection via README hashing
- Cost-optimized AI voice generation
- Real-time Supabase integration
- 3D character with React Three Fiber
