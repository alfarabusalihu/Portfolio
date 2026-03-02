'use client';

import { Box, Typography, Button, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import { THEME_COLORS } from '../theme/constants';
import { Github, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioData } from '../context/PortfolioDataContext';

interface Project {
    title: string;
    description: string;
    image: string;
    link: string;
    websiteLink?: string;
    tags: string[];
    isAutoSync?: boolean;
}

// Sort helper function
const sortProjects = (data: Project[]) => [...data].sort((a: any, b: any) => {
    if (a.websiteLink && !b.websiteLink) return -1;
    if (!a.websiteLink && b.websiteLink) return 1;
    return 0;
});

const ProjectCard = ({ project, isEngineerMode }: { project: Project, isEngineerMode: boolean }) => {
    const isMobile = useMediaQuery('(max-width:600px)');

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
                    borderRadius: isMobile ? '20px' : '28px',
                    border: isEngineerMode ? `2px solid ${THEME_COLORS.royalBlue}` : `1px solid ${THEME_COLORS.silver}30`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    boxShadow: isEngineerMode ? `0 0 20px ${THEME_COLORS.royalBlue}30` : '0 12px 40px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(12px)',
                    transition: 'border 0.3s ease'
                }}
            >
                {isEngineerMode && (
                    <Box sx={{ position: 'absolute', top: 0, right: 0, bgcolor: THEME_COLORS.royalBlue, px: 1.5, py: 0.5, borderBottomLeftRadius: '12px', zIndex: 10 }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: 'white', letterSpacing: 1 }}>ENGINEER_V3</Typography>
                    </Box>
                )}

                <Box sx={{ p: { xs: 3, md: 4 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 900, color: THEME_COLORS.royalBlue, textTransform: 'uppercase', fontSize: { xs: '0.9rem', md: '1.1rem' }, mb: 2, lineHeight: 1.2, letterSpacing: 1 }}>
                            {project.title}
                        </Typography>

                        <Typography variant="body2" sx={{ color: THEME_COLORS.silver, opacity: 0.9, fontSize: { xs: '0.8rem', md: '0.85rem' }, lineHeight: 1.6, mb: 3 }}>
                            {project.description}
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                            {project.tags.map(tag => (
                                <Typography key={tag} sx={{
                                    fontSize: '0.6rem',
                                    px: 1.5,
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

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            component={motion.a}
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View source code for ${project.title} on GitHub`}
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.95 }}
                            startIcon={<Github size={18} />}
                            sx={{
                                color: 'white',
                                fontWeight: 900,
                                fontSize: '0.75rem',
                                bgcolor: 'rgba(255,255,255,0.05)',
                                px: 3,
                                height: '42px',
                                minWidth: '110px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            REPO
                        </Button>
                        {project.websiteLink && (() => {
                            const isPortfolioItself = project.title === 'PORTFOLIO';
                            if (isPortfolioItself) {
                                return (
                                    <Tooltip title="You're already here! 🎉" placement="top" arrow>
                                        <span>
                                            <Button
                                                disabled
                                                startIcon={<Globe size={18} />}
                                                sx={{
                                                    color: 'rgba(255,255,255,0.3)',
                                                    fontWeight: 900,
                                                    fontSize: '0.75rem',
                                                    bgcolor: 'rgba(65,105,225,0.12)',
                                                    px: 3,
                                                    height: '42px',
                                                    minWidth: '110px',
                                                    borderRadius: '12px',
                                                    border: `1px dashed ${THEME_COLORS.royalBlue}50`,
                                                    cursor: 'not-allowed',
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
                                    startIcon={<Globe size={18} />}
                                    sx={{
                                        color: 'white',
                                        fontWeight: 900,
                                        fontSize: '0.75rem',
                                        bgcolor: THEME_COLORS.royalBlue,
                                        px: 3,
                                        height: '42px',
                                        minWidth: '110px',
                                        borderRadius: '12px',
                                        '&:hover': { bgcolor: THEME_COLORS.royalBlue, opacity: 0.9 }
                                    }}
                                >
                                    LIVE
                                </Button>
                            );
                        })()}
                    </Box>
                </Box>
            </motion.div>
        </Box>
    );
};

export const ProjectsSection = ({ isEngineerMode = false, isVisible = true }: { isEngineerMode?: boolean, isVisible?: boolean }) => {
    const { projects } = usePortfolioData();
    const sortedProjects = sortProjects(projects);

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
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <Box
                sx={{
                    width: '100%',
                    maxWidth: '1200px',
                    mx: 'auto',
                    py: { xs: 2, md: 4 },
                    pb: { xs: 15, md: 25 },
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)'
                    },
                    gap: { xs: 2, md: 3 },
                    alignItems: 'stretch'
                }}
            >
                {sortedProjects.map((p, idx) => (
                    <ProjectCard key={idx} project={p} isEngineerMode={isEngineerMode} />
                ))}
            </Box>

            {/* Floating Scroll Reminder Button - ONLY visible when section is active */}
            <AnimatePresence>
                {isVisible && (
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
        </Box>
    );
};
