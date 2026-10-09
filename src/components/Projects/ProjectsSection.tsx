'use client';

import React from 'react';
import { Box, useMediaQuery, IconButton } from '@mui/material';
import dynamic from 'next/dynamic';
import { THEME_COLORS } from '../../theme/constants';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioData } from '../../context/PortfolioDataContext';
import { ProjectCard } from './ProjectCard';
import { sortProjects, getAudioUrl } from './ProjectsUtils';
import type { ProjectsSectionProps } from '../../interfaces';

const TessStage = dynamic(() => import('../Tess/TessStage').then((module) => module.TessStage), {
    ssr: false,
    loading: () => (
        <Box sx={{ color: '#FFD760', fontSize: '0.75rem', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Loading Tess
        </Box>
    ),
});

const ProjectsSection = ({ specialtonMode = true, isVisible = false }: ProjectsSectionProps) => {
    const { projects } = usePortfolioData();
    const sortedProjects = sortProjects(projects);
    const isMobileOrTab = useMediaQuery('(max-width:1024px)');

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
                overflow: { xs: 'visible', lg: 'hidden' },
                flexDirection: { xs: 'column', lg: 'row' },
            }}>
                {/* Tess Panel - Mobile & Tablet Top Section (xs, sm, md: < 1200px) */}
                <AnimatePresence>
                    {specialtonMode && (
                        <Box
                            component={motion.aside}
                            aria-label="Tess project guide"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            sx={{
                                display: { xs: 'flex', lg: 'none' },
                                position: 'sticky',
                                top: 0,
                                width: '100%',
                                height: { xs: '240px', sm: '280px', md: '320px' },
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(180deg, ${THEME_COLORS.deepNavy} 0%, rgba(0, 8, 20, 0.95) 100%)`,
                                borderBottom: `1px solid ${THEME_COLORS.silver}20`,
                                overflow: 'hidden',
                                zIndex: 40,
                                flexShrink: 0,
                            }}
                        >
                            <TessStage />
                        </Box>
                    )}
                </AnimatePresence>

                {/* Main Column - Scrollable Projects */}
                <Box
                    sx={{
                        flex: specialtonMode ? { xs: 1, lg: '0 0 auto' } : 1,
                        minWidth: 0,
                        width: specialtonMode ? { xs: '100%', lg: 'calc(100% - 380px)', xl: 'calc(100% - 420px)' } : '100%',
                        minHeight: { xs: 'auto', lg: '100vh' },
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        py: { xs: 2, md: 4 },
                        pb: { xs: 15, md: 25 },
                        px: { xs: 2, sm: 3, md: 6 },
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
                                md: 'repeat(2, minmax(0, 1fr))',
                                lg: specialtonMode ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, 1fr)',
                                xl: specialtonMode ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, 1fr)'
                            },
                            gap: { xs: 2, md: 3 },
                            maxWidth: { xs: '100%', lg: specialtonMode ? '1000px' : '1400px' },
                            mx: 'auto',
                            justifyContent: 'center',
                        }}
                    >
                        {sortedProjects.map((p, idx) => {
                            const audioUrl = getAudioUrl(p.title);
                            
                            return (
                                <ProjectCard 
                                    key={idx} 
                                    project={p} 
                                    compact={specialtonMode}
                                    showSpeaker={specialtonMode}
                                    voiceUrl={audioUrl}
                                />
                            );
                        })}
                    </Box>
                </Box>

                {/* Right Column - Tess Side Panel (Desktop only: ≥ 1200px / lg) */}
                <AnimatePresence>
                    {specialtonMode && (
                        <Box
                            component={motion.aside}
                            aria-label="Tess project guide"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            sx={{
                                display: { xs: 'none', lg: 'flex' },
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                width: { lg: '380px', xl: '420px' },
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderLeft: `1px solid ${THEME_COLORS.silver}20`,
                                background: `linear-gradient(90deg, rgba(0, 8, 20, 0.3) 0%, ${THEME_COLORS.deepNavy} 40%, ${THEME_COLORS.deepNavy} 100%)`,
                                overflow: 'hidden',
                                zIndex: 30,
                                boxShadow: 'inset -40px 0 60px -20px rgba(255, 255, 255, 0.08), inset -20px 0 40px -10px rgba(150, 180, 255, 0.06)',
                            }}
                        >
                            <TessStage />
                        </Box>
                    )}
                </AnimatePresence>
            </Box>

            {/* Floating Scroll Button */}
            <AnimatePresence>
                {isVisible && !isMobileOrTab && !specialtonMode && (
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
