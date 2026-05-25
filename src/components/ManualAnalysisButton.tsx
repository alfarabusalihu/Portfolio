'use client';

import React, { useState, useCallback } from 'react';
import { Box, Typography, Tooltip, Button, Snackbar, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleStop, CheckCircle2, Zap, AlertCircle, BrainCircuit } from 'lucide-react';
import { THEME_COLORS } from '../theme/constants';
import { usePortfolioData } from '../context/PortfolioDataContext';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? '';
const DRIVE_FOLDER_ID = process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID ?? '';
const GH_TOKEN = process.env.NEXT_PUBLIC_GITHUB_ACTIONS_TOKEN ?? '';
const GH_OWNER = 'alfarabusalihu';
const GH_REPO = 'alfarabusalihu.github.io';
const WORKFLOW_FILE = 'update-skills.yml';
const LIGHT_BLUE = '#67E8F9';
const POLL_INTERVAL = 8_000;   // ms between polls
const MAX_POLLS = 30;       // 30 × 8s = 4 min max
const PRE_POLL_WAIT = 4_000;   // wait after dispatch before first poll

type Status = 'idle' | 'checking' | 'running' | 'uptodate' | 'done' | 'error';

interface GhRun { id: number; status: string; conclusion: string | null; }

// ---------------------------------------------------------------------------
// SVG border sweep — same idea as the hexagon in LockerGateway
// ---------------------------------------------------------------------------
function SVGBorderSweep({ active }: { active: boolean }) {
    return (
        <AnimatePresence>
            {active && (
                <motion.svg
                    key="sweep"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: 'absolute',
                        inset: -2,
                        width: 'calc(100% + 4px)',
                        height: 'calc(100% + 4px)',
                        pointerEvents: 'none',
                        zIndex: 10,
                        overflow: 'visible',
                    }}
                    viewBox="0 0 59 59"
                >
                    <motion.rect
                        x={1.5} y={1.5}
                        width={56} height={56}
                        rx={13.5} ry={13.5}
                        fill="none"
                        stroke={LIGHT_BLUE}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        // pathLength normalises the whole perimeter to 1
                        pathLength={1}
                        // a short 18% dash travels around the full path
                        strokeDasharray="0.18 0.82"
                        animate={{ strokeDashoffset: [0, -1] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ filter: `drop-shadow(0 0 4px ${LIGHT_BLUE})` }}
                    />
                </motion.svg>
            )}
        </AnimatePresence>
    );
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------
function sleep(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
}

function authHeaders(): HeadersInit {
    return GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {};
}

async function fetchDriveCvFileId(): Promise<string | null> {
    if (!GOOGLE_API_KEY || !DRIVE_FOLDER_ID) return null;
    try {
        const query = encodeURIComponent(`'${DRIVE_FOLDER_ID}' in parents and mimeType='application/pdf' and trashed=false`);
        const url =
            `https://www.googleapis.com/drive/v3/files` +
            `?q=${query}&fields=files(id)&orderBy=createdTime+desc&key=${GOOGLE_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        return (data?.files?.[0]?.id as string) ?? null;
    } catch { return null; }
}

async function fetchLatestPortfolioRepoUpdate(): Promise<string | null> {
    try {
        const url = `https://api.github.com/users/${GH_OWNER}/repos?per_page=100&sort=updated`;
        const res = await fetch(url, { headers: authHeaders() });
        if (!res.ok) return null;
        const repos: { topics?: string[]; updated_at: string }[] = await res.json();
        const portfolioRepos = repos.filter((r) => r.topics?.includes('portfolio'));
        if (!portfolioRepos.length) return null;
        return portfolioRepos.reduce(
            (latest, r) => (r.updated_at > latest ? r.updated_at : latest),
            portfolioRepos[0].updated_at,
        );
    } catch { return null; }
}

async function getLatestRun(): Promise<GhRun | null> {
    try {
        const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=1`;
        const res = await fetch(url, { headers: authHeaders() });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.workflow_runs?.[0] ?? null;
    } catch { return null; }
}

async function dispatchWorkflow(): Promise<boolean> {
    if (!GH_TOKEN) return false;
    try {
        const res = await fetch(
            `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
            {
                method: 'POST',
                headers: {
                    ...authHeaders(),
                    Accept: 'application/vnd.github+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ref: 'main' }),
            },
        );
        return res.status === 204;
    } catch { return false; }
}

