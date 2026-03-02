# 🚀 AI-Driven Autonomous Portfolio

An intelligent, self-updating portfolio system that synchronizes with a Google Drive CV and GitHub profile. It uses AI to analyze professional growth and automatically update the frontend.

## 🧠 How the Automation Works

This portfolio functions as an autonomous agent. Instead of manual updates, it follows a "Source of Truth" pattern:

1. **Detection**: Every month (via GitHub Actions) or on-demand (via the "Verify Live Sync" button), a Node.js sync engine triggers.
2. **Analysis**:
   - **CV Parsing**: It connects to Google Drive, downloads your latest CV (PDF), and uses **Groq AI (Llama 3.3-70B Versatile)** to extract new skills, tools, and technical experience.
   - **Project Discovery**: It scans your GitHub for repositories with the `portfolio` topic, analyzes their descriptions/READMEs via AI (**Llama 3.3-70B**), and generates showcase cards.
3. **Commit & Deploy**: If changes are found, the system commits them back to the repository. This triggers a fresh build and deployment automatically.
4. **Live Sync (Context API)**: Even before a full rebuild finishes, the frontend's `PortfolioDataContext` can fetch the updated JSON files directly from GitHub's raw storage, allowing visitors to see the latest data instantly.

**Engineered with diligence by Alfar Abusalihu.**

---

## 🛠️ Setup & Deployment

### 1. Environment Variables (`.env`)
Copy `.env.example` to `.env`. You will need:

| Variable | Description | Where to get it |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | AI LLM access | [Groq Console](https://console.groq.com/keys) |
| `GOOGLE_API_KEY` | Drive access (Read) | [Google Cloud Console](https://console.cloud.google.com/) |
| `DRIVE_FOLDER_ID` | ID of the folder containing your CV | From your CV's parent folder URL in Drive |
| `GITHUB_TOKEN` | Repository write access | [GitHub Personal Access Token](https://github.com/settings/tokens) |
| `NEXT_PUBLIC_GITHUB_ACTIONS_TOKEN` | Button trigger access | Same as GITHUB_TOKEN (prefixed for frontend) |

### 2. GitHub Secrets (For Automation)
For the monthly auto-sync to work, add these keys to your **GitHub Repository Settings > Secrets and variables > Actions**:
- `GROQ_API_KEY`
- `GOOGLE_API_KEY`
- `DRIVE_FOLDER_ID`
- `GITHUB_TOKEN`

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run a manual AI sync cycle
node scripts/update-cv-data.js

# Build for production
npm run build
```

---

## ⚙️ Key Technical Features

- **Next.js 15+ App Router**: High-performance static site generation.
- **Engineer Mode**: A specialized technical overlay for recruiters.
- **Reactive Updates**: Custom React Context and GitHub Raw Fetching for live data syncing.
- **ADA & SEO**: 100% accessible (ARIA) and optimized for search engine trust (JSON-LD).

**Designed and developed by Alfar Abusalihu.**
