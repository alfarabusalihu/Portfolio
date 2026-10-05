'use client';

import React from 'react';
import { Box, Typography, Button, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import dynamic from 'next/dynamic';
import { THEME_COLORS } from '../theme/constants';
import { ChevronDown, Github, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { useAudio } from '../context/AudioContext';

const TessStage = dynamic(() => import('./Tess/TessStage').then((module) => module.TessStage), {
    ssr: false,
    loading: () => (
        <Box sx={{ color: '#FFD760', fontSize: '0.75rem', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Loading Tess
        </Box>
    ),
});

interface Project {
    title: string;
    description: string;
    image: string;
    link: string;
    websiteLink?: string;
    tags: string[];
    isAutoSync?: boolean;
    isPrivate?: boolean;
}

// Sort helper function
const sortProjects = (data: Project[]) => [...data].sort((a, b) => {
    if (a.websiteLink && !b.websiteLink) return -1;
    if (!a.websiteLink && b.websiteLink) return 1;
    return 0;
});

const ProjectCard = ({ project, compact = false, showSpeaker = false, voiceUrl = '' }: { project: Project; compact?: boolean; showSpeaker?: boolean; voiceUrl?: string }) => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const { playAudio, stopAudio, currentProject } = useAudio();
    const isPlaying = currentProject === project.title;

    const handleSpeakerClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (isPlaying) {
            // Stop playback
            stopAudio();
            return;
        }

        if (!voiceUrl) {
            console.warn(`No voice URL available for ${project.title}`);
            return;
        }

        // Start playback with voice URL from Supabase
        try {
            await playAudio(project.title, voiceUrl);
        } catch (err) {
            console.error('Failed to play audio:', err);
        }
    };

    return (
        <Box
            component="article"
            sx={{
                height: '100%',
                display: 'flex',
                width: '100%',
                minWidth: 0
            }}
        >
            <motion.div
                whileHover={{ y: -5 }}
                style={{
                    flex: 1,
                    width: '100%',
                    background: THEME_COLORS.glassBg,
                    borderRadius: isMobile || compact ? '20px' : '28px',
                    border: `1px solid ${THEME_COLORS.silver}30`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(12px)',
                    transition: 'border 0.3s ease'
                }}
            >

                <Box sx={{ p: { xs: 3, md: compact ? 2.5 : 4 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 900, color: THEME_COLORS.royalBlue, textTransform: 'uppercase', fontSize: { xs: '0.9rem', md: compact ? '0.95rem' : '1.1rem' }, mb: compact ? 1.5 : 2, lineHeight: 1.2, letterSpacing: 1 }}>
                            {project.title}
                        </Typography>

                        <Typography variant="body2" sx={{ color: THEME_COLORS.silver, opacity: 0.9, fontSize: { xs: '0.8rem', md: compact ? '0.78rem' : '0.85rem' }, lineHeight: compact ? 1.5 : 1.6, mb: compact ? 2 : 3 }}>
                            {project.description}
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: compact ? 0.75 : 1, mb: compact ? 2.5 : 4 }}>
                            {project.tags.map(tag => (
                                <Typography key={tag} sx={{
                                    fontSize: compact ? '0.55rem' : '0.6rem',
                                    px: compact ? 1.1 : 1.5,
                                    py: 0.5,
                                    bgcolor: 'rgba(65, 105, 225, 0.1)',
                                    color: 'white',
                                    borderRadius: '6px',
                                    border: `1px solid ${THEME_COLORS.royalBlue}40`,
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5
                                }}>
                                    {tag}
                                </Typography>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: compact ? 1 : 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                        {project.isPrivate ? (
                            <Tooltip title="Private repository" placement="top" arrow>
                                <span>
                                    <Button
                                        disabled
                                        startIcon={<Github size={15} />}
                                        sx={{
                                            color: 'rgba(255,255,255,0.25)',
                                            fontWeight: 900,
                                            fontSize: '0.7rem',
                                            bgcolor: 'rgba(255,255,255,0.03)',
                                            px: compact ? 1.5 : 2,
                                            height: compact ? '38px' : '42px',
                                            minWidth: compact ? '94px' : '110px',
                                            borderRadius: '10px',
                                            border: '1px dashed rgba(255,255,255,0.1)',
                                            letterSpacing: 1.5,
                                            textTransform: 'uppercase',
                                            '&.Mui-disabled': {
                                                color: 'rgba(255,255,255,0.25)',
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                            }
                                        }}
                                    >
                                        PRIVATE
                                    </Button>
                                </span>
                            </Tooltip>
                        ) : (
                            <Button
                                component={motion.a}
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`View source code for ${project.title} on GitHub`}
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                startIcon={<Github size={15} />}
                                sx={{
                                    color: 'white',
                                    fontWeight: 900,
                                    fontSize: '0.7rem',
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    px: compact ? 1.5 : 2,
                                    height: compact ? '38px' : '42px',
                                    minWidth: compact ? '94px' : '110px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    letterSpacing: 1.5,
                                    textTransform: 'uppercase',
                                }}
                            >
                                REPO
                            </Button>
                        )}
                        {project.websiteLink && (() => {
                            const isPortfolioItself = project.title === 'PORTFOLIO';
                            if (isPortfolioItself) {
                                return (
                                    <Tooltip title="You're already here! 🎉" placement="top" arrow>
                                        <span>
                                            <Button
                                                disabled
                                                startIcon={<Globe size={15} />}
                                                sx={{
                                                    color: 'rgba(255,255,255,0.3)',
                                                    fontWeight: 900,
                                                    fontSize: '0.7rem',
                                                    bgcolor: 'rgba(65,105,225,0.12)',
                                                    px: compact ? 1.5 : 2,
                                                    height: compact ? '38px' : '42px',
                                                    minWidth: compact ? '94px' : '110px',
                                                    borderRadius: '10px',
                                                    border: `1px dashed ${THEME_COLORS.royalBlue}50`,
                                                    cursor: 'not-allowed',
                                                    letterSpacing: 1.5,
                                                    textTransform: 'uppercase',
                                                    '&.Mui-disabled': {
                                                        color: 'rgba(255,255,255,0.3)',
                                                        bgcolor: 'rgba(65,105,225,0.12)',
                                                    }
                                                }}
                                            >
                                                LIVE
                                            </Button>
                                        </span>
                                    </Tooltip>
                                );
                            }
                            return (
                                <Button
                                    component={motion.a}
                                    href={project.websiteLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`View live demo of ${project.title}`}
                                    whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${THEME_COLORS.royalBlue}40` }}
                                    whileTap={{ scale: 0.95 }}
                                    startIcon={<Globe size={15} />}
                                    sx={{
                                        color: 'white',
                                        fontWeight: 900,
                                        fontSize: '0.7rem',
                                        bgcolor: THEME_COLORS.royalBlue,
                                        px: compact ? 1.5 : 2,
                                        height: compact ? '38px' : '42px',
                                        minWidth: compact ? '94px' : '110px',
                                        borderRadius: '10px',
                                        letterSpacing: 1.5,
                                        textTransform: 'uppercase',
                                        '&:hover': { bgcolor: THEME_COLORS.royalBlue, opacity: 0.9 }
                                    }}
                                >
                                    LIVE
                                </Button>
                            );
                        })()}
                        
                        {/* Speaker Button - bottom right next to LIVE/REPO buttons */}
                        {showSpeaker && (
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                {/* SVG Glow Animation when playing */}
                                <AnimatePresence>
                                    {isPlaying && (
                                        <motion.svg
                                            key="glow"
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
                                            viewBox="0 0 42 42"
                                        >
                                            <motion.rect
                                                x={1.5} y={1.5}
                                                width={39} height={39}
                                                rx={8.5} ry={8.5}
                                                fill="none"
                                                stroke="#FFD760"
                                                strokeWidth={2.5}
                                                strokeLinecap="round"
                                                pathLength={1}
                                                strokeDasharray="0.18 0.82"
                                                animate={{ strokeDashoffset: [0, -1] }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                                style={{ filter: 'drop-shadow(0 0 4px #FFD760)' }}
                                            />
                                        </motion.svg>
                                    )}
                                </AnimatePresence>

                                <Tooltip title="Hear Tess explain this project" placement="top" arrow>
                                    <IconButton
                                        aria-label={`Listen to Tess explain ${project.title}`}
                                        component={motion.button}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSpeakerClick}
                                        sx={{
                                            minWidth: 0,
                                            width: compact ? '38px' : '42px',
                                            height: compact ? '38px' : '42px',
                                            borderRadius: '10px',
                                            bgcolor: isPlaying ? 'rgba(255, 215, 96, 0.12)' : 'rgba(255, 215, 96, 0.08)',
                                            color: '#FFD760',
                                            border: isPlaying ? 'none' : '2px solid rgba(255, 215, 96, 0.5)',
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: isPlaying ? '0 0 18px rgba(255, 215, 96, 0.25)' : 'none',
                                            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            zIndex: 1,
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 215, 96, 0.16)',
                                                borderColor: isPlaying ? 'transparent' : 'rgba(255, 215, 96, 0.75)',
                                                boxShadow: isPlaying ? '0 0 18px rgba(255, 215, 96, 0.25)' : '0 0 14px rgba(255, 215, 96, 0.25)',
                                            },
                                        }}
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={isPlaying ? 'playing' : 'idle'}
                                                initial={{ opacity: 0, scale: 0.6 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.6 }}
                                                transition={{ duration: 0.2 }}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                                </svg>
                                            </motion.div>
                                        </AnimatePresence>
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        )}
                    </Box>
                </Box>
            </motion.div>
        </Box>
    );
};

const TessGuidePanel = () => {
    return (
        <Box
            component={motion.aside}
            aria-label="Tess project guide"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            sx={{
                position: 'fixed',
                right: 0,
                top: 0,
                width: { xs: '100%', md: '480px' },
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                pl: { xs: 0, md: 3 },
                pr: { xs: 0, md: 2 },
                borderLeft: { xs: 'none', md: `1px solid ${THEME_COLORS.silver}26` },
                background: { xs: 'transparent', md: 'rgba(0, 8, 20, 0.5)' },
                backdropFilter: { md: 'blur(10px)' },
                zIndex: 40,
            }}
        >
            <TessStage />
        </Box>
    );
};

interface ProjectsSectionProps {
    specialtonMode?: boolean;
    isVisible?: boolean;
}

const ProjectsSection = ({ specialtonMode = true, isVisible = false }: ProjectsSectionProps) => {
    const { projects, voiceNarrations } = usePortfolioData();
    const sortedProjects = sortProjects(projects);
    const isCompact = useMediaQuery('(max-width:900px)');
    const isMobile = useMediaQuery('(max-width:768px)');

    // Check if project has both 'portfolio' and 'voice' tags (case-insensitive)
    const hasVoiceEnabled = (project: Project) => {
        const lowercaseTags = project.tags.map(t => t.toLowerCase());
        return lowercaseTags.includes('portfolio') && lowercaseTags.includes('voice');
    };

    const scrollToBottom = () => {
        const sectionContainer = document.querySelector('[aria-label="Featured Projects Showroom"]');
        if (sectionContainer) {
            sectionContainer.scrollTo({
                top: sectionContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    return (
        <>
            {/* Main Container */}
            <Box sx={{ 
                display: 'flex',
                width: '100%',
                minHeight: '100vh',
                position: 'relative',
                overflow: isMobile ? 'visible' : 'hidden',
                flexDirection: isMobile ? 'column' : 'row',
            }}>
                {/* Tess Panel - Mobile First (Top on mobile/tablet, right on desktop) */}
                <AnimatePresence>
                    {specialtonMode && isMobile && (
                        <Box
                            component={motion.aside}
                            aria-label="Tess project guide"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: '400px' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                            sx={{
                                width: '100%',
                                height: '400px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(180deg, ${THEME_COLORS.deepNavy} 0%, rgba(0, 8, 20, 0.95) 100%)`,
                                borderBottom: `1px solid ${THEME_COLORS.silver}20`,
                                overflow: 'hidden',
                                zIndex: 30,
                                flexShrink: 0,
                            }}
                        >
                            <TessStage />
                        </Box>
                    )}
                </AnimatePresence>

                {/* Left Column - Scrollable Projects */}
                <Box
                    sx={{
                        flex: specialtonMode && !isMobile ? '0 0 auto' : 1,
                        minWidth: 0,
                        width: specialtonMode && !isMobile ? 'calc(100% - 420px)' : '100%',
                        minHeight: isMobile ? 'auto' : '100vh',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        py: { xs: 2, md: 4 },
                        pb: { xs: 15, md: 25 },
                        px: { xs: 2, md: 4 },
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}
                >
                    <Box
                        component={motion.div}
                        layout
                        transition={{ duration: 0.45, ease: 'easeInOut' }}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, minmax(0, 1fr))',
                                md: specialtonMode && !isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, 1fr)'
                            },
                            gap: { xs: 2, md: specialtonMode && !isMobile ? 2.5 : 3 },
                            maxWidth: specialtonMode && !isMobile ? '700px' : '1400px',
                            mx: 'auto',
                            justifyContent: 'center',
                        }}
                    >
                        {sortedProjects.map((p, idx) => (
                            <ProjectCard 
                                key={idx} 
                                project={p} 
                                compact={specialtonMode && !isMobile}
                                showSpeaker={specialtonMode && hasVoiceEnabled(p)}
                                voiceUrl={voiceNarrations[p.title] || ''}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Right Column - Tess Panel (Desktop only, absolute position below header) */}
                <AnimatePresence>
                    {specialtonMode && !isMobile && (
                        <Box
                            component={motion.aside}
                            aria-label="Tess project guide"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 420 }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                            sx={{
                                position: 'absolute',
                                right: 120,
                                top: 0,
                                width: 500,
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderLeft: `1px solid ${THEME_COLORS.silver}20`,
                                background: `linear-gradient(90deg, rgba(0, 8, 20, 0.3) 0%, ${THEME_COLORS.deepNavy} 40%, ${THEME_COLORS.deepNavy} 100%)`,
                                overflow: 'hidden',
                                zIndex: 30,
                                // Radiant border - visible gradient from white to dark
                                boxShadow: 'inset -40px 0 60px -20px rgba(255, 255, 255, 0.08), inset -20px 0 40px -10px rgba(150, 180, 255, 0.06)',
                            }}
                        >
                            <TessStage />
                        </Box>
                    )}
                </AnimatePresence>
            </Box>

            {/* Floating Scroll Button - Outside main container, only show when NOT in specialtonMode */}
            <AnimatePresence>
                {isVisible && !isCompact && !specialtonMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 200
                        }}
                    >
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <IconButton
                                aria-label="Scroll down to see more projects"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    scrollToBottom();
                                }}
                                sx={{
                                    width: 50,
                                    height: 50,
                                    bgcolor: THEME_COLORS.glassBg,
                                    color: THEME_COLORS.royalBlue,
                                    border: `2px solid ${THEME_COLORS.royalBlue}40`,
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        bgcolor: THEME_COLORS.royalBlue,
                                        color: 'white',
                                        transform: 'scale(1.1)'
                                    },
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <ChevronDown size={30} />
                            </IconButton>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export { ProjectsSection };
export default ProjectsSection;