/** Poll every POLL_INTERVAL ms until run is completed or timeout. */
async function pollUntilComplete(): Promise<'success' | 'failure' | 'timeout'> {
    for (let i = 0; i < MAX_POLLS; i++) {
        await sleep(POLL_INTERVAL);
        const run = await getLatestRun();
        if (run?.status === 'completed') {
            return run.conclusion === 'success' ? 'success' : 'failure';
        }
    }
    return 'timeout';
}

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
        });
    } catch { return iso; }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function ManualAnalysisButtonInner({ btnSize = '46px' }: { btnSize?: string }) {
    const { refreshData, metadata } = usePortfolioData();
    const [status, setStatus] = useState<Status>('idle');
    const [notification, setNotification] = useState<{ severity: 'success' | 'info' | 'error'; message: string; detail?: string } | null>(null);
    const [open, setOpen] = useState(false);

    const isActive = status === 'checking' || status === 'running';

    const showNotification = (
        severity: 'success' | 'info' | 'error',
        message: string,
        detail?: string,
    ) => {
        setNotification({ severity, message, detail });
        setOpen(true);
    };

    const handleClick = useCallback(async () => {
        if (status !== 'idle') return;

        // ── STEP 1: Check for changes ─────────────────────────────────────
        setStatus('checking');

        // Always fetch metadata fresh from the API (not GitHub raw) to avoid stale build-time values
        let storedCvFileId = metadata.cvFileId;
        let storedLastSync = metadata.lastSync;
        try {
            const metaRes = await fetch('/api/metadata', { cache: 'no-store' });
            if (metaRes.ok) {
                const liveMeta = await metaRes.json();
                storedCvFileId = liveMeta.cvFileId ?? storedCvFileId;
                storedLastSync = liveMeta.lastSync ?? storedLastSync;
            }
        } catch { /* fall back to context values */ }

        const [driveCvFileId, latestRepoUpdate] = await Promise.all([
            fetchDriveCvFileId(),
            fetchLatestPortfolioRepoUpdate(),
        ]);

        const cvChanged = driveCvFileId ? driveCvFileId !== storedCvFileId : false;
        // treat empty lastSync as "never synced" so it always triggers on first run
        const repoChanged = latestRepoUpdate
            ? (!storedLastSync || latestRepoUpdate > storedLastSync)
            : false;
        const hasChanges = cvChanged || repoChanged;

        // ── STEP 2: No changes → inform and stop ─────────────────────────
        if (!hasChanges) {
            setStatus('uptodate');
            showNotification(
                'success',
                '✅ Portfolio is fully up to date with my latest CV.',
                storedLastSync ? `Last synced on ${formatDate(storedLastSync)}.` : 'Already up to date.',
            );
            setTimeout(() => setStatus('idle'), 5000);
            return;
        }

        // ── STEP 3: Changes detected — trigger or attach to active run ───
        setStatus('running');

        // Check if a run is already in progress
        const existingRun = await getLatestRun();
        const alreadyRunning =
            existingRun &&
            (existingRun.status === 'in_progress' || existingRun.status === 'queued');

        if (!alreadyRunning) {
            if (!GH_TOKEN) {
                showNotification(
                    'error',
                    '⚠️ GitHub token not configured.',
                    'NEXT_PUBLIC_GITHUB_ACTIONS_TOKEN is missing. The monthly auto-sync will still run on the 1st.',
                );
                setTimeout(() => setStatus('idle'), 6000);
                return;
            }
            const dispatched = await dispatchWorkflow();
            if (!dispatched) {
                showNotification(
                    'error',
                    '⚠️ Failed to trigger workflow.',
                    'GitHub API rejected the dispatch. Check that the token has workflow permissions.',
                );
                setTimeout(() => setStatus('idle'), 6000);
                return;
            }
            // Give GitHub a moment to register the new run
            await sleep(PRE_POLL_WAIT);
        }

        // ── STEP 4: Poll until complete ───────────────────────────────────
        const result = await pollUntilComplete();

        if (result === 'success') {
            await refreshData();
            setStatus('done');
            showNotification(
                'success',
                '✅ Analysis complete!',
                'Skills and projects have been updated live! 🎉',
            );
        } else if (result === 'failure') {
            setStatus('error');
            showNotification('error', '⚠️ Sync workflow failed.', 'Check GitHub Actions for details.');
        } else {
            // timeout
            setStatus('error');
            showNotification(
                'error',
                '⏱ Analysis is taking longer than expected.',
                "It's still running on GitHub. Check back in a few minutes.",
            );
        }

        setTimeout(() => setStatus('idle'), 6000);
    }, [status, metadata, refreshData]);

    // Icon & colour per state — CircleStop for idle, BrainCircuit when active
    const stateMap: Record<Status, { icon: React.ReactNode; color: string }> = {
        idle:     { icon: <CircleStop size={20} />,    color: THEME_COLORS.silver },
        checking: { icon: <BrainCircuit size={20} />,  color: LIGHT_BLUE },
        running:  { icon: <BrainCircuit size={20} />,  color: LIGHT_BLUE },
        uptodate: { icon: <CheckCircle2 size={20} />,  color: '#22C55E' },
        done:     { icon: <Zap size={20} />,           color: LIGHT_BLUE },
        error:    { icon: <AlertCircle size={20} />,   color: '#EF4444' },
    };

    const { icon, color } = stateMap[status];

    const tooltipTitle =
        status === 'checking' ? 'Checking for changes…' :
            status === 'running' ? 'Analyzing CV & projects… (~1–2 min)' :
                status === 'uptodate' ? 'All up to date!' :
                    status === 'done' ? 'Analysis complete!' :
                        status === 'error' ? 'Something went wrong' :
                            'Verify Live Sync — check if portfolio is synced with latest CV';

    return (
        <>
            <Tooltip
                title={
                    <Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            {tooltipTitle}
                        </Typography>
                        {status === 'running' && (
                            <Typography sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
                                Please keep this tab open
                            </Typography>
                        )}
                    </Box>
                }
                placement="left"
                arrow
            >
                <span style={{ position: 'relative', display: 'inline-flex' }}>
                    {/* SVG sweep overlay — same style as the hexagon loading */}
                    <SVGBorderSweep active={isActive} />

                    <Button
                        onClick={handleClick}
                        disabled={isActive}
                        aria-label="Verify portfolio live sync with CV"
                        sx={{
                            minWidth: 0,
                            width: btnSize,
                            height: btnSize,
                            borderRadius: '10px',
                            bgcolor: isActive
                                ? `${LIGHT_BLUE}12`
                                : status !== 'idle'
                                    ? `${color}12`
                                    : 'rgba(192, 192, 192, 0.08)',
                            color,
                            border: isActive
                                ? 'none'
                                : `2px solid ${status !== 'idle' ? `${color}50` : 'rgba(192, 192, 192, 0.2)'}`,
                            backdropFilter: 'blur(10px)',
                            boxShadow: isActive
                                ? `0 0 18px ${LIGHT_BLUE}25`
                                : status !== 'idle'
                                    ? `0 0 14px ${color}25`
                                    : 'none',
                            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            zIndex: 1,
                            '&:hover': {
                                bgcolor: isActive ? `${LIGHT_BLUE}12` : 'rgba(0, 191, 255, 0.1)',
                                borderColor: isActive ? 'transparent' : '#00BFFF',
                                boxShadow: isActive ? `0 0 18px ${LIGHT_BLUE}25` : '0 0 10px rgba(0,191,255,0.25)',
                                transform: 'none',
                            },
                            '&:disabled': {
                                color,
                                bgcolor: `${LIGHT_BLUE}12`,
                                border: 'none',
                            },
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={status}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={{ duration: 0.2 }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {icon}
                            </motion.div>
                        </AnimatePresence>
                    </Button>
                </span>
            </Tooltip>

            {/* Top-right notification */}
            <Snackbar
                open={open}
                autoHideDuration={7000}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ zIndex: 9999, mt: { xs: 8, md: 2 } }}
            >
                <Alert
                    severity={notification?.severity}
                    onClose={() => setOpen(false)}
                    sx={{
                        maxWidth: 380,
                        bgcolor: 'rgba(0, 8, 20, 0.96)',
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${notification?.severity === 'success' ? '#22C55E40' : notification?.severity === 'error' ? '#EF444440' : `${LIGHT_BLUE}40`}`,
                        color: 'white',
                        '& .MuiAlert-icon': { color: 'inherit' },
                        borderRadius: '14px',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                    }}
                >
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 0.3 }}>
                        {notification?.message}
                    </Typography>
                    {notification?.detail && (
                        <Typography sx={{ fontSize: '0.75rem', opacity: 0.75, lineHeight: 1.5 }}>
                            {notification.detail}
                        </Typography>
                    )}
                </Alert>
            </Snackbar>
        </>
    );
}

const ManualAnalysisButton = React.memo(ManualAnalysisButtonInner);
export default ManualAnalysisButton;
