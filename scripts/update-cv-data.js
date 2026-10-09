require('dotenv').config();

const AIService = require('./lib/ai-service');
const SupabaseService = require('./lib/supabase-service');
const DriveService = require('./lib/drive-service');
const GithubService = require('./lib/github-service');
const WorkflowLogger = require('./lib/workflow-logger');

// Configuration
const GENERATE_AUDIO = process.env.GENERATE_AUDIO === 'true';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL;

// Validate required env vars
const requiredEnvVars = [
  'GOOGLE_API_KEY',      // For Google Drive
  'GEMINI_API_KEY_CV',   // For CV analysis
  'GEMINI_API_KEY_AUDIO', // For audio generation
  'DRIVE_FOLDER_ID',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error(`❌ Missing environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// For audio generation, ElevenLabs is required
if (GENERATE_AUDIO && !process.env.ELEVENLABS_API_KEY) {
  console.error('❌ ELEVENLABS_API_KEY required for audio generation');
  process.exit(1);
}

const aiService = new AIService(
  process.env.GEMINI_API_KEY_CV, 
  process.env.GEMINI_API_KEY_AUDIO
);
const driveService = new DriveService(process.env.GOOGLE_API_KEY, process.env.DRIVE_FOLDER_ID);
let githubService; // Will be initialized when we have the username
const logger = new WorkflowLogger(GENERATE_AUDIO ? 'monthly-sync' : 'live-sync');

// ─────────────────────────────────────────────────────────────────────────
// MAIN WORKFLOW
// ─────────────────────────────────────────────────────────────────────────

async function runWorkflow() {
  try {
    console.log('\n🚀 Starting portfolio sync workflow...\n');
    console.log(`📅 Sync Type: ${GENERATE_AUDIO ? 'MONTHLY SYNC (with audio)' : 'LIVE SYNC (no audio)'}\n`);

    // ─ Step 0: Check if CV has been updated ──────────────────────────────
    console.log('🔍 Checking for CV updates...');
    let stepStartTime = Date.now();
    
    // Get stored CV metadata
    const storedMetadata = await SupabaseService.getMetadata();
    const storedCvFileId = storedMetadata.cvFileId;
    const storedCvModifiedTime = storedMetadata.cvModifiedTime;
    
    // Get current CV metadata from Drive
    const files = await driveService.listFiles();
    const currentCvFile = files.find(f => 
      f.name.toLowerCase().includes('cv') || 
      f.name.toLowerCase().includes('resume') ||
      f.name.toLowerCase().endsWith('.pdf') ||
      f.name.toLowerCase().endsWith('.txt')
    );
    
    if (!currentCvFile) {
      throw new Error('No CV file found in Google Drive');
    }
    
    // Check if CV has been updated
    const cvHasChanged = !storedCvFileId || 
                         currentCvFile.id !== storedCvFileId || 
                         currentCvFile.modifiedTime > storedCvModifiedTime;
    
    if (!cvHasChanged) {
      console.log('✅ CV is up to date. No sync needed.');
      console.log(`   Last modified: ${storedCvModifiedTime}`);
      console.log(`   Current modified: ${currentCvFile.modifiedTime}`);
      logger.logStep('CV update check', { 
        status: 'up-to-date', 
        lastModified: storedCvModifiedTime 
      }, Date.now() - stepStartTime);
      
      const { filepath } = logger.saveReport();
      console.log(`\n✅ Workflow completed - No changes detected`);
      console.log(`📝 Report: ${filepath}\n`);
      process.exit(0);
    }
    
    console.log('✅ CV has been updated. Starting sync...');
    console.log(`   Previous: ${storedCvModifiedTime || 'Never synced'}`);
    console.log(`   Current:  ${currentCvFile.modifiedTime}`);
    logger.logStep('CV update check', { 
      status: 'updated', 
      oldModifiedTime: storedCvModifiedTime,
      newModifiedTime: currentCvFile.modifiedTime
    }, Date.now() - stepStartTime);

    // ─ Step 1: Fetch CV from Google Drive ─────────────────────────────────
    stepStartTime = Date.now();
    let cvText;
    let cvBuffer;
    let cvMetadata;
    try {
      const result = await driveService.getCVFromDrive();
      cvText = result.text;
      cvBuffer = result.buffer;
      cvMetadata = {
        fileId: result.fileId,
        modifiedTime: result.modifiedTime,
        fileName: result.fileName
      };
      const duration = Date.now() - stepStartTime;
      logger.logStep('Fetch CV from Google Drive', { 
        length: cvText.length,
        fileName: cvMetadata.fileName,
        modifiedTime: cvMetadata.modifiedTime
      }, duration);
    } catch (error) {
      logger.logError('Fetch CV from Google Drive', error, { folderId: process.env.DRIVE_FOLDER_ID });
      throw error;
    }

    // ─ Step 1b: Upload CV to Supabase storage ────────────────────────────────
    stepStartTime = Date.now();
    try {
      if (cvBuffer) {
        await SupabaseService.uploadFile('portfolio', 'cv.pdf', cvBuffer);
        const duration = Date.now() - stepStartTime;
        logger.logStep('Upload CV to Supabase storage', { size: cvBuffer.length }, duration);
      }
    } catch (error) {
      logger.logWarning('Upload CV to Supabase storage', error.message);
      // Don't throw - CV analysis can still proceed
    }

    // ─ Step 2: Analyze skills with Gemini ──────────────────────────────
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
      logger.logWarning('Analyze skills', error.message);
      // Skip skills update if Gemini fails (e.g., invalid API key or quota exceeded)
      console.log('⚠️  Skipping skills update due to Gemini error');
      skillsData = null; // Mark as failed
    }

    // ─ Step 3: Save skills to Supabase (only if analysis succeeded) ──────
    if (skillsData) {
      stepStartTime = Date.now();
      try {
        await SupabaseService.saveSkills(skillsData);
        const duration = Date.now() - stepStartTime;
        logger.logStep('Save skills to Supabase', { stacks: skillsData.stacks?.length || 0, tools: skillsData.tools?.length || 0 }, duration);
      } catch (error) {
        logger.logError('Save skills to Supabase', error);
        throw error;
      }
    } else {
      logger.logStep('Save skills to Supabase', { status: 'Skipped (analysis failed)' });
    }

    // ─ Step 5: Fetch GitHub repos ────────────────────────────────────────
    stepStartTime = Date.now();
    let repos;
    let portfolioRepos;
    try {
      const username = process.env.GH_USERNAME || 'alfarabusalihu'; // fallback username
      githubService = new GithubService(username, process.env.TOKEN_GIT);
      repos = await githubService.fetchRepos();
      
      // Filter to only repos tagged with "portfolio"
      portfolioRepos = repos.filter(repo => 
        repo.topics && repo.topics.includes('portfolio')
      );
      
      // Log what we're sending to Gemini
      console.log('\n📊 GitHub Repos Overview:');
      console.log(`   Total repos: ${repos.length}`);
      console.log(`   Portfolio repos: ${portfolioRepos.length}`);
      if (portfolioRepos.length > 0) {
        console.log('   Portfolio repos to analyze:');
        portfolioRepos.forEach(repo => {
          console.log(`     - ${repo.name}: ${repo.description?.substring(0, 50) || '(no desc)'}...`);
        });
      }
      
      const duration = Date.now() - stepStartTime;
      logger.logStep(`Fetch GitHub repos (${username})`, { 
        total: repos.length,
        portfolio: portfolioRepos.length 
      }, duration);
    } catch (error) {
      logger.logError('Fetch GitHub repos', error);
      throw error;
    }

    // ─ Step 6: Save portfolio projects (GitHub data only) ─────────────
    stepStartTime = Date.now();
    let projectsToSave = [];
    
    if (portfolioRepos.length > 0) {
      let fallbackProjects = [];
      try {
        fallbackProjects = require('../src/data/projects.json');
      } catch (e) {
        // ignore if path fails
      }

      // Use GitHub data directly, merged with static fallback metadata for live links
      projectsToSave = portfolioRepos.map(repo => {
        const fallback = fallbackProjects.find(fp => 
          (fp.title && fp.title.toLowerCase().replace(/[^a-z0-9]/g, '') === repo.name.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
          (fp.link && fp.link.toLowerCase() === repo.html_url.toLowerCase())
        );
        return {
          title: repo.name,
          link: repo.html_url,
          websiteLink: repo.homepage || fallback?.websiteLink || null,
          description: repo.description || fallback?.description || `GitHub repository: ${repo.name}`,
          tags: repo.topics?.filter(t => t !== 'portfolio') || [],
        };
      });

      const duration = Date.now() - stepStartTime;
      logger.logStep('Prepare portfolio projects', {
        total: portfolioRepos.length,
      }, duration);
    } else {
      console.log('⚠️  No portfolio-tagged repos found');
    }

    // ─ Step 7: Save projects to Supabase ─────────────────────────────────
    stepStartTime = Date.now();
    try {
      await SupabaseService.replaceAllProjects(projectsToSave);
      const duration = Date.now() - stepStartTime;
      logger.logStep('Save projects to Supabase', { count: projectsToSave.length }, duration);
    } catch (error) {
      logger.logError('Save projects to Supabase', error);
      throw error;
    }

    // ─ Step 8: Generate audio narrations (ONLY for monthly sync) ──────────
    if (GENERATE_AUDIO) {
      stepStartTime = Date.now();
      try {
        // First, let's see what's actually in the database
        console.log('\n🔍 Debugging: Checking voice_narrations table...');
        const allNarrations = await SupabaseService.getVoiceNarrations();
        console.log(`   Total rows in table: ${allNarrations.length}`);
        if (allNarrations.length > 0) {
          console.log('   Existing project titles in database:');
          allNarrations.forEach((n, i) => {
            console.log(`     ${i + 1}. "${n.project_title}" (length: ${n.project_title.length})`);
          });
        }
        
        console.log('\n   Projects to check:');
        projectsToSave.forEach((p, i) => {
          console.log(`     ${i + 1}. "${p.title}" (length: ${p.title.length})`);
        });
        console.log('');
        
        // Identify projects that need voice generation
        const projectsNeedingAudio = [];
        const skippedProjects = [];
        const updatedProjects = [];
        
        for (const project of projectsToSave) {
          // Query database to check if this project exists
          const existing = await SupabaseService.voiceNarrationExists(project.title);
          
          if (!existing) {
            // New project - needs audio
            console.log(`   → "${project.title}" marked as NEW (not in database)`);
            projectsNeedingAudio.push({ project, reason: 'new' });
          } else {
            console.log(`   → "${project.title}" found in database, checking for updates...`);
            // Project exists - check if it has been significantly updated
            const hasSignificantChange = await githubService.hasSignificantRepoChange(
              project.title,
              existing.readme_hash,
              existing.updated_at
            );
            
            if (hasSignificantChange) {
              projectsNeedingAudio.push({ project, reason: 'updated', existing });
              updatedProjects.push(project.title);
            } else {
              skippedProjects.push(project.title);
            }
          }
        }

        if (projectsNeedingAudio.length === 0) {
          const duration = Date.now() - stepStartTime;
          console.log(`✅ All projects have up-to-date voice narrations (${skippedProjects.length} checked)`);
          logger.logStep('Generate voice narrations', { 
            status: 'No new/updated projects',
            existing: skippedProjects.length
          }, duration);
        } else {
          console.log(`\n🎙️  Voice Narration Summary:`);
          console.log(`   New projects: ${projectsNeedingAudio.filter(p => p.reason === 'new').length}`);
          console.log(`   Updated projects: ${updatedProjects.length}`);
          console.log(`   Skipped (unchanged): ${skippedProjects.length}\n`);
          
          if (updatedProjects.length > 0) {
            console.log(`   Projects being updated: ${updatedProjects.join(', ')}\n`);
          }
          
          for (const { project, reason, existing } of projectsNeedingAudio) {
            try {
              console.log(`   ${reason === 'new' ? '🆕' : '🔄'} ${project.title}...`);
              
              // Generate script with Google Gemini (using AUDIO key)
              const script = await aiService.generateNarrationScript(project);

              // Convert script to audio with ElevenLabs (direct API call)
              const audioBuffer = await generateAudioWithElevenLabs(script);

              if (!audioBuffer) {
                throw new Error('No audio data returned');
              }

              // Upload MP3 to Supabase Storage
              const audioPath = `${project.title.toLowerCase().replace(/\s+/g, '-')}.mp3`;
              await SupabaseService.uploadFile('voice-narration', audioPath, audioBuffer);

              // Get public URL and save metadata with README hash
              const audioUrl = SupabaseService.getPublicUrl('voice-narration', audioPath);
              
              // Get README hash - try exact match first, then case-insensitive
              let readmeHash = null;
              const repoData = portfolioRepos.find(r => r.name === project.title) || 
                               portfolioRepos.find(r => r.name.toLowerCase() === project.title.toLowerCase());
              
              if (repoData) {
                readmeHash = await githubService.getReadmeHash(repoData.name);
              } else {
                // Try using the project title directly as repo name
                readmeHash = await githubService.getReadmeHash(project.title);
              }
              
              await SupabaseService.saveVoiceNarration({
                project_title: project.title,
                script,
                audio_url: audioUrl,
                readme_hash: readmeHash,
                generated_at: new Date().toISOString(),
              });

              logger.logStep(`${reason === 'new' ? 'Generate' : 'Update'} audio: ${project.title}`, { 
                scriptLength: script.length, 
                audioSize: audioBuffer.length,
                reason 
              });
            } catch (error) {
              logger.logWarning(`Generate audio: ${project.title}`, error.message);
            }
          }

          const duration = Date.now() - stepStartTime;
          logger.logStep('Generate voice narrations', { 
            new: projectsNeedingAudio.filter(p => p.reason === 'new').length,
            updated: updatedProjects.length,
            skipped: skippedProjects.length
          }, duration);
        }
      } catch (error) {
        logger.logError('Generate voice narrations', error);
        // Don't throw - audio generation is optional
      }
    } else {
      logger.logStep('Generate voice narrations', { status: 'Skipped (live sync)' });
    }

    // ─ Step 9: Update metadata with CV info ──────────────────────────────
    stepStartTime = Date.now();
    try {
      // Only update fields that exist in the schema
      const metadataUpdate = {
        lastSync: new Date().toISOString(),
      };
      
      // Add CV metadata only if CV was processed
      if (cvMetadata) {
        metadataUpdate.cvFileId = cvMetadata.fileId;
        metadataUpdate.cvModifiedTime = cvMetadata.modifiedTime;
      }
      
      await SupabaseService.updateMetadata(metadataUpdate);
      const duration = Date.now() - stepStartTime;
      logger.logStep('Update metadata', { 
        lastSync: metadataUpdate.lastSync,
        ...(cvMetadata ? { cvFileId: cvMetadata.fileId, cvModifiedTime: cvMetadata.modifiedTime } : {})
      }, duration);
    } catch (error) {
      logger.logWarning('Update metadata', error.message);
      // Don't throw - metadata update is not critical
    }

    // ─ Step 10: Save and send report ──────────────────────────────────────
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
// HELPER: Generate audio with ElevenLabs (direct API call)
// ─────────────────────────────────────────────────────────────────────────

async function generateAudioWithElevenLabs(script) {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  // Use free tier voice - check if user provided custom voice ID, otherwise use free premade voice
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Adam (free premade voice)

  const payload = JSON.stringify({
    text: script,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  });

  const https = require('https');
  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = Buffer.alloc(0);

      res.on('data', chunk => {
        data = Buffer.concat([data, chunk]);
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          // Log the actual error response
          const errorBody = data.toString();
          console.error(`[ElevenLabs] Status ${res.statusCode}: ${errorBody}`);
          reject(new Error(`ElevenLabs error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', error => {
      reject(new Error(`ElevenLabs request failed: ${error.message}`));
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
