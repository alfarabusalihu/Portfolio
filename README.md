# 🚀 AI-Driven Autonomous Portfolio

An intelligent, self-updating portfolio system that synchronizes with Google Drive (CV) and GitHub (repositories) using AI analysis. The portfolio automatically extracts skills, discovers projects, and updates the frontend via MongoDB.

## 🧠 How It Works

This is a fully autonomous system with three core layers:

**1. Data Collection**
- CV from Google Drive → Parsed by Groq AI (Llama 3.3-70B)
- GitHub repositories tagged with `portfolio` → Analyzed for metadata
- Extracted into structured categories (skills, projects)

**2. Storage**
- Results saved to MongoDB (single source of truth)
- Fallback JSON bundled with frontend (offline resilience)
- Metadata tracks sync timestamps

**3. Display**
- Frontend fetches from MongoDB via API
- React Context provides live data to components
- Real-time updates without page reload

**Trigger**: Monthly automatic sync (GitHub Actions) + Manual sync button

---

## 🎯 Features

### Core Functionality
- ✅ Automatic CV analysis and skill extraction
- ✅ GitHub project discovery with AI enhancement
- ✅ Live sync button for on-demand updates
- ✅ High-Five counter with daily persistence
- ✅ CV viewer modal
- ✅ Responsive UI (mobile-first)
- ✅ Dark theme with glassmorphism
- ✅ Real-time data refresh

### Technical Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB 7.2.0
- **AI/LLM**: Groq API (Llama 3.3-70B)
- **UI**: Material-UI 7.3.7 + Emotion
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel

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
   GROQ_API_KEY=your_groq_key
   GOOGLE_API_KEY=your_google_key
   DRIVE_FOLDER_ID=your_drive_folder_id
   TOKEN_GIT=your_github_token

   # Public (browser-accessible)
   NEXT_PUBLIC_GOOGLE_API_KEY=same_as_above
   NEXT_PUBLIC_DRIVE_FOLDER_ID=same_as_above

   # Database
   MONGO_URI=your_mongodb_connection_string
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
| `GROQ_API_KEY` | Secret | AI LLM for CV/project analysis | Server only |
| `GOOGLE_API_KEY` | Key | Google Drive read access | Both |
| `DRIVE_FOLDER_ID` | ID | Drive folder containing CV | Both |
| `TOKEN_GIT` | Token | GitHub API for repo discovery | Server only |
| `MONGO_URI` | URL | MongoDB connection string | Server only |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Key | Public Drive access (client) | Client only |
| `NEXT_PUBLIC_DRIVE_FOLDER_ID` | ID | Public Drive folder (client) | Client only |

---

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/projects` | GET | Fetch portfolio projects from MongoDB |
| `/api/skills` | GET | Fetch skill stacks & tools |
| `/api/metadata` | GET | Fetch sync metadata & timestamps |
| `/api/highfive` | GET | Fetch high-five counter |
| `/api/highfive` | POST | Increment high-five counter |
| `/api/cv` | GET | Stream CV PDF from MongoDB |
| `/api/contact` | POST | Submit contact form |
| `/api/dispatch-sync` | POST | Trigger GitHub Actions sync |

---

## 🚀 Available Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
npm run predeploy    # Full validation (lint + type-check + build)
```

---

## 🔧 Key Components

- **LockerGateway** — Animated splash screen
- **Header** — Navigation with View CV, Live Sync, High-Five buttons
- **SkillsSection** — Hexagonal skill cards
- **ProjectsSection** — Project showcase cards
- **ContactSection** — Contact form
- **PortfolioDataContext** — Global data + refresh hook

---

## 📝 Quality Assurance

✅ TypeScript: 0 errors (strict mode)  
✅ ESLint: 0 errors  
✅ Build: Compiles successfully  
✅ Accessibility: WCAG compliant  
✅ Performance: Optimized for Vercel  

---

## 💡 How to Customize

**Update Skills Categories**: Edit `scripts/lib/ai-service.js`  
**Modify Theme**: Edit `src/theme/theme.ts` and `src/theme/constants.ts`  
**Add Components**: Create in `src/components/`  
**Change API Behavior**: Edit `src/app/api/*/route.ts`  

---

## 🤝 Contributing

Feel free to fork, modify, and use as your own portfolio!

---

**Built with TypeScript, AI, and Vercel. Deployed with confidence.**  
**Engineered by Alfar Abusalihu** ✨
