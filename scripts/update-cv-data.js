#!/usr/bin/env node

/**
 * Main Portfolio Sync Script
 * 
 * Monthly Workflow (Oct 1st 00:00 UTC):
 * 1. Fetch CV from Google Drive
 * 2. Parse CV with Cloudflare Llama
 * 3. Analyze skills with Cloudflare Llama
 * 4. Fetch GitHub repos
 * 5. Analyze each project with Cloudflare Mistral
 * 6. For NEW projects: Generate narration script (Gemini) → Audio (ElevenLabs via Cloudflare) → Upload to Supabase
 * 7. Email workflow report
 * 
 * Live Sync (User clicks button):
 * - Same as above but WITHOUT audio generation
 * - Uses GENERATE_AUDIO=false (default)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const AIService = require('./lib/ai-service');
const SupabaseService = require('./lib/supabase-service');
const DriveService = require('./lib/drive-service');
const GithubService = require('./lib/github-service');
const WorkflowLogger = require('./lib/workflow-logger');

// Configuration
const CLOUDFLARE_WORKER_URL = process.env.CLOUDFLARE_WORKER_URL;
const GENERATE_AUDIO = process.env.GENERATE_AUDIO === 'true';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL;

// Validate required env vars
const requiredEnvVars = [
  'CLOUDFLARE_WORKER_URL',
  'GOOGLE_API_KEY',
  'DRIVE_FOLDER_ID',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error(`❌ Missing environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Initialize services
const aiService = new AIService(CLOUDFLARE_WORKER_URL);
const driveService = new DriveService(process.env.GOOGLE_API_KEY, process.env.DRIVE_FOLDER_ID);
const githubService = new GithubService(process.env.GITHUB_PAT || process.env.TOKEN_GIT);
const logger = new WorkflowLogger(GENERATE_AUDIO ? 'monthly-sync' : 'live-sync');

// ─────────────────────────────────────────────────────────────────────────
// MAIN WORKFLOW
// ─────────────────────────────────────────────────────────────────────────

async function runWorkflow() {
  try {
    console.log('\n🚀 Starting portfolio sync workflow...\n');
    console.log(`📅 Sync Type: ${GENERATE_AUDIO ? 'MONTHLY SYNC (with audio)' : 'LIVE SYNC (no audio)'}\n`);

    // ─ Step 1: Fetch CV from Google Drive ─────────────────────────────────
    let stepStartTime = Date.now();
    let cvText;
    try {
      cvText = await driveService.getCVFromDrive(process.env.DRIVE_FOLDER_ID);
      const duration = Date.now() - stepStartTime;
      logger.logStep('Fetch CV from Google Drive', { length: cvText.length }, duration);
    } catch (error) {
      logger.logError('Fetch CV from Google Drive', error, { folderId: process.env.DRIVE_FOLDER_ID });
      throw error;
    }

    // ─ Step 2: Parse CV with Cloudflare Llama ────────────────────────────
    stepStartTime = Date.now();
    let cvJson;
    try {
      cvJson = await aiService.parseCvToJson(cvText);
      const duration = Date.now() - stepStartTime;
      logger.logStep('Parse CV to JSON', { name: cvJson.name, sections: Object.keys(cvJson) }, duration);
    } catch (error) {
      logger.logError('Parse CV to JSON', error);
      throw error;
    }

    // ─ Step 3: Analyze skills with Cloudflare Llama ──────────────────────
    stepStartTime = Date.now();
    let skillsData;
    try {
      skillsData = await aiService.analyzeSkills(cvText);
      const duration = Date.now() - stepStartTime;
      logger.logStep('Analyze and categorize skills', {
        stacks: skillsData.stacks?.length || 0,
        tools: skillsData.tools?.length || 0,
      }, duration);
    } catch (error) {
      logger.logError('Analyze skills', error);
      throw error;
    }

    // ─ Step 4: Save skills to Supabase ───────────────────────────────────
    stepStartTime = Date.now();
    try {
      await SupabaseService.saveSkills(skillsData);
      const duration = Date.now() - stepStartTime;
      logger.logStep('Save skills to Supabase', { stacks: skillsData.stacks?.length || 0, tools: skillsData.tools?.length || 0 }, duration);
    } catch (error) {
      logger.logError('Save skills to Supabase', error);
      throw error;
    }

    // ─ Step 5: Fetch GitHub repos ────────────────────────────────────────
    stepStartTime = Date.now();
    let repos;
    try {
      const username = cvJson.github?.split('/').pop() || 'unknown';
      repos = await githubService.getUserRepos(username);
      const duration = Date.now() - stepStartTime;
      logger.logStep(`Fetch GitHub repos (${username})`, { count: repos.length }, duration);
    } catch (error) {
      logger.logError('Fetch GitHub repos', error);
      throw error;
    }

    // ─ Step 6: Analyze each project with Cloudflare Mistral ──────────────
    stepStartTime = Date.now();
    const projectsWithAnalysis = [];
    const analyzedCount = { success: 0, failed: 0 };

    for (const repo of repos) {
      try {
        const analysis = await aiService.analyzeProject(repo);
        projectsWithAnalysis.push({
          name: repo.name,
          link: repo.html_url,
          description: analysis.description,
          tags: analysis.tags || [],
          languages: repo.languages || [],
          topics: repo.topics?.filter(t => t !== 'portfolio') || [],
          stars: repo.stargazers_count,
          updated_at: new Date().toISOString(),
        });
        analyzedCount.success++;
      } catch (error) {
        logger.logWarning(`Analyze project: ${repo.name}`, error.message);
        analyzedCount.failed++;
      }
    }

    const duration = Date.now() - stepStartTime;
    logger.logStep('Analyze all projects with Mistral', {
      successful: analyzedCount.success,
      failed: analyzedCount.failed,
    }, duration);

    // ─ Step 7: Save projects to Supabase ─────────────────────────────────
    stepStartTime = Date.now();
    try {
      await SupabaseService.replaceAllProjects(projectsWithAnalysis);
      const duration = Date.now() - stepStartTime;
      logger.logStep('Save projects to Supabase', { count: projectsWithAnalysis.length }, duration);
    } catch (error) {
      logger.logError('Save projects to Supabase', error);
      throw error;
    }

    // ─ Step 8: Generate audio narrations (ONLY for monthly sync) ──────────
    if (GENERATE_AUDIO) {
      stepStartTime = Date.now();
      try {
        const existingNarrations = await SupabaseService.getVoiceNarrations();
        const existingProjects = new Set(existingNarrations.map(n => n.project_title));
        const newProjects = projectsWithAnalysis.filter(p => !existingProjects.has(p.name));

        if (newProjects.length === 0) {
          const duration = Date.now() - stepStartTime;
          logger.logStep('Generate voice narrations', { status: 'No new projects' }, duration);
        } else {
          for (const project of newProjects) {
            try {
              // Generate script with Google Gemini
              const script = await aiService.generateNarrationScript(project);

              // Convert script to audio with ElevenLabs (via Cloudflare Worker)
              const audioResponse = await callCloudflareWorker('generate-audio-elevenlabs', script);

              if (!audioResponse.audioBase64) {
                throw new Error('No audio data returned');
              }

              // Upload MP3 to Supabase Storage
              const audioBuffer = Buffer.from(audioResponse.audioBase64, 'base64');
              const audioPath = `${project.name.toLowerCase().replace(/\s+/g, '-')}.mp3`;
              await SupabaseService.uploadFile('voice-narrations', audioPath, audioBuffer);

              // Get public URL and save metadata
              const audioUrl = SupabaseService.getPublicUrl('voice-narrations', audioPath);
              await SupabaseService.saveVoiceNarration({
                project_title: project.name,
                script,
                audio_url: audioUrl,
                generated_at: new Date().toISOString(),
              });

              logger.logStep(`Generate audio: ${project.name}`, { scriptLength: script.length, audioSize: audioBuffer.length });
            } catch (error) {
              logger.logWarning(`Generate audio: ${project.name}`, error.message);
            }
          }

          const duration = Date.now() - stepStartTime;
          logger.logStep('Generate voice narrations', { newProjects: newProjects.length }, duration);
        }
      } catch (error) {
        logger.logError('Generate voice narrations', error);
        // Don't throw - audio generation is optional
      }
    } else {
      logger.logStep('Generate voice narrations', { status: 'Skipped (live sync)' });
    }

    // ─ Step 9: Save and send report ──────────────────────────────────────
    const { filepath } = logger.saveReport();
    console.log(`\n✅ Workflow completed successfully!`);
    console.log(`📝 Report: ${filepath}\n`);

    // Send email notification
    if (CONTACT_EMAIL) {
      try {
        await logger.sendEmailNotification();
      } catch (error) {
        console.warn('⚠️  Failed to send email notification:', error.message);
      }
    }

  } catch (error) {
    // Fatal error - log and exit
    logger.logError('Workflow execution', error);
    const { filepath } = logger.saveReport();

    console.error(`\n❌ Workflow failed!`);
    console.error(`📝 Report: ${filepath}\n`);

    // Try to send email notification
    if (CONTACT_EMAIL) {
      try {
        await logger.sendEmailNotification();
      } catch (emailError) {
        console.error('⚠️  Failed to send error email:', emailError.message);
      }
    }

    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// HELPER: Call Cloudflare Worker
// ─────────────────────────────────────────────────────────────────────────

async function callCloudflareWorker(task, data) {
  const payload = JSON.stringify({ task, data });
  const url = new URL(CLOUDFLARE_WORKER_URL);

  return new Promise((resolve, reject) => {
    const https = require('https');
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', chunk => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            resolve(JSON.parse(responseData));
          } else {
            reject(new Error(`Worker error: ${res.statusCode} - ${responseData}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse worker response: ${error.message}`));
        }
      });
    });

    req.on('error', error => {
      reject(new Error(`Worker request failed: ${error.message}`));
    });

    req.write(payload);
    req.end();
  });
}

// ─────────────────────────────────────────────────────────────────────────
// RUN
// ─────────────────────────────────────────────────────────────────────────

runWorkflow().catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1);
});
